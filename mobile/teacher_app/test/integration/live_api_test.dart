// The app's data layer against the real school server and MySQL. Run it with
// tool/live_api_test.sh, which starts the server and seeds a class teacher
// (01711000007 / class5-secret, Class 5 Good: Rahim, Karim, Nadia). Without
// LIVE_API_URL it is skipped, so `flutter test` stays offline.
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:teacher_app/data/datasources/local_store.dart';
import 'package:teacher_app/data/datasources/session_store.dart';
import 'package:teacher_app/data/datasources/teacher_api.dart';
import 'package:teacher_app/data/repositories/teacher_app_repository.dart';
import 'package:teacher_app/domain/entities/attendance_status.dart';
import 'package:teacher_app/domain/entities/pending_day.dart';
import 'package:teacher_app/domain/errors.dart';

final _apiUrl = Platform.environment['LIVE_API_URL'];
final _adminToken = Platform.environment['LIVE_ADMIN_TOKEN'];

/// A real HTTP client that can be switched "offline", like a phone losing signal.
class SwitchableClient extends http.BaseClient {
  final _inner = http.Client();
  bool offline = false;

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    if (offline) throw const SocketException('no connection');
    return _inner.send(request);
  }
}

Future<Map<String, dynamic>> _admin(String path) async {
  final response = await http.get(Uri.parse('$_apiUrl/api$path'), headers: {'Authorization': 'Bearer $_adminToken'});
  expect(response.statusCode, 200, reason: response.body);
  return jsonDecode(response.body) as Map<String, dynamic>;
}

String _yesterday(String today) {
  final d = DateTime.parse('${today}T00:00:00Z').subtract(const Duration(days: 1));
  return d.toIso8601String().substring(0, 10);
}

void main() {
  sqfliteFfiInit();

  test('a class teacher takes attendance offline, syncs once, and parents of absent children get one SMS', () async {
    final client = SwitchableClient();
    final session = MemorySessionStore();
    final repository = TeacherAppRepository(
      store: await SqfliteLocalStore.open(databaseFactoryFfiNoIsolate, inMemoryDatabasePath),
      session: session,
      client: client,
      allowInsecureServer: true, // the test server is plain http on this machine
    );

    // Sign in (Bangla digits work) while online: the class list is kept on the phone.
    final profile = await repository.signIn(serverUrl: _apiUrl!, phone: '০১৭১১০০০০০৭', password: 'class5-secret');
    expect(profile.classes.map((c) => c.id), [10]);
    expect(profile.teacher.branch?.nameIn('bn'), 'নাটিয়াপাড়া');
    final today = profile.today;

    // Offline: take the day, two absent.
    client.offline = true;
    final roster = (await repository.roster(10, today)).value;
    expect(roster.students, hasLength(3));
    final saved = await repository.saveDay(roster, {
      101: AttendanceStatus.present,
      102: AttendanceStatus.absent,
      103: AttendanceStatus.absent,
    });
    expect(saved.synced, isFalse);

    // Back online: one sync sends it; a second changes nothing.
    client.offline = false;
    expect((await repository.syncPending()).sent, 1);
    expect((await repository.syncPending()).sent, 0);

    final day = (await _admin('/attendance/roster?classId=10&date=$today'))['data'] as Map<String, dynamic>;
    expect(day['takenBy'], containsPair('type', 'teacher'));
    expect(day['takenBy'], containsPair('name', 'Nasima Akter'));
    expect([for (final s in day['students'] as List) s['status']], ['Present', 'Absent', 'Absent']);

    // Only their own class, and only today (except a day the phone took that day).
    final api = TeacherApi(
      serverUrl: Uri.parse(_apiUrl!),
      client: client,
      token: await session.token(),
      language: 'en',
    );
    await expectLater(api.roster(11, today), throwsA(isA<ApiException>().having((e) => e.statusCode, 'status', 403)));
    final yesterday = _yesterday(today);
    PendingDay dayOn(String date, DateTime takenAt) => PendingDay(
          clientRef: 'live-$date',
          classId: 10,
          className: 'Class 5',
          section: 'Good',
          date: date,
          entries: const {101: AttendanceStatus.present, 102: AttendanceStatus.present, 103: AttendanceStatus.present},
          takenAt: takenAt,
        );
    await expectLater(
      api.saveDay(dayOn(yesterday, DateTime.now().toUtc())),
      throwsA(isA<ApiException>().having((e) => e.statusCode, 'status', 403)),
    );
    // 14:00 in Dhaka yesterday: an offline save from yesterday, synced today.
    await api.saveDay(dayOn(yesterday, DateTime.parse('${yesterday}T08:00:00Z')));

    // The SMS worker runs every minute; the delay is 0 for this run.
    List<dynamic> sms = const [];
    for (var i = 0; i < 18; i++) {
      sms = (await _admin('/attendance/sms?date=$today'))['data'] as List;
      if (sms.length == 2 && sms.every((m) => m['status'] == 'sent')) break;
      await Future<void>.delayed(const Duration(seconds: 5));
    }
    expect([for (final m in sms) '${m['studentId']}:${m['status']}'], ['102:sent', '103:sent']);
    expect((await _admin('/attendance/sms?date=$yesterday'))['data'], isEmpty);
  }, skip: _apiUrl == null ? 'set LIVE_API_URL (tool/live_api_test.sh)' : false, timeout: const Timeout(Duration(minutes: 3)));
}
