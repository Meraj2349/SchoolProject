import 'dart:async';

import 'package:flutter_test/flutter_test.dart';
import 'package:teacher_app/domain/entities/attendance_status.dart';
import 'package:teacher_app/domain/errors.dart';
import 'package:teacher_app/domain/repositories/attendance_repository.dart';
import 'package:teacher_app/domain/usecases/attendance_use_cases.dart';
import 'package:teacher_app/domain/usecases/session_use_cases.dart';
import 'package:teacher_app/presentation/viewmodels/app_view_model.dart';
import 'package:teacher_app/presentation/viewmodels/settings_view_model.dart';
import 'package:teacher_app/presentation/viewmodels/sign_in_view_model.dart';
import 'package:teacher_app/presentation/viewmodels/take_attendance_view_model.dart';
import 'package:teacher_app/presentation/viewmodels/today_view_model.dart';

import '../support/fake_repositories.dart';

const today = '2026-03-10';
const p = AttendanceStatus.present, a = AttendanceStatus.absent, l = AttendanceStatus.leave;

void main() {
  late FakeSessionRepository session;
  late FakeAttendanceRepository attendance;
  late AppViewModel app;

  setUp(() async {
    session = FakeSessionRepository();
    attendance = FakeAttendanceRepository();
    app = AppViewModel(
      restore: RestoreSession(session),
      changeLanguage: ChangeLanguage(session),
      defaultServerUrl: 'https://school.test',
    );
    await app.start();
  });

  group('AppViewModel', () {
    test('starts signed out, in Bangla, with the built-in server', () {
      expect(app.phase, AppPhase.signedOut);
      expect(app.language, 'bn');
      expect(app.serverForSignIn, 'https://school.test');
    });

    test('keeps the chosen language', () async {
      await app.setLanguage('en');

      expect(app.language, 'en');
      expect(session.language, 'en');
    });

    test('remembers when the server signed the teacher out', () {
      app.signedIn();
      app.signedOut(byServer: true);

      expect(app.phase, AppPhase.signedOut);
      expect(app.signedOutByServer, isTrue);
    });
  });

  group('SignInViewModel', () {
    late SignInViewModel signIn;
    setUp(() => signIn = SignInViewModel(signIn: SignIn(session), app: app));

    test('signs in and moves the app on', () async {
      await signIn.submit(server: 'https://school.test', phone: '01711000001', password: 'class5-secret');

      expect(app.phase, AppPhase.signedIn);
      expect(signIn.error, isNull);
    });

    test('accepts only https school servers, unless the build allows plain http', () {
      final debug = SignInViewModel(signIn: SignIn(session), app: app, allowInsecureServer: true);

      expect(signIn.isValidServer('school.example.com'), isTrue);
      expect(signIn.isValidServer('http://192.168.0.10:3000'), isFalse);
      expect(debug.isValidServer('http://192.168.0.10:3000'), isTrue);
      expect(signIn.isValidServer(''), isFalse);
    });

    test('tells a refusal, no connection and a bad address apart', () async {
      session.failWith = const ApiException(401, 'Wrong mobile number or password.');
      await signIn.submit(server: 's', phone: '1', password: 'x');
      expect(signIn.error, const SignInError.refused('Wrong mobile number or password.'));

      session.failWith = const OfflineException();
      await signIn.submit(server: 's', phone: '1', password: 'x');
      expect(signIn.error, const SignInError.offline());

      session.failWith = const FormatException('not https');
      await signIn.submit(server: 's', phone: '1', password: 'x');
      expect(signIn.error, const SignInError.badServer());
      expect(app.phase, AppPhase.signedOut);
      expect(signIn.busy, isFalse);
    });
  });

  group('TodayViewModel', () {
    late StreamController<bool> online;
    late TodayViewModel todayVm;

    setUp(() {
      app.signedIn();
      online = StreamController<bool>();
      attendance.loadedProfile = Loaded(profileOn(today), fresh: true);
      todayVm = TodayViewModel(
        loadToday: LoadToday(attendance),
        syncPending: SyncPendingDays(attendance),
        discardPending: DiscardPendingDay(attendance),
        app: app,
        onlineChanges: online.stream,
      );
    });
    tearDown(() => online.close());

    test('loads the classes of the day', () async {
      await todayVm.load();

      expect(todayVm.overview!.classes.map((c) => c.schoolClass.label), ['Class 5 — Good', 'Class 6 — Good']);
      expect(todayVm.loading, isFalse);
    });

    test('sends waiting days when the connection comes back', () async {
      attendance.nextSync = const SyncReport(sent: 1);
      await todayVm.load();

      online.add(true);
      await pumpEventQueue();

      expect(todayVm.lastSent, 1);
    });

    test('says when nothing is on the phone yet and there is no connection', () async {
      attendance.loadedProfile = null;

      await todayVm.load();

      expect(todayVm.overview, isNull);
      expect(todayVm.offlineWithoutCopy, isTrue);
    });

    test('hands the app back to sign-in when the server signed the teacher out', () async {
      attendance.failWith = const SignedOutException();

      await todayVm.load();

      expect(app.phase, AppPhase.signedOut);
      expect(app.signedOutByServer, isTrue);
    });

    test('discards a refused day', () async {
      attendance.pending = [pendingOn('2026-03-08', {101: a}, refusal: 'Locked')];
      await todayVm.load();

      await todayVm.discard(todayVm.overview!.refused.single);

      expect(todayVm.overview!.refused, isEmpty);
    });
  });

  group('TakeAttendanceViewModel', () {
    TakeAttendanceViewModel build() => TakeAttendanceViewModel(
          openClassDay: OpenClassDay(attendance),
          saveClassDay: SaveClassDay(attendance),
          app: app,
          classId: 10,
          date: today,
        );

    setUp(() {
      app.signedIn();
      attendance.rosters['10:$today'] = Loaded(rosterOf(today), fresh: true);
    });

    test('starts everyone present and counts as statuses change', () async {
      final vm = build();
      await vm.load();

      vm.setStatus(102, a);
      expect(vm.statusOf(102), a);
      expect([vm.counts.present, vm.counts.absent], [1, 1]);

      vm.markAllPresent();
      expect(vm.counts.present, 2);
    });

    test('reports where the day went: saved, kept on the phone, or refused with the reason', () async {
      final vm = build();
      await vm.load();
      vm.setStatus(101, l);

      expect(await vm.save(), const SaveOutcome.saved(kept: 0));
      expect(attendance.saved.single, {101: l, 102: p});

      attendance.nextSave = SaveResult(synced: false, roster: rosterOf(today));
      expect(await vm.save(), const SaveOutcome.keptOnPhone());

      attendance.failWith = const ApiException(403, 'Locked');
      expect(await vm.save(), const SaveOutcome.refused('Locked'));
    });

    test('says when the class list is not on the phone and there is no connection', () async {
      attendance.rosters.clear();
      final vm = build();

      await vm.load();

      expect(vm.state, ClassDayLoad.noCopy);
    });

    test('cannot change a day the server locked', () async {
      attendance.rosters['10:$today'] = Loaded(rosterOf(today, editable: false), fresh: true);
      final vm = build();
      await vm.load();

      vm.setStatus(101, a);

      expect(vm.editable, isFalse);
      expect(vm.statusOf(101), p);
    });
  });

  group('SettingsViewModel', () {
    late SettingsViewModel settings;
    setUp(() {
      app.signedIn();
      settings = SettingsViewModel(changePassword: ChangePassword(session), signOut: SignOut(session), app: app);
    });

    test('changes the password, and refuses a short one before asking the server', () async {
      expect(await settings.changePassword(current: 'old-pass', next: 'short'), const PasswordOutcome.tooShort());
      expect(await settings.changePassword(current: 'old-pass', next: 'a-new-password'), const PasswordOutcome.changed());
      expect(session.passwordChanges, hasLength(1));
    });

    test('passes on the server\'s reason for a wrong current password', () async {
      session.failWith = const ApiException(400, 'The current password is wrong.');

      expect(
        await settings.changePassword(current: 'nope', next: 'a-new-password'),
        const PasswordOutcome.refused('The current password is wrong.'),
      );
    });

    test('signs out on purpose', () async {
      await settings.signOut();

      expect(app.phase, AppPhase.signedOut);
      expect(app.signedOutByServer, isFalse);
      expect(session.signedIn, isFalse);
    });
  });
}
