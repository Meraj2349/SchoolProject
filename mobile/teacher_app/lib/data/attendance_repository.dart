import 'dart:math';

import 'package:http/http.dart' as http;

import '../domain/attendance.dart';
import 'local_store.dart';
import 'session_store.dart';
import 'teacher_api.dart';

/// The server no longer accepts this phone's sign-in (access switched off,
/// password reset): the teacher has to sign in again.
class SignedOutException implements Exception {
  const SignedOutException();
}

/// A value, and whether it came from the server just now ([fresh]) or from the
/// phone's copy because the server could not be reached.
class Loaded<T> {
  const Loaded(this.value, {required this.fresh});

  final T value;
  final bool fresh;
}

class SaveResult {
  const SaveResult({required this.synced, required this.roster, this.kept = const []});

  /// False: no connection, so the day waits on the phone.
  final bool synced;
  final Roster roster;

  /// Students someone changed later on the website: their newer status stayed.
  final List<int> kept;
}

class SyncReport {
  const SyncReport({this.sent = 0, this.refused = const [], this.offline = false});

  final int sent;

  /// Days the server refused, with its reason; they are not sent again.
  final List<PendingDay> refused;

  /// Stopped because the server could not be reached.
  final bool offline;
}

const _bengaliDigits = '০১২৩৪৫৬৭৮৯';

/// The digits of [input] with Bangla digits as 0-9, spaces and dashes removed.
String normalizePhoneInput(String input) => input
    .trim()
    .split('')
    .map((c) => _bengaliDigits.contains(c) ? '${_bengaliDigits.indexOf(c)}' : c)
    .join()
    .replaceAll(RegExp(r'[\s-]'), '');

String _randomRef() {
  final random = Random.secure();
  return List.generate(16, (_) => random.nextInt(256).toRadixString(16).padLeft(2, '0')).join();
}

/// Everything the screens need, online or not. A day saved without a
/// connection is kept on the phone with the time it was taken and sent by
/// [syncPending]; the server keeps whichever save of a day was taken last.
class AttendanceRepository {
  AttendanceRepository({
    required this._store,
    required this._session,
    required this._client,
    this.allowInsecureServer = false,
    DateTime Function()? now,
    String Function()? newClientRef,
  })  : _now = now ?? DateTime.now,
        _newClientRef = newClientRef ?? _randomRef;

  final LocalStore _store;
  final SessionStore _session;
  final http.Client _client;
  final DateTime Function() _now;
  final String Function() _newClientRef;

  /// Debug builds may use a plain-http server (a laptop on the school's network).
  final bool allowInsecureServer;

  String language = 'bn';

  /// The school day on the phone's clock: right even after a night offline.
  String _today() => schoolToday(_now());

  Future<bool> isSignedIn() async => await _session.token() != null && await _session.serverUrl() != null;

  Future<String?> lastServerUrl() => _session.serverUrl();

  Future<String?> savedLanguage() => _session.language();

  Future<void> saveLanguage(String code) async {
    language = code;
    await _session.setLanguage(code);
  }

  Future<TeacherApi> _api() async {
    final url = await _session.serverUrl();
    final token = await _session.token();
    if (url == null || token == null) throw const SignedOutException();
    return TeacherApi(serverUrl: Uri.parse(url), client: _client, token: token, language: language);
  }

  /// Runs [call]; a 401 means the token was revoked: forget it and sign out.
  Future<T> _signedIn<T>(Future<T> Function(TeacherApi api) call) async {
    try {
      return await call(await _api());
    } on ApiException catch (e) {
      if (e.statusCode == 401) {
        await _session.setToken(null);
        throw const SignedOutException();
      }
      rethrow;
    }
  }

  Future<Profile> signIn({required String serverUrl, required String phone, required String password}) async {
    final server = parseServerUrl(serverUrl, allowInsecure: allowInsecureServer);
    final api = TeacherApi(serverUrl: server, client: _client, language: language);
    final data = await api.login(normalizePhoneInput(phone), password);
    final profile = Profile.fromJson(data);

    // Another teacher signs in on this phone: the last one's days are not theirs to send.
    final previous = await _store.profile();
    if (previous != null && previous.teacher.id != profile.teacher.id) await _store.clear();

    await _session.setServerUrl(server.toString());
    await _session.setToken(data['token'] as String);
    await _store.saveProfile(profile);
    await _prefetchRosters(profile);
    return profile;
  }

  /// Loads today's class lists, so attendance can be taken later without a connection.
  Future<void> _prefetchRosters(Profile profile) async {
    for (final cls in profile.classes) {
      try {
        await roster(cls.id, profile.today);
      } on OfflineException {
        return;
      }
    }
  }

  Future<Loaded<Profile>> profile() async {
    try {
      final profile = await _signedIn((api) => api.me());
      await _store.saveProfile(profile);
      await _prefetchRosters(profile);
      return Loaded(profile, fresh: true);
    } on OfflineException {
      final cached = await _store.profile();
      if (cached == null) rethrow;
      return Loaded(cached.forDay(_today()), fresh: false);
    }
  }

  /// The class's day. Offline: the phone's copy of that day, or else the last
  /// list it has of the class, with nobody marked (a new day after a night offline).
  Future<Loaded<Roster>> roster(int classId, String date) async {
    try {
      final roster = await _signedIn((api) => api.roster(classId, date));
      await _store.saveRoster(roster);
      return Loaded(roster, fresh: true);
    } on OfflineException {
      final cached = await _store.roster(classId, date) ??
          (await _store.latestRoster(classId))?.blankFor(date, editable: date == _today());
      if (cached == null) rethrow;
      return Loaded(cached, fresh: false);
    }
  }

  Roster _withStatuses(Roster roster, Map<int, AttendanceStatus> entries) => Roster(
        classId: roster.classId,
        className: roster.className,
        section: roster.section,
        date: roster.date,
        editable: roster.editable,
        takenByName: roster.takenByName,
        takenByType: roster.takenByType,
        takenAt: roster.takenAt,
        students: [
          for (final s in roster.students)
            RosterStudent(id: s.id, firstName: s.firstName, lastName: s.lastName, roll: s.roll, status: entries[s.id] ?? s.status),
        ],
      );

  Future<SaveResult> _keepForLater(Roster roster, PendingDay day) async {
    await _store.putPending(day);
    final local = _withStatuses(roster, day.entries);
    await _store.saveRoster(local);
    return SaveResult(synced: false, roster: local);
  }

  /// Saves the class's day: at once when the server can take it, otherwise on
  /// the phone until [syncPending]. A revoked sign-in keeps the day too.
  Future<SaveResult> saveDay(Roster roster, Map<int, AttendanceStatus> entries) async {
    final day = PendingDay(
      clientRef: _newClientRef(),
      classId: roster.classId,
      className: roster.className,
      section: roster.section,
      date: roster.date,
      entries: entries,
      takenAt: _now().toUtc(),
    );
    try {
      final saved = await _signedIn((api) => api.saveDay(day));
      await _store.saveRoster(saved.roster);
      return SaveResult(synced: true, roster: saved.roster, kept: saved.kept);
    } on OfflineException {
      return _keepForLater(roster, day);
    } on ApiException catch (e) {
      if (!canRetryLater(e.statusCode)) rethrow;
      return _keepForLater(roster, day);
    } on SignedOutException {
      await _keepForLater(roster, day);
      rethrow;
    }
  }

  Future<List<PendingDay>> pendingDays() => _store.pendingDays();

  /// Sends the days saved offline, oldest first. Stops at the first sign of no
  /// connection; a refused day keeps the server's reason and is not sent again.
  Future<SyncReport> syncPending() async {
    var sent = 0;
    final refused = <PendingDay>[];
    for (final day in await _store.pendingDays()) {
      if (day.isRefused) continue;
      try {
        final saved = await _signedIn((api) => api.saveDay(day));
        await _store.saveRoster(saved.roster);
        await _store.removePending(day.clientRef);
        sent += 1;
      } on OfflineException {
        return SyncReport(sent: sent, refused: refused, offline: true);
      } on ApiException catch (e) {
        if (canRetryLater(e.statusCode)) {
          return SyncReport(sent: sent, refused: refused, offline: true);
        }
        final marked = day.refused(e.message);
        await _store.putPending(marked);
        refused.add(marked);
      }
    }
    return SyncReport(sent: sent, refused: refused);
  }

  Future<void> discard(String clientRef) => _store.removePending(clientRef);

  Future<void> changePassword(String current, String next) async {
    final token = await _signedIn((api) => api.changePassword(current, next));
    await _session.setToken(token);
  }

  /// Forgets the token and everything kept on the phone (the server address stays).
  Future<void> signOut() async {
    await _session.setToken(null);
    await _store.clear();
  }
}
