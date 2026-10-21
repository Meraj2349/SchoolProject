import 'package:flutter_test/flutter_test.dart';
import 'package:teacher_app/domain/entities/attendance_status.dart';
import 'package:teacher_app/domain/repositories/attendance_repository.dart';
import 'package:teacher_app/domain/entities/day_overview.dart';
import 'package:teacher_app/domain/usecases/attendance_use_cases.dart';
import 'package:teacher_app/domain/usecases/session_use_cases.dart';

import '../support/fake_repositories.dart';

const today = '2026-03-10';
const p = AttendanceStatus.present, a = AttendanceStatus.absent, l = AttendanceStatus.leave;

void main() {
  late FakeAttendanceRepository attendance;

  setUp(() => attendance = FakeAttendanceRepository());

  group('LoadToday', () {
    test('gives each class its state today: waiting to send, taken, or not taken', () async {
      attendance.loadedProfile = Loaded(profileOn(today, taken: true, takenAt: DateTime.utc(2026, 3, 10, 3, 15)), fresh: true);
      attendance.pending = [pendingOn(today, {101: a}, classId: 11)];

      final overview = await LoadToday(attendance)();

      expect(overview.today, today);
      expect(overview.online, isTrue);
      expect(overview.classes.map((c) => c.state), [ClassDayState.taken, ClassDayState.waiting]);
      expect(overview.classes.first.takenAt, DateTime.utc(2026, 3, 10, 3, 15));
      expect(overview.waiting, 1);
    });

    test('lists the days the server refused apart from the ones waiting', () async {
      attendance.loadedProfile = Loaded(profileOn(today), fresh: false);
      attendance.pending = [pendingOn('2026-03-08', {101: a}, refusal: 'Locked')];

      final overview = await LoadToday(attendance)();

      expect(overview.online, isFalse);
      expect(overview.waiting, 0);
      expect(overview.refused.single.refusal, 'Locked');
      expect(overview.classes.first.state, ClassDayState.notTaken);
    });
  });

  group('OpenClassDay', () {
    test('starts everyone as present, keeps what was saved, and shows a save still waiting on the phone', () async {
      attendance.rosters['10:$today'] = Loaded(rosterOf(today, statuses: {102: l}), fresh: true);

      final saved = await OpenClassDay(attendance)(classId: 10, date: today);
      attendance.pending = [pendingOn(today, {101: a, 102: p})];
      final waiting = await OpenClassDay(attendance)(classId: 10, date: today);

      expect(saved.statuses, {101: p, 102: l});
      expect(saved.hasWaitingSave, isFalse);
      expect(waiting.statuses, {101: a, 102: p});
      expect(waiting.hasWaitingSave, isTrue);
    });
  });

  group('SaveClassDay', () {
    test('saves every student\'s status of the day', () async {
      final day = rosterOf(today);

      await SaveClassDay(attendance)(roster: day, statuses: {101: a, 102: p});

      expect(attendance.saved.single, {101: a, 102: p});
    });
  });

  group('session', () {
    late FakeSessionRepository session;
    setUp(() => session = FakeSessionRepository()..language = 'en');

    test('restores the sign-in, server and language, with Bangla when none was chosen', () async {
      session
        ..signedIn = true
        ..server = 'https://school.test';
      expect(await RestoreSession(session)(), (signedIn: true, serverUrl: 'https://school.test', language: 'en'));

      session.language = null;
      expect((await RestoreSession(session)()).language, 'bn');
    });

    test('accepts a new password of 8 characters or more only', () async {
      expect(ChangePassword.isAcceptable('1234567'), isFalse);
      expect(ChangePassword.isAcceptable('12345678'), isTrue);

      await ChangePassword(session)(current: 'old-pass', next: 'new-password');
      expect(session.passwordChanges.single, ('old-pass', 'new-password'));
    });
  });
}
