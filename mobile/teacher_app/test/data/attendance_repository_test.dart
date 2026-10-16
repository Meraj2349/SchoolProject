import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:teacher_app/data/datasources/local_store.dart';
import 'package:teacher_app/data/datasources/session_store.dart';
import 'package:teacher_app/data/repositories/teacher_app_repository.dart';
import 'package:teacher_app/domain/entities/attendance_status.dart';
import 'package:teacher_app/domain/entities/teacher.dart';
import 'package:teacher_app/domain/errors.dart';

import '../support/fake_school_server.dart';

const _server = 'https://school.test';
// 10:00 in Dhaka on 2026-03-10.
final _start = DateTime.utc(2026, 3, 10, 4);

void main() {
  sqfliteFfiInit();

  late FakeSchoolServer school;
  late MemorySessionStore session;
  late LocalStore store;
  late TeacherAppRepository repository;
  late DateTime now;
  var refs = 0;

  setUp(() async {
    now = _start;
    school = FakeSchoolServer();
    session = MemorySessionStore();
    store = await SqfliteLocalStore.open(databaseFactoryFfiNoIsolate, inMemoryDatabasePath);
    repository = TeacherAppRepository(
      store: store,
      session: session,
      client: school.client,
      now: () => now,
      newClientRef: () => 'ref-${++refs}',
    );
  });

  Future<Profile> signIn() => repository.signIn(serverUrl: _server, phone: '০১৭১১০০০০০১', password: 'class5-secret');

  Map<int, AttendanceStatus> day(AttendanceStatus rahim, AttendanceStatus karim) => {101: rahim, 102: karim};

  group('signing in', () {
    test('keeps the token and the server address, and caches today\'s class lists', () async {
      final profile = await signIn();

      expect(profile.teacher.fullName, 'Nasima Akter');
      expect(await session.token(), 'token-1');
      expect(await session.serverUrl(), _server);
      expect((await store.roster(10, '2026-03-10'))!.students, hasLength(2));
      expect(await repository.isSignedIn(), isTrue);
    });

    test('passes on the server\'s reason for a wrong password', () async {
      await expectLater(
        repository.signIn(serverUrl: _server, phone: '01711000001', password: 'wrong'),
        throwsA(isA<ApiException>().having((e) => e.message, 'message', 'Wrong mobile number or password.')),
      );
      expect(await session.token(), isNull);
    });

    test('refuses a server address that is not https', () async {
      await expectLater(
        repository.signIn(serverUrl: 'http://school.test', phone: '01711000001', password: 'class5-secret'),
        throwsFormatException,
      );
    });
  });

  group('without a connection', () {
    setUp(() async {
      await signIn();
      school.offline = true;
    });

    test('shows the last profile and class list it loaded', () async {
      final profile = await repository.profile();
      final roster = await repository.roster(10, '2026-03-10');

      expect(profile.fresh, isFalse);
      expect(profile.value.classes.single.name, 'Class 5');
      expect(roster.fresh, isFalse);
      expect(roster.value.students.map((s) => s.fullName), ['Rahim Uddin', 'Karim Uddin']);
    });

    test('keeps a saved day on the phone, with when it was taken, and shows it in the class list', () async {
      final roster = (await repository.roster(10, '2026-03-10')).value;

      final result = await repository.saveDay(roster, day(AttendanceStatus.absent, AttendanceStatus.present));

      expect(result.synced, isFalse);
      final pending = await repository.pendingDays();
      expect(pending.single.takenAt, _start);
      expect(pending.single.entries, day(AttendanceStatus.absent, AttendanceStatus.present));
      final cached = (await repository.roster(10, '2026-03-10')).value;
      expect(cached.students.map((s) => s.status), [AttendanceStatus.absent, AttendanceStatus.present]);
    });

    test('after a night offline, shows today with nothing taken and lets the teacher take it from yesterday\'s list', () async {
      now = _start.add(const Duration(days: 1)); // 10:00 the next morning, still no connection

      final profile = (await repository.profile()).value;
      final roster = (await repository.roster(10, profile.today)).value;
      await repository.saveDay(roster, day(AttendanceStatus.present, AttendanceStatus.absent));

      expect(profile.today, '2026-03-11');
      expect(profile.classes.single.taken, isFalse);
      expect(roster.date, '2026-03-11');
      expect(roster.editable, isTrue);
      expect(roster.students.map((s) => s.status), [null, null]);
      expect((await repository.pendingDays()).single.date, '2026-03-11');
    });

    test('keeps only the newest save of a class\'s day', () async {
      final roster = (await repository.roster(10, '2026-03-10')).value;

      await repository.saveDay(roster, day(AttendanceStatus.absent, AttendanceStatus.absent));
      await repository.saveDay(roster, day(AttendanceStatus.present, AttendanceStatus.late));

      final pending = await repository.pendingDays();
      expect(pending.single.entries, day(AttendanceStatus.present, AttendanceStatus.late));
    });
  });

  group('syncing', () {
    setUp(signIn);

    test('sends what was saved offline, with the time it was taken, once', () async {
      school.offline = true;
      final roster = (await repository.roster(10, '2026-03-10')).value;
      await repository.saveDay(roster, day(AttendanceStatus.absent, AttendanceStatus.present));
      school.offline = false;

      final report = await repository.syncPending();
      final again = await repository.syncPending();

      expect(report.sent, 1);
      expect(again.sent, 0);
      expect(school.saved['10:2026-03-10'], {101: 'Absent', 102: 'Present'});
      expect(school.saveBodies.single['takenAt'], '2026-03-10T04:00:00.000Z');
      expect(await repository.pendingDays(), isEmpty);
    });

    test('stops at once while still offline, keeping the day', () async {
      school.offline = true;
      final roster = (await repository.roster(10, '2026-03-10')).value;
      await repository.saveDay(roster, day(AttendanceStatus.absent, AttendanceStatus.present));

      final report = await repository.syncPending();

      expect(report.offline, isTrue);
      expect(await repository.pendingDays(), hasLength(1));
    });

    test('keeps a day the server refuses, with its reason, and does not send it again', () async {
      school.offline = true;
      final roster = (await repository.roster(10, '2026-03-10')).value;
      await repository.saveDay(roster, day(AttendanceStatus.absent, AttendanceStatus.present));
      school.offline = false;
      school.refuseNextSave = 403;

      final report = await repository.syncPending();
      await repository.syncPending();

      expect(report.refused.single.refusal, "Teachers can take today's attendance only.");
      expect(school.saveBodies, isEmpty);
      final pending = await repository.pendingDays();
      expect(pending.single.isRefused, isTrue);

      await repository.discard(pending.single.clientRef);
      expect(await repository.pendingDays(), isEmpty);
    });

    test('keeps the day for later when the server cannot take it right now', () async {
      final roster = (await repository.roster(10, '2026-03-10')).value;
      school.refuseNextSave = 503;

      final result = await repository.saveDay(roster, day(AttendanceStatus.absent, AttendanceStatus.present));

      expect(result.synced, isFalse);
      expect(await repository.pendingDays(), hasLength(1));
    });

    test('keeps the day when the sign-in was revoked meanwhile, then signs out', () async {
      final roster = (await repository.roster(10, '2026-03-10')).value;
      school.token = 'reset-by-admin';

      await expectLater(
        repository.saveDay(roster, day(AttendanceStatus.absent, AttendanceStatus.present)),
        throwsA(isA<SignedOutException>()),
      );
      expect(await repository.pendingDays(), hasLength(1));
    });

    test('saves straight away when online', () async {
      final roster = (await repository.roster(10, '2026-03-10')).value;

      final result = await repository.saveDay(roster, day(AttendanceStatus.leave, AttendanceStatus.present));

      expect(result.synced, isTrue);
      expect(school.saved['10:2026-03-10'], {101: 'Leave', 102: 'Present'});
      expect(await repository.pendingDays(), isEmpty);
    });
  });

  group('signing out', () {
    setUp(signIn);

    test('a revoked token signs out but keeps unsent days for the next sign-in', () async {
      school.offline = true;
      final roster = (await repository.roster(10, '2026-03-10')).value;
      await repository.saveDay(roster, day(AttendanceStatus.absent, AttendanceStatus.present));
      school.offline = false;
      school.token = 'reset-by-admin';

      await expectLater(repository.syncPending(), throwsA(isA<SignedOutException>()));

      expect(await repository.isSignedIn(), isFalse);
      expect(await repository.pendingDays(), hasLength(1));
    });

    test('signing out on purpose forgets everything on the phone', () async {
      await repository.signOut();

      expect(await repository.isSignedIn(), isFalse);
      expect(await store.profile(), isNull);
      expect(await session.serverUrl(), _server); // remembered for the next sign-in
    });

    test('changing the password keeps this phone signed in with the new token', () async {
      await repository.changePassword('class5-secret', 'a-new-password');

      expect(await session.token(), 'token-2');
    });
  });
}
