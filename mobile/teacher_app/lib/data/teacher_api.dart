import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import '../domain/attendance.dart';

/// The server answered, but refused: [message] is its reason, already in the
/// teacher's language.
class ApiException implements Exception {
  const ApiException(this.statusCode, this.message);

  final int statusCode;
  final String message;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// The server could not be reached (no connection, timeout, DNS, TLS...).
class OfflineException implements Exception {
  const OfflineException();
}

/// The school server's address as typed by an admin or teacher, e.g.
/// "school.example.com" → https://school.example.com. A trailing "/api" is
/// dropped. Plain http is refused unless [allowInsecure] (debug builds),
/// because the password travels with each sign-in.
Uri parseServerUrl(String input, {bool allowInsecure = false}) {
  var text = input.trim();
  if (text.isEmpty) throw const FormatException('empty');
  if (!text.contains('://')) text = 'https://$text';
  final uri = Uri.tryParse(text);
  if (uri == null || uri.host.isEmpty || !(uri.scheme == 'https' || uri.scheme == 'http')) {
    throw const FormatException('not a web address');
  }
  if (uri.scheme == 'http' && !allowInsecure) throw const FormatException('not https');
  var path = uri.path.replaceAll(RegExp(r'/+$'), '');
  if (path.endsWith('/api')) path = path.substring(0, path.length - 4);
  return uri.replace(path: path, query: null, fragment: null);
}

/// The teacher app API of the school server (/api/teacher-app/v1).
class TeacherApi {
  TeacherApi({
    required this.serverUrl,
    required this._client,
    this.token,
    this.language = 'bn',
    this.timeout = const Duration(seconds: 20),
  });

  final Uri serverUrl;
  final String? token;
  final String language;
  final Duration timeout;
  final http.Client _client;

  Uri _url(String path, [Map<String, String>? query]) => serverUrl.replace(
        path: '${serverUrl.path}/api/teacher-app/v1$path',
        queryParameters: query,
      );

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': language,
        if (token != null) 'Authorization': 'Bearer $token',
      };

  Future<Map<String, dynamic>> _send(Future<http.Response> Function() request) async {
    final http.Response response;
    try {
      response = await request().timeout(timeout);
    } on SocketException {
      throw const OfflineException();
    } on TimeoutException {
      throw const OfflineException();
    } on HandshakeException {
      throw const OfflineException();
    } on http.ClientException {
      throw const OfflineException();
    }
    Map<String, dynamic> body;
    try {
      body = jsonDecode(utf8.decode(response.bodyBytes)) as Map<String, dynamic>;
    } catch (_) {
      body = const {};
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(response.statusCode, body['message'] as String? ?? 'HTTP ${response.statusCode}');
    }
    return (body['data'] as Map<String, dynamic>?) ?? const {};
  }

  /// { token, teacher, today, classes }
  Future<Map<String, dynamic>> login(String phone, String password) => _send(
        () => _client.post(_url('/login'), headers: _headers, body: jsonEncode({'phone': phone, 'password': password})),
      );

  Future<Profile> me() async => Profile.fromJson(await _send(() => _client.get(_url('/me'), headers: _headers)));

  Future<Roster> roster(int classId, String date) async => Roster.fromJson(
        await _send(() => _client.get(_url('/classes/$classId/roster', {'date': date}), headers: _headers)),
      );

  /// The day as saved, with `kept`: students someone changed later (their newer status stays).
  Future<({Roster roster, List<int> kept})> saveDay(PendingDay day) async {
    final data = await _send(
      () => _client.put(
        _url('/classes/${day.classId}/attendance/${day.date}'),
        headers: _headers,
        body: jsonEncode(day.requestBody()),
      ),
    );
    return (roster: Roster.fromJson(data), kept: [for (final id in data['kept'] as List? ?? const []) id as int]);
  }

  /// A new token: changing the password signs out every other phone.
  Future<String> changePassword(String current, String next) async {
    final data = await _send(
      () => _client.post(_url('/password'), headers: _headers, body: jsonEncode({'current': current, 'next': next})),
    );
    return data['token'] as String;
  }
}
