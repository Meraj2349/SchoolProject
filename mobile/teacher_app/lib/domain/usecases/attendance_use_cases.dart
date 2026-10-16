import '../entities/attendance_status.dart';
import '../entities/pending_day.dart';
import '../entities/day_overview.dart';
import '../entities/roster.dart';
import '../repositories/attendance_repository.dart';

// What a class teacher does with attendance. Each use case is one intent;
// it depends only on the AttendanceRepository contract.

/// The teacher's classes today, each not taken, taken, or waiting to be sent.
class LoadToday {
  const LoadToday(this._repository);

  final AttendanceRepository _repository;

  Future<TodayOverview> call() async {
    final loaded = await _repository.profile();
    final pending = await _repository.pendingDays();
    final profile = loaded.value;
    bool isWaiting(int classId) => pending.any((d) => !d.isRefused && d.classId == classId && d.date == profile.today);
    return TodayOverview(
      profile: profile,
      online: loaded.fresh,
      classes: [
        for (final c in profile.classes)
          ClassToday(
            schoolClass: c,
            state: isWaiting(c.id) ? ClassDayState.waiting : (c.taken ? ClassDayState.taken : ClassDayState.notTaken),
            takenAt: c.takenAt,
          ),
      ],
      waiting: pending.where((d) => !d.isRefused).length,
      refused: [for (final d in pending) if (d.isRefused) d],
    );
  }
}

class OpenClassDay {
  const OpenClassDay(this._repository);

  final AttendanceRepository _repository;

  Future<ClassDay> call({required int classId, required String date}) async {
    final loaded = await _repository.roster(classId, date);
    final waiting = (await _repository.pendingDays())
        .where((d) => !d.isRefused && d.classId == classId && d.date == date)
        .firstOrNull;
    return ClassDay(
      roster: loaded.value,
      fresh: loaded.fresh,
      hasWaitingSave: waiting != null,
      statuses: {
        for (final s in loaded.value.students) s.id: waiting?.entries[s.id] ?? s.status ?? AttendanceStatus.present,
      },
    );
  }
}

class SaveClassDay {
  const SaveClassDay(this._repository);

  final AttendanceRepository _repository;

  Future<SaveResult> call({required Roster roster, required Map<int, AttendanceStatus> statuses}) =>
      _repository.saveDay(roster, Map.unmodifiable(statuses));
}

class SyncPendingDays {
  const SyncPendingDays(this._repository);

  final AttendanceRepository _repository;

  Future<SyncReport> call() => _repository.syncPending();
}

class DiscardPendingDay {
  const DiscardPendingDay(this._repository);

  final AttendanceRepository _repository;

  Future<void> call(PendingDay day) => _repository.discard(day.clientRef);
}
