import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:teacher_app/app/di.dart';
import 'package:teacher_app/data/datasources/local_store.dart';
import 'package:teacher_app/data/datasources/session_store.dart';
import 'package:teacher_app/data/repositories/teacher_app_repository.dart';
import 'package:teacher_app/presentation/app.dart';
import 'package:teacher_app/presentation/widgets/info_box.dart';

import '../support/fake_school_server.dart';

// 10:00 in Dhaka on 2026-03-10, the fake server's today.
final _now = DateTime.utc(2026, 3, 10, 4);

void main() {
  sqfliteFfiInit();

  late FakeSchoolServer school;
  late MemorySessionStore session;

  Future<void> launch(WidgetTester tester, {String language = 'en', bool branch = true}) async {
    // A phone screen: 360 × 780.
    tester.view.physicalSize = const Size(1080, 2340);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    school = FakeSchoolServer();
    if (!branch) school.branch = null;
    session = MemorySessionStore(language: language);
    final repository = TeacherAppRepository(
      store: await SqfliteLocalStore.open(databaseFactoryFfiNoIsolate, inMemoryDatabasePath),
      session: session,
      client: school.client,
      now: () => _now,
    );
    final deps = AppDependencies(
      sessionRepository: repository,
      attendanceRepository: repository,
      defaultServerUrl: 'https://school.test',
    );
    await tester.pumpWidget(TeacherApp(deps: deps));
    await deps.app.start();
    await tester.pumpAndSettle();
  }

  Future<void> signIn(WidgetTester tester, {String phone = 'Mobile number', String password = 'Password', String button = 'Sign in', String secret = 'class5-secret'}) async {
    await tester.enterText(find.widgetWithText(TextFormField, phone), '01711000001');
    await tester.enterText(find.widgetWithText(TextFormField, password), secret);
    await tester.tap(find.widgetWithText(FilledButton, button));
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

  /// The number on the count tile labelled [label].
  String countOf(WidgetTester tester, String label) =>
      tester.widgetList<CountTile>(find.byType(CountTile)).firstWhere((tile) => tile.label == label).value;

  Future<void> openMenuItem(WidgetTester tester, String item) async {
    await tester.tap(find.byTooltip('Open navigation menu'));
    await tester.pumpAndSettle();
    await tester.tap(find.text(item));
    await tester.pumpAndSettle();
  }

  testWidgets('signs in with the school server built in, and shows the day\'s classes', (tester) async {
    await launch(tester);

    expect(find.text('Sign in to start taking attendance'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'School server address'), findsNothing); // built into the APK
    await signIn(tester);

    expect(find.text("Today's attendance"), findsOneWidget);
    expect(find.text('Class 5 — Good'), findsOneWidget);
    expect(find.text('Not taken'), findsWidgets);
  });

  testWidgets('shows the school family\'s name on the sign-in page', (tester) async {
    await launch(tester);

    expect(find.text('Star Shiksha Paribar'), findsOneWidget);
  });

  testWidgets('shows the teacher\'s branch with the date on Today, under their name in the menu, and in the settings', (tester) async {
    await launch(tester);
    await signIn(tester);

    expect(find.text('Mirzapur Branch · Today is March 10, 2026'), findsOneWidget);

    await tester.tap(find.byTooltip('Open navigation menu'));
    await tester.pumpAndSettle();
    expect(find.descendant(of: find.byType(Drawer), matching: find.text('Nasima Akter')), findsOneWidget);
    expect(find.descendant(of: find.byType(Drawer), matching: find.text('Mirzapur Branch')), findsOneWidget);
    expect(find.descendant(of: find.byType(Drawer), matching: find.text('Online')), findsOneWidget);
    expect(find.descendant(of: find.byType(Drawer), matching: find.text('Star Shiksha Paribar')), findsOneWidget);

    await tester.tap(find.text('Settings'));
    await tester.pumpAndSettle();
    expect(find.text('Mirzapur Branch'), findsOneWidget);
    expect(find.byTooltip('Branch'), findsOneWidget);
  });

  testWidgets('shows the branch\'s Bangla name in Bangla', (tester) async {
    await launch(tester, language: 'bn');
    expect(find.text('স্টার শিক্ষা পরিবার'), findsOneWidget);
    await signIn(tester, phone: 'মোবাইল নম্বর', password: 'পাসওয়ার্ড', button: 'সাইন ইন');

    expect(find.textContaining('মির্জাপুর শাখা · আজ'), findsOneWidget);
  });

  testWidgets('shows only the date on Today when an older server sends no branch', (tester) async {
    await launch(tester, branch: false);
    await signIn(tester);

    expect(find.text('Today is March 10, 2026'), findsOneWidget);
  });

  testWidgets('shows the server\'s reason for a wrong password', (tester) async {
    await launch(tester);

    await signIn(tester, secret: 'wrong');

    expect(find.text('Wrong mobile number or password.'), findsOneWidget);
  });

  testWidgets('takes the day with one tap per student and saves it at once when online', (tester) async {
    await launch(tester);
    await signIn(tester);
    await openClass(tester);

    expect(countOf(tester, 'Present'), '2'); // everyone starts present
    await tapStatus(tester, 'Karim Uddin', 'Absent');
    await tapStatus(tester, 'Rahim Uddin', 'Leave');
    expect([countOf(tester, 'Present'), countOf(tester, 'Absent'), countOf(tester, 'Leave')], ['0', '1', '1']);
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
    expect(find.text('Waiting to be sent: 1'), findsOneWidget);
    expect(school.saved, isEmpty);

    school.offline = false;
    await tester.tap(find.text('Send now'));
    await tester.pumpAndSettle();

    expect(school.saved['10:2026-03-10'], {101: 'Present', 102: 'Absent'});
    expect(find.text('Sent: 1'), findsOneWidget);
    expect(find.text('Waiting to send'), findsNothing);
  });

  testWidgets('is in Bangla by default, with Bangla digits', (tester) async {
    await launch(tester, language: 'bn');
    await signIn(tester, phone: 'মোবাইল নম্বর', password: 'পাসওয়ার্ড', button: 'সাইন ইন');
    await openClass(tester);

    expect(countOf(tester, 'উপস্থিত'), '২');
    expect(find.bySemanticsLabel('Karim Uddin: ছুটি'), findsOneWidget);
  });

  testWidgets('switches language in the settings, opened from the menu', (tester) async {
    await launch(tester);
    await signIn(tester);

    await openMenuItem(tester, 'Settings');
    await tester.tap(find.text('বাংলা (Bangla)'));
    await tester.pumpAndSettle();

    expect(find.text('সেটিংস'), findsWidgets);
    expect(await session.language(), 'bn');
  });

  testWidgets('signs out from the settings after asking', (tester) async {
    await launch(tester);
    await signIn(tester);

    await openMenuItem(tester, 'Settings');
    await tester.tap(find.widgetWithText(FilledButton, 'Sign out'));
    await tester.pumpAndSettle();
    await tester.tap(find.descendant(of: find.byType(AlertDialog), matching: find.widgetWithText(FilledButton, 'Sign out')));
    await tester.pumpAndSettle();

    expect(find.text('Sign in to start taking attendance'), findsOneWidget);
    expect(await session.token(), isNull);
  });
}
