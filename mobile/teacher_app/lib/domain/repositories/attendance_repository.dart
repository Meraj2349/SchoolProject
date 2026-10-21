import '../entities/attendance_status.dart';
import '../entities/pending_day.dart';
import '../entities/roster.dart';
import '../entities/teacher.dart';

/// A value, and whether it came from the server just now ([fresh]) or from the
/// phone's copy because the server could not be reached.
class Loaded<T> {
  const Loaded(this.value, {required this.fresh});

  final T value;
  final bool fresh;
}

class SaveResult {
  const SaveResult({required this.synced, required this.roster, this.kept = const []});

  /// False: the day waits on the phone (no connection, or the server is busy).
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

/// The teacher's classes and their days, online or not. Every method may
/// throw SignedOutException when the server revoked the sign-in.
abstract interface class AttendanceRepository {
  /// Throws OfflineException when offline with nothing kept on the phone.
  Future<Loaded<Profile>> profile();

  /// Throws OfflineException when offline with no list of the class on the phone.
  Future<Loaded<Roster>> roster(int classId, String date);

  /// Saves at once when the server can take it, otherwise keeps it on the phone.
  /// Throws ApiException when the server refused the day.
  Future<SaveResult> saveDay(Roster roster, Map<int, AttendanceStatus> entries);

  /// Oldest first.
  Future<List<PendingDay>> pendingDays();
  Future<SyncReport> syncPending();
  Future<void> discard(String clientRef);
}
