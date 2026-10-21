import 'dart:async';

import 'package:flutter/foundation.dart';

import '../../domain/entities/pending_day.dart';
import '../../domain/errors.dart';
import '../../domain/entities/day_overview.dart';
import '../../domain/usecases/attendance_use_cases.dart';
import 'app_view_model.dart';

/// The Today screen: the teacher's classes, and the days still to be sent.
/// Sends waiting days when the connection comes back.
class TodayViewModel extends ChangeNotifier {
  TodayViewModel({
    required this._loadToday,
    required this._syncPending,
    required this._discardPending,
    required this._app,
    Stream<bool>? onlineChanges,
  }) {
    _online = onlineChanges?.listen((online) {
      if (online) unawaited(sync());
    });
  }

  final LoadToday _loadToday;
  final SyncPendingDays _syncPending;
  final DiscardPendingDay _discardPending;
  final AppViewModel _app;
  StreamSubscription<bool>? _online;

  TodayOverview? overview;
  bool loading = false;
  bool syncing = false;

  /// No connection and nothing kept on the phone yet.
  bool offlineWithoutCopy = false;

  /// How many days the last sync sent.
  int lastSent = 0;

  bool get online => overview?.online ?? !offlineWithoutCopy;

  Future<T?> _guard<T>(Future<T> Function() run) async {
    try {
      return await run();
    } on SignedOutException {
      _app.signedOut(byServer: true);
      return null;
    }
  }

  /// Reloads the day, then sends what waits on the phone.
  Future<void> load() async {
    loading = true;
    notifyListeners();
    await _guard(() async {
      try {
        overview = await _loadToday();
        offlineWithoutCopy = false;
      } on OfflineException {
        offlineWithoutCopy = overview == null;
      }
    });
    loading = false;
    notifyListeners();
    if (overview != null && overview!.online && overview!.waiting > 0) await sync();
  }

  /// Sends the days saved offline; returns how many were sent.
  Future<int> sync() async {
    if (syncing) return 0;
    syncing = true;
    notifyListeners();
    final report = await _guard(_syncPending.call);
    syncing = false;
    lastSent = report?.sent ?? 0;
    await _guard(() async {
      try {
        overview = await _loadToday();
      } on OfflineException {
        // keep what is shown
      }
    });
    notifyListeners();
    return lastSent;
  }

  Future<void> discard(PendingDay day) async {
    await _discardPending(day);
    await _guard(() async => overview = await _loadToday());
    notifyListeners();
  }

  @override
  void dispose() {
    _online?.cancel();
    super.dispose();
  }
}
