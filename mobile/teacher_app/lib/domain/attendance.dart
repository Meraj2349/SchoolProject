// Attendance as the phone sees it: a teacher's classes, a class's day, and the
// days saved on the phone that still have to reach the school's server.

/// A student's status for one day, as the server stores it.
enum AttendanceStatus {
  present('Present'),
  absent('Absent'),
  late('Late'),
  leave('Leave');

  const AttendanceStatus(this.apiValue);

  final String apiValue;

  static AttendanceStatus? fromApi(String? value) {
    for (final status in values) {
      if (status.apiValue == value) return status;
    }
    return null;
  }
}

/// Bangladesh is UTC+6 all year (no daylight saving).
const _schoolUtcOffset = Duration(hours: 6);

/// The school day ("YYYY-MM-DD") that [now] falls on, as the server counts days.
String schoolToday(DateTime now) => _day(now.toUtc().add(_schoolUtcOffset));

String _day(DateTime d) =>
    '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

DateTime? _time(Object? value) => value == null ? null : DateTime.parse(value as String).toUtc();

/// How many students have each status.
class DayCounts {
  const DayCounts({required this.present, required this.absent, required this.late, required this.leave});

  factory DayCounts.of(Iterable<AttendanceStatus> statuses) {
    int count(AttendanceStatus s) => statuses.where((x) => x == s).length;
    return DayCounts(
      present: count(AttendanceStatus.present),
      absent: count(AttendanceStatus.absent),
      late: count(AttendanceStatus.late),
      leave: count(AttendanceStatus.leave),
    );
  }

  final int present;
  final int absent;
  final int late;
  final int leave;
}

/// What to do with a saved day after the server answered with [statusCode].
enum SyncOutcome { done, refused, retryLater, signedOut }

SyncOutcome syncOutcomeOf(int statusCode) {
  if (statusCode >= 200 && statusCode < 300) return SyncOutcome.done;
  if (statusCode == 401) return SyncOutcome.signedOut;
  if (statusCode == 429 || statusCode >= 500) return SyncOutcome.retryLater;
  return SyncOutcome.refused; // the day is locked, not the teacher's class, ...
}

class Teacher {
  const Teacher({required this.id, required this.firstName, required this.lastName, required this.phone});

  factory Teacher.fromJson(Map<String, dynamic> json) => Teacher(
        id: json['id'] as int,
        firstName: json['firstName'] as String? ?? '',
        lastName: json['lastName'] as String? ?? '',
        phone: json['phone'] as String? ?? '',
      );

  final int id;
  final String firstName;
  final String lastName;
  final String phone;

  String get fullName => [firstName, lastName].where((p) => p.isNotEmpty).join(' ');

  Map<String, dynamic> toJson() => {'id': id, 'firstName': firstName, 'lastName': lastName, 'phone': phone};
}

/// A class the teacher is class teacher of, and whether today is taken.
class SchoolClass {
  const SchoolClass({
    required this.id,
    required this.name,
    required this.section,
    required this.students,
    required this.taken,
    this.takenAt,
  });

  factory SchoolClass.fromJson(Map<String, dynamic> json) => SchoolClass(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        section: json['section'] as String? ?? '',
        students: json['students'] as int? ?? 0,
        taken: json['taken'] as bool? ?? false,
        takenAt: _time(json['takenAt']),
      );

  final int id;
  final String name;
  final String section;
  final int students;
  final bool taken;
  final DateTime? takenAt;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'section': section,
        'students': students,
        'taken': taken,
        'takenAt': takenAt?.toIso8601String(),
      };
}

/// The signed-in teacher, their classes and the school's today.
class Profile {
  const Profile({required this.teacher, required this.today, required this.classes});

  factory Profile.fromJson(Map<String, dynamic> json) => Profile(
        teacher: Teacher.fromJson(json['teacher'] as Map<String, dynamic>),
        today: json['today'] as String,
        classes: [for (final c in json['classes'] as List) SchoolClass.fromJson(c as Map<String, dynamic>)],
      );

  final Teacher teacher;
  final String today;
  final List<SchoolClass> classes;

  Map<String, dynamic> toJson() => {
        'teacher': teacher.toJson(),
        'today': today,
        'classes': [for (final c in classes) c.toJson()],
      };
}

class RosterStudent {
  const RosterStudent({required this.id, required this.firstName, required this.lastName, required this.roll, this.status});

  factory RosterStudent.fromJson(Map<String, dynamic> json) => RosterStudent(
        id: json['studentId'] as int,
        firstName: json['firstName'] as String? ?? '',
        lastName: json['lastName'] as String? ?? '',
        roll: '${json['roll'] ?? ''}',
        status: AttendanceStatus.fromApi(json['status'] as String?),
      );

  final int id;
  final String firstName;
  final String lastName;
  final String roll;

  /// Null until the day is taken.
  final AttendanceStatus? status;

  String get fullName => [firstName, lastName].where((p) => p.isNotEmpty).join(' ');

  Map<String, dynamic> toJson() =>
      {'studentId': id, 'firstName': firstName, 'lastName': lastName, 'roll': roll, 'status': status?.apiValue};
}

/// One class's students and their statuses on one day.
class Roster {
  const Roster({
    required this.classId,
    required this.className,
    required this.section,
    required this.date,
    required this.students,
    required this.editable,
    this.takenByName,
    this.takenByType,
    this.takenAt,
  });

  factory Roster.fromJson(Map<String, dynamic> json) {
    final cls = json['class'] as Map<String, dynamic>;
    final takenBy = json['takenBy'] as Map<String, dynamic>?;
    return Roster(
      classId: cls['id'] as int,
      className: cls['name'] as String? ?? '',
      section: cls['section'] as String? ?? '',
      date: json['date'] as String,
      editable: json['editable'] as bool? ?? false,
      takenByName: takenBy?['name'] as String?,
      takenByType: takenBy?['type'] as String?,
      takenAt: _time(takenBy?['at']),
      students: [for (final s in json['students'] as List) RosterStudent.fromJson(s as Map<String, dynamic>)],
    );
  }

  final int classId;
  final String className;
  final String section;
  final String date;
  final List<RosterStudent> students;
  final bool editable;
  final String? takenByName;
  final String? takenByType;
  final DateTime? takenAt;

  Map<String, dynamic> toJson() => {
        'class': {'id': classId, 'name': className, 'section': section},
        'date': date,
        'editable': editable,
        'takenBy': takenAt == null
            ? null
            : {'type': takenByType, 'name': takenByName, 'at': takenAt!.toIso8601String()},
        'students': [for (final s in students) s.toJson()],
      };
}

/// A class's day saved on the phone, waiting to reach the server.
class PendingDay {
  const PendingDay({
    required this.clientRef,
    required this.classId,
    required this.className,
    required this.section,
    required this.date,
    required this.entries,
    required this.takenAt,
    this.refusal,
  });

  factory PendingDay.fromJson(Map<String, dynamic> json) => PendingDay(
        clientRef: json['clientRef'] as String,
        classId: json['classId'] as int,
        className: json['className'] as String? ?? '',
        section: json['section'] as String? ?? '',
        date: json['date'] as String,
        entries: {
          for (final e in (json['entries'] as Map<String, dynamic>).entries)
            int.parse(e.key): AttendanceStatus.fromApi(e.value as String)!,
        },
        takenAt: DateTime.parse(json['takenAt'] as String).toUtc(),
        refusal: json['refusal'] as String?,
      );

  final String clientRef;
  final int classId;
  final String className;
  final String section;
  final String date;

  /// Student id → status.
  final Map<int, AttendanceStatus> entries;

  /// When the teacher saved it on the phone: the server keeps a later save over this one.
  final DateTime takenAt;

  /// The server's reason when it refused the day; it is not sent again.
  final String? refusal;

  bool get isRefused => refusal != null;

  PendingDay refused(String reason) => PendingDay(
        clientRef: clientRef,
        classId: classId,
        className: className,
        section: section,
        date: date,
        entries: entries,
        takenAt: takenAt,
        refusal: reason,
      );

  Map<String, dynamic> requestBody() => {
        'entries': [
          for (final e in entries.entries) {'studentId': e.key, 'status': e.value.apiValue},
        ],
        'takenAt': takenAt.toUtc().toIso8601String(),
        'clientRef': clientRef,
      };

  Map<String, dynamic> toJson() => {
        'clientRef': clientRef,
        'classId': classId,
        'className': className,
        'section': section,
        'date': date,
        'entries': {for (final e in entries.entries) '${e.key}': e.value.apiValue},
        'takenAt': takenAt.toUtc().toIso8601String(),
        'refusal': refusal,
      };
}
