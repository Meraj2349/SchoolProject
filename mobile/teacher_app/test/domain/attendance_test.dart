import 'package:flutter_test/flutter_test.dart';
import 'package:teacher_app/domain/attendance.dart';

void main() {
  group('AttendanceStatus', () {
    test('matches the server values, Leave included', () {
      expect(AttendanceStatus.values.map((s) => s.apiValue), ['Present', 'Absent', 'Late', 'Leave']);
      expect(AttendanceStatus.fromApi('Leave'), AttendanceStatus.leave);
      expect(AttendanceStatus.fromApi(null), isNull);
      expect(AttendanceStatus.fromApi('Excused'), isNull);
    });
  });

  group('schoolToday', () {
    test('is the date in Bangladesh, which turns over at 18:00 UTC', () {
      expect(schoolToday(DateTime.utc(2026, 3, 1, 17, 59)), '2026-03-01');
      expect(schoolToday(DateTime.utc(2026, 3, 1, 18, 0)), '2026-03-02');
    });
  });

  group('DayCounts', () {
    test('counts each status of the day', () {
      final counts = DayCounts.of([
        AttendanceStatus.present,
        AttendanceStatus.present,
        AttendanceStatus.absent,
        AttendanceStatus.leave,
      ]);
      expect([counts.present, counts.absent, counts.late, counts.leave], [2, 1, 0, 1]);
    });
  });

  group('syncOutcomeOf', () {
    test('tells a day to drop, keep for later, or sign out', () {
      expect(syncOutcomeOf(200), SyncOutcome.done);
      expect(syncOutcomeOf(401), SyncOutcome.signedOut);
      for (final refused in [400, 403, 404, 409]) {
        expect(syncOutcomeOf(refused), SyncOutcome.refused);
      }
      for (final later in [429, 500, 502, 503]) {
        expect(syncOutcomeOf(later), SyncOutcome.retryLater);
      }
    });
  });

  group('PendingDay', () {
    test('survives a round trip through JSON, as the phone stores it', () {
      final day = PendingDay(
        clientRef: 'r1',
        classId: 10,
        className: 'Class 5',
        section: 'Good',
        date: '2026-03-10',
        entries: {101: AttendanceStatus.present, 102: AttendanceStatus.absent},
        takenAt: DateTime.utc(2026, 3, 10, 3, 15),
      );

      final copy = PendingDay.fromJson(day.toJson());

      expect(copy.toJson(), day.toJson());
      expect(copy.requestBody(), {
        'entries': [
          {'studentId': 101, 'status': 'Present'},
          {'studentId': 102, 'status': 'Absent'},
        ],
        'takenAt': '2026-03-10T03:15:00.000Z',
        'clientRef': 'r1',
      });
    });

    test('keeps why the server refused it', () {
      final day = PendingDay(
        clientRef: 'r1', classId: 10, className: 'Class 5', section: 'Good', date: '2026-03-10',
        entries: const {}, takenAt: DateTime.utc(2026, 3, 10),
      ).refused('Teachers can take today only.');

      expect(PendingDay.fromJson(day.toJson()).refusal, 'Teachers can take today only.');
    });
  });

  group('Roster', () {
    test('reads the server roster: who took the day, when, and whether it can still change', () {
      final roster = Roster.fromJson({
        'class': {'id': 10, 'name': 'Class 5', 'section': 'Good', 'branchId': 1},
        'date': '2026-03-10',
        'editable': true,
        'takenBy': {'type': 'teacher', 'id': 7, 'name': 'Nasima Akter', 'at': '2026-03-10T03:15:00.000Z'},
        'students': [
          {'studentId': 101, 'firstName': 'Rahim', 'lastName': 'Uddin', 'roll': '1', 'status': 'Absent'},
          {'studentId': 102, 'firstName': 'Karim', 'lastName': null, 'roll': '2', 'status': null},
        ],
      });

      expect(roster.classId, 10);
      expect(roster.takenByName, 'Nasima Akter');
      expect(roster.takenAt, DateTime.utc(2026, 3, 10, 3, 15));
      expect(roster.students.map((s) => s.fullName), ['Rahim Uddin', 'Karim']);
      expect(roster.students.map((s) => s.status), [AttendanceStatus.absent, null]);
      expect(Roster.fromJson(roster.toJson()).toJson(), roster.toJson());
    });
  });
}
