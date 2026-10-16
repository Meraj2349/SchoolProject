import 'dart:async';

import 'package:flutter/foundation.dart';

import '../data/attendance_repository.dart';
import '../data/teacher_api.dart';
import '../domain/attendance.dart';

enum AppPhase { starting, signedOut, signedIn }

/// The app's state shared by the screens: who is signed in, their classes,
/// the days waiting to be sent, and whether the server can be reached.
/// Sends waiting days when the connection comes back and when asked.
class AppController extends ChangeNotifier {
  AppController({required this.repository, Stream<bool>? onlineChanges, this.defaultServerUrl = ''}) {
    _online = onlineChanges?.listen((online) {
      if (online && phase == AppPhase.signedIn) unawaited(sync());
    });
  }

  final AttendanceRepository repository;

  /// The school's server, built into the APK (--dart-define=API_URL=...).
  final String defaultServerUrl;

  StreamSubscription<bool>? _online;

  AppPhase phase = AppPhase.starting;
  String language = 'bn';
  Profile? profile;

  /// False while showing the phone's copy because the server could not be reached.
  bool online = true;
  bool syncing = false;
  List<PendingDay> pending = const [];

  /// Set when the server signed this phone out (access off, password reset).
  bool signedOutByServer = false;

  String? serverUrl;

  Future<void> start() async {
    language = await repository.savedLanguage() ?? 'bn';
    repository.language = language;
    serverUrl = await repository.lastServerUrl();
    if (await repository.isSignedIn()) {
      phase = AppPhase.signedIn;
      await refresh();
    } else {
      phase = AppPhase.signedOut;
    }
    notifyListeners();
  }

  Future<void> setLanguage(String code) async {
    language = code;
    notifyListeners();
    await repository.saveLanguage(code);
  }

  /// Null when signed in, otherwise the message to show.
  Future<String?> signIn({required String server, required String phone, required String password}) async {
    try {
      profile = await repository.signIn(serverUrl: server, phone: phone, password: password);
      serverUrl = await repository.lastServerUrl();
      phase = AppPhase.signedIn;
      online = true;
      signedOutByServer = false;
      pending = await repository.pendingDays();
      notifyListeners();
      unawaited(sync());
      return null;
    } on ApiException catch (e) {
      return e.message;
    }
  }

  void _signedOut() {
    phase = AppPhase.signedOut;
    signedOutByServer = true;
    profile = null;
    notifyListeners();
  }

  /// Reloads the teacher's classes and sends waiting days.
  Future<void> refresh() async {
    try {
      final loaded = await repository.profile();
      profile = loaded.value;
      online = loaded.fresh;
    } on SignedOutException {
      return _signedOut();
    } on OfflineException {
      online = false;
    }
    pending = await repository.pendingDays();
    notifyListeners();
    if (online) await sync();
  }

  /// Sends the days saved offline. Returns how many were sent.
  Future<int> sync() async {
    if (syncing) return 0;
    syncing = true;
    notifyListeners();
    try {
      final report = await repository.syncPending();
      online = !report.offline;
      if (report.sent > 0) {
        try {
          profile = (await repository.profile()).value;
        } on OfflineException {
          // the days are sent; the class list refreshes next time
        }
      }
      return report.sent;
    } on SignedOutException {
      _signedOut();
      return 0;
    } finally {
      syncing = false;
      pending = await repository.pendingDays();
      notifyListeners();
    }
  }

  Future<Loaded<Roster>> roster(int classId, String date) async {
    try {
      final loaded = await repository.roster(classId, date);
      online = loaded.fresh;
      notifyListeners();
      return loaded;
    } on SignedOutException {
      _signedOut();
      rethrow;
    }
  }

  Future<SaveResult> saveDay(Roster roster, Map<int, AttendanceStatus> entries) async {
    try {
      final result = await repository.saveDay(roster, entries);
      online = result.synced;
      pending = await repository.pendingDays();
      if (result.synced) {
        try {
          profile = (await repository.profile()).value;
        } on OfflineException {
          // shown as taken next time the list loads
        }
      }
      notifyListeners();
      return result;
    } on SignedOutException {
      _signedOut();
      rethrow;
    }
  }

  Future<void> discard(PendingDay day) async {
    await repository.discard(day.clientRef);
    pending = await repository.pendingDays();
    notifyListeners();
  }

  Future<void> changePassword(String current, String next) => repository.changePassword(current, next);

  Future<void> signOut() async {
    await repository.signOut();
    phase = AppPhase.signedOut;
    signedOutByServer = false;
    profile = null;
    pending = const [];
    notifyListeners();
  }

  /// Waiting (not refused) save of a class's day, if any.
  PendingDay? pendingFor(int classId, String date) {
    for (final day in pending) {
      if (day.classId == classId && day.date == date && !day.isRefused) return day;
    }
    return null;
  }

  @override
  void dispose() {
    _online?.cancel();
    super.dispose();
  }
}
