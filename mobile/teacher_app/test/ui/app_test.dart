import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:teacher_app/data/attendance_repository.dart';
import 'package:teacher_app/data/local_store.dart';
import 'package:teacher_app/data/session_store.dart';
import 'package:teacher_app/ui/app.dart';
import 'package:teacher_app/ui/app_controller.dart';

import '../support/fake_school_server.dart';

// 10:00 in Dhaka on 2026-03-10, the fake server's today.
final _now = DateTime.utc(2026, 3, 10, 4);

void main() {
  sqfliteFfiInit();

  late FakeSchoolServer school;
  late MemorySessionStore session;
  late AppController controller;

  Future<void> launch(WidgetTester tester, {String language = 'en'}) async {
    school = FakeSchoolServer();
    session = MemorySessionStore(language: language);
    final store = await SqfliteLocalStore.open(databaseFactoryFfiNoIsolate, inMemoryDatabasePath);
    final repository = AttendanceRepository(store: store, session: session, client: school.client, now: () => _now);
    controller = AppController(repository: repository, defaultServerUrl: 'https://school.test');
    await tester.pumpWidget(TeacherApp(controller: controller));
    await controller.start();
    await tester.pumpAndSettle();
  }

  Future<void> signIn(WidgetTester tester, {String password = 'class5-secret'}) async {
    await tester.enterText(find.widgetWithText(TextFormField, 'Mobile number'), '01711000001');
    await tester.enterText(find.widgetWithText(TextFormField, 'Password'), password);
    await tester.tap(find.widgetWithText(FilledButton, 'Sign in'));
    await tester.pumpAndSettle();
  }

  Future<void> openClass(WidgetTester tester) async {
    await tester.tap(find.text('Class 5 — Good'));
    await tester.pumpAndSettle();
  }

  Future<void> tapStatus(WidgetTester tester, String student, String status) async {
    await tester.tap(find.bySemanticsLabel('$student: $status'));
    await tester.pump();
  }

  testWidgets('signs in with the school server built in, and lists the teacher\'s classes', (tester) async {
    await launch(tester);

    expect(find.text('Teacher attendance'), findsWidgets);
    expect(find.widgetWithText(TextFormField, 'School server address'), findsNothing); // built into the APK
    await signIn(tester);

    expect(find.text('Hello, Nasima Akter'), findsOneWidget);
    expect(find.text('Class 5 — Good'), findsOneWidget);
    expect(find.text('Not taken'), findsOneWidget);
  });

  testWidgets('shows the server\'s reason for a wrong password', (tester) async {
    await launch(tester);

    await signIn(tester, password: 'wrong');

    expect(find.text('Wrong mobile number or password.'), findsOneWidget);
  });

  testWidgets('takes the day with one tap per student and saves it at once when online', (tester) async {
    await launch(tester);
    await signIn(tester);
    await openClass(tester);

    expect(find.text('Present 2 · Absent 0 · Late 0 · Leave 0'), findsOneWidget); // everyone starts present
    await tapStatus(tester, 'Karim Uddin', 'Absent');
    await tapStatus(tester, 'Rahim Uddin', 'Leave');
    expect(find.text('Present 0 · Absent 1 · Late 0 · Leave 1'), findsOneWidget);
    await tester.tap(find.widgetWithText(FilledButton, 'Save'));
    await tester.pumpAndSettle();

    expect(find.text('Attendance saved'), findsOneWidget);
    expect(school.saved['10:2026-03-10'], {101: 'Leave', 102: 'Absent'});
  });

  testWidgets('saves without a connection, shows the day as waiting, and sends it when asked', (tester) async {
    await launch(tester);
    await signIn(tester);
    school.offline = true;
    await openClass(tester);

    await tapStatus(tester, 'Karim Uddin', 'Absent');
    await tester.tap(find.widgetWithText(FilledButton, 'Save'));
    await tester.pumpAndSettle();

    expect(find.text('Saved on the phone. It will be sent when you are online.'), findsOneWidget);
    expect(find.text('Waiting to send'), findsOneWidget);
    expect(find.text('1 days waiting to be sent'), findsOneWidget);
    expect(school.saved, isEmpty);

    school.offline = false;
    await tester.tap(find.text('Send now'));
    await tester.pumpAndSettle();

    expect(school.saved['10:2026-03-10'], {101: 'Present', 102: 'Absent'});
    expect(find.text('Sent 1 days'), findsOneWidget);
    expect(find.text('Waiting to send'), findsNothing);
  });

  testWidgets('is in Bangla by default, with Bangla digits', (tester) async {
    await launch(tester, language: 'bn');
    await tester.enterText(find.widgetWithText(TextFormField, 'মোবাইল নম্বর'), '০১৭১১০০০০০১');
    await tester.enterText(find.widgetWithText(TextFormField, 'পাসওয়ার্ড'), 'class5-secret');
    await tester.tap(find.widgetWithText(FilledButton, 'সাইন ইন'));
    await tester.pumpAndSettle();
    await openClass(tester);

    expect(find.text('উপস্থিত ২ · অনুপস্থিত ০ · দেরিতে ০ · ছুটি ০'), findsOneWidget);
    expect(find.text('ছুটি'), findsNWidgets(2)); // one Leave button per student
  });

  testWidgets('switches language in the settings', (tester) async {
    await launch(tester);
    await signIn(tester);

    await tester.tap(find.byTooltip('Settings'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('বাংলা (Bangla)'));
    await tester.pumpAndSettle();

    expect(find.text('সেটিংস'), findsOneWidget);
    expect(await session.language(), 'bn');
  });

  testWidgets('signs out from the settings after asking', (tester) async {
    await launch(tester);
    await signIn(tester);

    await tester.tap(find.byTooltip('Settings'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Sign out').first);
    await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Sign out'));
    await tester.pumpAndSettle();

    expect(find.widgetWithText(FilledButton, 'Sign in'), findsOneWidget);
    expect(await session.token(), isNull);
  });
}
