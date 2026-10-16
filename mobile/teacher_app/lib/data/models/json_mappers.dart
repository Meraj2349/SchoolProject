import '../../domain/entities/attendance_status.dart';
import '../../domain/entities/pending_day.dart';
import '../../domain/entities/roster.dart';
import '../../domain/entities/teacher.dart';

// JSON ⇄ domain entities, for the server's API and the phone's own store.
// The domain never sees JSON; the shapes here are the server's.

typedef Json = Map<String, dynamic>;

DateTime? _time(Object? value) => value == null ? null : DateTime.parse(value as String).toUtc();

Teacher teacherFromJson(Json json) => Teacher(
      id: json['id'] as int,
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
    );

Json teacherToJson(Teacher t) => {'id': t.id, 'firstName': t.firstName, 'lastName': t.lastName, 'phone': t.phone};

SchoolClass schoolClassFromJson(Json json) => SchoolClass(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      section: json['section'] as String? ?? '',
      students: json['students'] as int? ?? 0,
      taken: json['taken'] as bool? ?? false,
      takenAt: _time(json['takenAt']),
    );

Json schoolClassToJson(SchoolClass c) => {
      'id': c.id,
      'name': c.name,
      'section': c.section,
      'students': c.students,
      'taken': c.taken,
      'takenAt': c.takenAt?.toIso8601String(),
    };

Profile profileFromJson(Json json) => Profile(
      teacher: teacherFromJson(json['teacher'] as Json),
      today: json['today'] as String,
      classes: [for (final c in json['classes'] as List) schoolClassFromJson(c as Json)],
    );

Json profileToJson(Profile p) => {
      'teacher': teacherToJson(p.teacher),
      'today': p.today,
      'classes': [for (final c in p.classes) schoolClassToJson(c)],
    };

RosterStudent rosterStudentFromJson(Json json) => RosterStudent(
      id: json['studentId'] as int,
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      roll: '${json['roll'] ?? ''}',
      status: AttendanceStatus.fromApi(json['status'] as String?),
    );

Json rosterStudentToJson(RosterStudent s) =>
    {'studentId': s.id, 'firstName': s.firstName, 'lastName': s.lastName, 'roll': s.roll, 'status': s.status?.apiValue};

Roster rosterFromJson(Json json) {
  final cls = json['class'] as Json;
  final takenBy = json['takenBy'] as Json?;
  return Roster(
    classId: cls['id'] as int,
    className: cls['name'] as String? ?? '',
    section: cls['section'] as String? ?? '',
    date: json['date'] as String,
    editable: json['editable'] as bool? ?? false,
    takenByName: takenBy?['name'] as String?,
    takenByType: takenBy?['type'] as String?,
    takenAt: _time(takenBy?['at']),
    students: [for (final s in json['students'] as List) rosterStudentFromJson(s as Json)],
  );
}

Json rosterToJson(Roster r) => {
      'class': {'id': r.classId, 'name': r.className, 'section': r.section},
      'date': r.date,
      'editable': r.editable,
      'takenBy': r.takenAt == null ? null : {'type': r.takenByType, 'name': r.takenByName, 'at': r.takenAt!.toIso8601String()},
      'students': [for (final s in r.students) rosterStudentToJson(s)],
    };

PendingDay pendingDayFromJson(Json json) => PendingDay(
      clientRef: json['clientRef'] as String,
      classId: json['classId'] as int,
      className: json['className'] as String? ?? '',
      section: json['section'] as String? ?? '',
      date: json['date'] as String,
      entries: {
        for (final e in (json['entries'] as Json).entries) int.parse(e.key): AttendanceStatus.fromApi(e.value as String)!,
      },
      takenAt: DateTime.parse(json['takenAt'] as String).toUtc(),
      refusal: json['refusal'] as String?,
    );

Json pendingDayToJson(PendingDay d) => {
      'clientRef': d.clientRef,
      'classId': d.classId,
      'className': d.className,
      'section': d.section,
      'date': d.date,
      'entries': {for (final e in d.entries.entries) '${e.key}': e.value.apiValue},
      'takenAt': d.takenAt.toUtc().toIso8601String(),
      'refusal': d.refusal,
    };

/// The body of PUT /classes/:classId/attendance/:date.
Json saveDayRequest(PendingDay d) => {
      'entries': [
        for (final e in d.entries.entries) {'studentId': e.key, 'status': e.value.apiValue},
      ],
      'takenAt': d.takenAt.toUtc().toIso8601String(),
    };
