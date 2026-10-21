import 'package:flutter_test/flutter_test.dart';
import 'package:teacher_app/data/models/json_mappers.dart';
import 'package:teacher_app/domain/entities/attendance_status.dart';
import 'package:teacher_app/domain/entities/pending_day.dart';
import 'package:teacher_app/domain/entities/teacher.dart';

void main() {
  test('a saved day survives a round trip through JSON, and the request carries the entries and when it was taken', () {
    final day = PendingDay(
      clientRef: 'r1',
      classId: 10,
      className: 'Class 5',
      section: 'Good',
      date: '2026-03-10',
      entries: {101: AttendanceStatus.present, 102: AttendanceStatus.absent},
      takenAt: DateTime.utc(2026, 3, 10, 3, 15),
      refusal: 'Locked',
    );

    expect(pendingDayToJson(pendingDayFromJson(pendingDayToJson(day))), pendingDayToJson(day));
    expect(saveDayRequest(day), {
      'entries': [
        {'studentId': 101, 'status': 'Present'},
        {'studentId': 102, 'status': 'Absent'},
      ],
      'takenAt': '2026-03-10T03:15:00.000Z',
    });
  });

  test('reads the server roster: who took the day, when, and whether it can still change', () {
    final roster = rosterFromJson({
      'class': {'id': 10, 'name': 'Class 5', 'section': 'Good', 'branchId': 1},
      'date': '2026-03-10',
      'editable': true,
      'takenBy': {'type': 'teacher', 'id': 7, 'name': 'Nasima Akter', 'at': '2026-03-10T03:15:00.000Z'},
      'students': [
        {'studentId': 101, 'firstName': 'Rahim', 'lastName': 'Uddin', 'roll': '1', 'status': 'Absent'},
        {'studentId': 102, 'firstName': 'Karim', 'lastName': null, 'roll': 2, 'status': null},
      ],
    });

    expect(roster.classId, 10);
    expect(roster.takenByName, 'Nasima Akter');
    expect(roster.takenAt, DateTime.utc(2026, 3, 10, 3, 15));
    expect(roster.students.map((s) => s.fullName), ['Rahim Uddin', 'Karim']);
    expect(roster.students.map((s) => s.roll), ['1', '2']);
    expect(roster.students.map((s) => s.status), [AttendanceStatus.absent, null]);
    expect(rosterToJson(rosterFromJson(rosterToJson(roster))), rosterToJson(roster));
  });

  test('reads the profile with each class\'s state today', () {
    final profile = profileFromJson({
      'teacher': {'id': 7, 'firstName': 'Nasima', 'lastName': 'Akter', 'phone': '01711000001'},
      'today': '2026-03-10',
      'classes': [
        {'id': 10, 'name': 'Class 5', 'section': 'Good', 'students': 3, 'taken': true, 'takenAt': '2026-03-10T03:15:00.000Z'},
      ],
    });

    expect(profile.teacher.fullName, 'Nasima Akter');
    expect(profile.classes.single.label, 'Class 5 — Good');
    expect(profileToJson(profileFromJson(profileToJson(profile))), profileToJson(profile));
  });

  test('reads the teacher\'s branch, and keeps it through the phone\'s copy of the profile', () {
    final profile = profileFromJson({
      'teacher': {
        'id': 7,
        'firstName': 'Nasima',
        'lastName': 'Akter',
        'phone': '01711000001',
        'branch': {'id': 3, 'nameBn': 'মির্জাপুর শাখা', 'nameEn': 'Mirzapur Branch'},
      },
      'today': '2026-03-10',
      'classes': [],
    });

    expect(profile.teacher.branch, const Branch(id: 3, nameBn: 'মির্জাপুর শাখা', nameEn: 'Mirzapur Branch'));
    expect(profileFromJson(profileToJson(profile)).teacher.branch, profile.teacher.branch);
  });

  test('a branch without one of its names reads it as empty', () {
    final teacher = teacherFromJson({
      'id': 7,
      'branch': {'id': 3, 'nameBn': 'মির্জাপুর শাখা', 'nameEn': null},
    });

    expect(teacher.branch?.nameIn('en'), 'মির্জাপুর শাখা');
  });

  test('a profile kept on the phone before branches, or from an older server, still loads without one', () {
    final cached = {
      'teacher': {'id': 7, 'firstName': 'Nasima', 'lastName': 'Akter', 'phone': '01711000001'},
      'today': '2026-03-10',
      'classes': [],
    };

    expect(profileFromJson(cached).teacher.branch, isNull);
    expect(profileFromJson({...cached, 'teacher': {...cached['teacher'] as Json, 'branch': null}}).teacher.branch, isNull);
    expect(profileFromJson(profileToJson(profileFromJson(cached))).teacher.branch, isNull);
  });
}
