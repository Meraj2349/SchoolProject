import 'package:flutter/foundation.dart';

import '../../domain/entities/attendance_status.dart';
import '../../domain/errors.dart';
import '../../domain/entities/day_overview.dart';
import '../../domain/usecases/attendance_use_cases.dart';
import 'app_view_model.dart';

enum ClassDayLoad { loading, ready, noCopy, failed }

/// Where a save went; the view turns it into a message.
@immutable
sealed class SaveOutcome {
  const SaveOutcome();

  /// Reached the server; [kept] students had a newer change from the office.
  const factory SaveOutcome.saved({required int kept}) = Saved;

  /// Waits on the phone until it can be sent.
  const factory SaveOutcome.keptOnPhone() = KeptOnPhone;

  /// The server refused it, with its reason.
  const factory SaveOutcome.refused(String message) = SaveRefused;
  const factory SaveOutcome.signedOut() = SaveSignedOut;
}

class Saved extends SaveOutcome {
  const Saved({required this.kept});

  final int kept;

  @override
  bool operator ==(Object other) => other is Saved && other.kept == kept;

  @override
  int get hashCode => kept;
}

class SaveRefused extends SaveOutcome {
  const SaveRefused(this.message);

  final String message;

  @override
  bool operator ==(Object other) => other is SaveRefused && other.message == message;

  @override
  int get hashCode => message.hashCode;
}

// Without fields these are always const, so identical values are equal.
class KeptOnPhone extends SaveOutcome {
  const KeptOnPhone();
}

class SaveSignedOut extends SaveOutcome {
  const SaveSignedOut();
}

/// Taking one class's day: one status per student, everyone starting present.
class TakeAttendanceViewModel extends ChangeNotifier {
  TakeAttendanceViewModel({
    required this._openClassDay,
    required this._saveClassDay,
    required this._app,
    required this.classId,
    required this.date,
  });

  final OpenClassDay _openClassDay;
  final SaveClassDay _saveClassDay;
  final AppViewModel _app;
  final int classId;
  final String date;

  ClassDayLoad state = ClassDayLoad.loading;
  ClassDay? day;
  Map<int, AttendanceStatus> _statuses = {};
  bool saving = false;

  bool get editable => (day?.roster.editable ?? false) && !saving;
  AttendanceStatus statusOf(int studentId) => _statuses[studentId] ?? AttendanceStatus.present;
  DayCounts get counts => DayCounts.of(_statuses.values);

  Future<void> load() async {
    state = ClassDayLoad.loading;
    notifyListeners();
    try {
      day = await _openClassDay(classId: classId, date: date);
      _statuses = Map.of(day!.statuses);
      state = ClassDayLoad.ready;
    } on OfflineException {
      state = ClassDayLoad.noCopy;
    } on SignedOutException {
      _app.signedOut(byServer: true);
    } catch (_) {
      state = ClassDayLoad.failed;
    }
    notifyListeners();
  }

  void setStatus(int studentId, AttendanceStatus status) {
    if (!editable) return;
    _statuses = {..._statuses, studentId: status};
    notifyListeners();
  }

  void markAllPresent() {
    if (!editable) return;
    _statuses = {for (final id in _statuses.keys) id: AttendanceStatus.present};
    notifyListeners();
  }

  Future<SaveOutcome> save() async {
    saving = true;
    notifyListeners();
    try {
      final result = await _saveClassDay(roster: day!.roster, statuses: _statuses);
      return result.synced ? SaveOutcome.saved(kept: result.kept.length) : const SaveOutcome.keptOnPhone();
    } on ApiException catch (e) {
      return SaveOutcome.refused(e.message);
    } on SignedOutException {
      _app.signedOut(byServer: true);
      return const SaveOutcome.signedOut();
    } finally {
      saving = false;
      notifyListeners();
    }
  }
}
