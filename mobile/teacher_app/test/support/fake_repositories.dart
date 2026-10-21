import 'package:teacher_app/domain/entities/attendance_status.dart';
import 'package:teacher_app/domain/entities/pending_day.dart';
import 'package:teacher_app/domain/entities/roster.dart';
import 'package:teacher_app/domain/entities/teacher.dart';
import 'package:teacher_app/domain/errors.dart';
import 'package:teacher_app/domain/repositories/attendance_repository.dart';
import 'package:teacher_app/domain/repositories/session_repository.dart';

const mirzapur = Branch(id: 3, nameBn: 'মির্জাপুর শাখা', nameEn: 'Mirzapur Branch');

const nasima = Teacher(id: 7, firstName: 'Nasima', lastName: 'Akter', phone: '01711000001', branch: mirzapur);

Profile profileOn(String today, {bool taken = false, DateTime? takenAt}) => Profile(
      teacher: nasima,
      today: today,
      classes: [
        SchoolClass(id: 10, name: 'Class 5', section: 'Good', students: 2, taken: taken, takenAt: takenAt),
        const SchoolClass(id: 11, name: 'Class 6', section: 'Good', students: 1, taken: false),
      ],
    );

Roster rosterOf(String date, {Map<int, AttendanceStatus> statuses = const {}, bool editable = true}) => Roster(
      classId: 10,
      className: 'Class 5',
      section: 'Good',
      date: date,
      editable: editable,
      students: [
        RosterStudent(id: 101, firstName: 'Rahim', lastName: 'Uddin', roll: '1', status: statuses[101]),
        RosterStudent(id: 102, firstName: 'Karim', lastName: 'Uddin', roll: '2', status: statuses[102]),
      ],
    );

PendingDay pendingOn(String date, Map<int, AttendanceStatus> entries, {String? refusal, int classId = 10}) => PendingDay(
      clientRef: 'ref-$classId-$date',
      classId: classId,
      className: 'Class 5',
      section: 'Good',
      date: date,
      entries: entries,
      takenAt: DateTime.utc(2026, 3, 10, 4),
      refusal: refusal,
    );

/// In-memory AttendanceRepository for use-case and view-model tests.
class FakeAttendanceRepository implements AttendanceRepository {
  Loaded<Profile>? loadedProfile;
  final rosters = <String, Loaded<Roster>>{};
  List<PendingDay> pending = [];
  Object? failWith;
  SaveResult? nextSave;
  SyncReport nextSync = const SyncReport();
  final saved = <Map<int, AttendanceStatus>>[];

  void _maybeFail() {
    if (failWith != null) throw failWith!;
  }

  @override
  Future<Loaded<Profile>> profile() async {
    _maybeFail();
    return loadedProfile ?? (throw const OfflineException());
  }

  @override
  Future<Loaded<Roster>> roster(int classId, String date) async {
    _maybeFail();
    return rosters['$classId:$date'] ?? (throw const OfflineException());
  }

  @override
  Future<SaveResult> saveDay(Roster roster, Map<int, AttendanceStatus> entries) async {
    _maybeFail();
    saved.add(entries);
    return nextSave ?? SaveResult(synced: true, roster: roster.withStatuses(entries));
  }

  @override
  Future<List<PendingDay>> pendingDays() async => List.of(pending);

  @override
  Future<SyncReport> syncPending() async {
    _maybeFail();
    return nextSync;
  }

  @override
  Future<void> discard(String clientRef) async => pending.removeWhere((d) => d.clientRef == clientRef);
}

/// In-memory SessionRepository for use-case and view-model tests.
class FakeSessionRepository implements SessionRepository {
  bool signedIn = false;
  String? server;
  String? language;
  Object? failWith;
  final passwordChanges = <(String, String)>[];

  @override
  Future<bool> isSignedIn() async => signedIn;

  @override
  Future<String?> lastServerUrl() async => server;

  @override
  Future<Profile> signIn({required String serverUrl, required String phone, required String password}) async {
    if (failWith != null) throw failWith!;
    signedIn = true;
    server = serverUrl;
    return profileOn('2026-03-10');
  }

  @override
  Future<void> changePassword(String current, String next) async {
    if (failWith != null) throw failWith!;
    passwordChanges.add((current, next));
  }

  @override
  Future<void> signOut() async => signedIn = false;

  @override
  Future<String?> savedLanguage() async => language;

  @override
  Future<void> saveLanguage(String code) async => language = code;
}
