import 'dart:math';

import 'package:http/http.dart' as http;

import '../../domain/entities/attendance_status.dart';
import '../../domain/entities/pending_day.dart';
import '../../domain/entities/roster.dart';
import '../../domain/entities/school_day.dart';
import '../../domain/entities/server_address.dart';
import '../../domain/entities/teacher.dart';
import '../../domain/errors.dart';
import '../../domain/repositories/attendance_repository.dart';
import '../../domain/repositories/session_repository.dart';
import '../datasources/local_store.dart';
import '../datasources/session_store.dart';
import '../datasources/teacher_api.dart';
import '../models/json_mappers.dart';

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

/// Implements the domain's SessionRepository and AttendanceRepository with the
/// school server (TeacherApi), the phone's store (LocalStore) and the secure
/// session store. A day saved without a connection is kept on the phone with
/// the time it was taken and sent by [syncPending]; the server keeps
/// whichever save of a day was taken last.
class TeacherAppRepository implements SessionRepository, AttendanceRepository {
  TeacherAppRepository({
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

  @override
  Future<bool> isSignedIn() async => await _session.token() != null && await _session.serverUrl() != null;

  @override
  Future<String?> lastServerUrl() => _session.serverUrl();

  @override
  Future<String?> savedLanguage() => _session.language();

  @override
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

  @override
  Future<Profile> signIn({required String serverUrl, required String phone, required String password}) async {
    final server = parseServerUrl(serverUrl, allowInsecure: allowInsecureServer);
    final api = TeacherApi(serverUrl: server, client: _client, language: language);
    final data = await api.login(normalizePhoneInput(phone), password);
    final profile = profileFromJson(data);

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

  @override
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
  @override
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

  Future<SaveResult> _keepForLater(Roster roster, PendingDay day) async {
    await _store.putPending(day);
    final local = roster.withStatuses(day.entries);
    await _store.saveRoster(local);
    return SaveResult(synced: false, roster: local);
  }

  /// Saves the class's day: at once when the server can take it, otherwise on
  /// the phone until [syncPending]. A revoked sign-in keeps the day too.
  @override
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
      if (!e.canRetryLater) rethrow;
      return _keepForLater(roster, day);
    } on SignedOutException {
      await _keepForLater(roster, day);
      rethrow;
    }
  }

  @override
  Future<List<PendingDay>> pendingDays() => _store.pendingDays();

  /// Sends the days saved offline, oldest first. Stops at the first sign of no
  /// connection; a refused day keeps the server's reason and is not sent again.
  @override
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
        if (e.canRetryLater) {
          return SyncReport(sent: sent, refused: refused, offline: true);
        }
        final marked = day.refused(e.message);
        await _store.putPending(marked);
        refused.add(marked);
      }
    }
    return SyncReport(sent: sent, refused: refused);
  }

  @override
  Future<void> discard(String clientRef) => _store.removePending(clientRef);

  @override
  Future<void> changePassword(String current, String next) async {
    final token = await _signedIn((api) => api.changePassword(current, next));
    await _session.setToken(token);
  }

  /// Forgets the token and everything kept on the phone (the server address stays).
  @override
  Future<void> signOut() async {
    await _session.setToken(null);
    await _store.clear();
  }
}
