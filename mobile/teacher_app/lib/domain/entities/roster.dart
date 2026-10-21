import 'attendance_status.dart';

class RosterStudent {
  const RosterStudent({required this.id, required this.firstName, required this.lastName, required this.roll, this.status});

  final int id;
  final String firstName;
  final String lastName;
  final String roll;

  /// Null until the day is taken.
  final AttendanceStatus? status;

  String get fullName => [firstName, lastName].where((p) => p.isNotEmpty).join(' ');

  RosterStudent withStatus(AttendanceStatus? status) =>
      RosterStudent(id: id, firstName: firstName, lastName: lastName, roll: roll, status: status);
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

  final int classId;
  final String className;
  final String section;
  final String date;
  final List<RosterStudent> students;
  final bool editable;
  final String? takenByName;
  final String? takenByType;
  final DateTime? takenAt;

  /// The same day with [statuses] applied (students not in it keep theirs).
  Roster withStatuses(Map<int, AttendanceStatus> statuses) => Roster(
        classId: classId,
        className: className,
        section: section,
        date: date,
        editable: editable,
        takenByName: takenByName,
        takenByType: takenByType,
        takenAt: takenAt,
        students: [for (final s in students) s.withStatus(statuses[s.id] ?? s.status)],
      );

  /// The same students on [day], nobody marked yet.
  Roster blankFor(String day, {required bool editable}) => Roster(
        classId: classId,
        className: className,
        section: section,
        date: day,
        editable: editable,
        students: [for (final s in students) s.withStatus(null)],
      );
}
