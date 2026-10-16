import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

/// A stand-in for the school server's teacher app API, enough for the app's
/// tests: one teacher (01711000001 / class5-secret) with Class 5 Good.
/// [offline] makes every request fail as if there were no connection.
class FakeSchoolServer {
  FakeSchoolServer({this.today = '2026-03-10'});

  final String today;
  bool offline = false;
  String token = 'token-1';

  /// Saved days: "classId:date" → { studentId: status }.
  final saved = <String, Map<int, String>>{};
  final saveBodies = <Map<String, dynamic>>[];

  /// Status code to answer the next save with, instead of saving.
  int? refuseNextSave;

  final students = [
    {'studentId': 101, 'firstName': 'Rahim', 'lastName': 'Uddin', 'roll': '1'},
    {'studentId': 102, 'firstName': 'Karim', 'lastName': 'Uddin', 'roll': '2'},
  ];

  late final http.Client client = MockClient(_handle);

  Map<String, dynamic> get _profile => {
        'teacher': {'id': 7, 'firstName': 'Nasima', 'lastName': 'Akter', 'phone': '01711000001'},
        'today': today,
        'classes': [
          {'id': 10, 'name': 'Class 5', 'section': 'Good', 'students': 2, 'taken': saved.containsKey('10:$today'), 'takenAt': null},
        ],
      };

  Map<String, dynamic> _roster(String date) => {
        'class': {'id': 10, 'name': 'Class 5', 'section': 'Good', 'branchId': 1},
        'date': date,
        'editable': date == today,
        'takenBy': null,
        'students': [
          for (final s in students) {...s, 'status': saved['10:$date']?[s['studentId']]},
        ],
      };

  http.Response _json(int status, Object body) =>
      http.Response.bytes(utf8.encode(jsonEncode(body)), status, headers: {'content-type': 'application/json'});

  Future<http.Response> _handle(http.Request request) async {
    if (offline) throw const SocketException('no connection');
    final path = request.url.path.replaceFirst('/api/teacher-app/v1', '');
    if (path == '/login') {
      final body = jsonDecode(request.body) as Map<String, dynamic>;
      if (body['phone'] != '01711000001' || body['password'] != 'class5-secret') {
        return _json(401, {'success': false, 'message': 'Wrong mobile number or password.'});
      }
      return _json(200, {'success': true, 'data': {'token': token, ..._profile}});
    }
    if (request.headers['Authorization'] != 'Bearer $token') {
      return _json(401, {'success': false, 'message': 'You have been signed out.'});
    }
    if (path == '/me') return _json(200, {'success': true, 'data': _profile});
    final roster = RegExp(r'^/classes/10/roster$').firstMatch(path);
    if (roster != null) return _json(200, {'success': true, 'data': _roster(request.url.queryParameters['date']!)});
    final save = RegExp(r'^/classes/10/attendance/(\d{4}-\d{2}-\d{2})$').firstMatch(path);
    if (save != null && request.method == 'PUT') {
      if (refuseNextSave != null) {
        final status = refuseNextSave!;
        refuseNextSave = null;
        return _json(status, {'success': false, 'message': 'Teachers can take today\'s attendance only.'});
      }
      final body = jsonDecode(request.body) as Map<String, dynamic>;
      saveBodies.add(body);
      final date = save.group(1)!;
      saved['10:$date'] = {for (final e in body['entries'] as List) e['studentId'] as int: e['status'] as String};
      return _json(200, {'success': true, 'data': {..._roster(date), 'kept': []}});
    }
    if (path == '/password') {
      token = 'token-2';
      return _json(200, {'success': true, 'data': {'token': token}});
    }
    return _json(404, {'success': false, 'message': 'Not found'});
  }
}
