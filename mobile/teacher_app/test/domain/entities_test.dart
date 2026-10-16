import 'package:flutter_test/flutter_test.dart';
import 'package:teacher_app/domain/entities/attendance_status.dart';
import 'package:teacher_app/domain/entities/school_day.dart';
import 'package:teacher_app/domain/errors.dart';

import '../support/fake_repositories.dart';

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

  test('DayCounts counts each status of the day', () {
    final counts = DayCounts.of([AttendanceStatus.present, AttendanceStatus.present, AttendanceStatus.absent, AttendanceStatus.leave]);
    expect([counts.present, counts.absent, counts.late, counts.leave], [2, 1, 0, 1]);
  });

  test('a refusal can be retried later only when the server is busy or broken', () {
    for (final later in [429, 500, 502, 503]) {
      expect(ApiException(later, '').canRetryLater, isTrue);
    }
    for (final refused in [400, 403, 404, 409]) {
      expect(ApiException(refused, '').canRetryLater, isFalse);
    }
  });

  test('a profile from an earlier day shows the classes as not taken yet', () {
    final yesterday = profileOn('2026-03-09', taken: true, takenAt: DateTime.utc(2026, 3, 9, 3));

    final today = yesterday.forDay('2026-03-10');

    expect(today.today, '2026-03-10');
    expect(today.classes.map((c) => c.taken), [false, false]);
    expect(identical(yesterday.forDay('2026-03-09'), yesterday), isTrue);
  });

  test('a roster gives a new day with the same students and nobody marked', () {
    final marked = rosterOf('2026-03-09', statuses: {101: AttendanceStatus.absent});

    final next = marked.blankFor('2026-03-10', editable: true);

    expect(next.date, '2026-03-10');
    expect(next.students.map((s) => s.status), [null, null]);
    expect(marked.withStatuses({102: AttendanceStatus.leave}).students.map((s) => s.status), [AttendanceStatus.absent, AttendanceStatus.leave]);
  });

  test('a refused day keeps the server\'s reason', () {
    final day = pendingOn('2026-03-10', const {}).refused('Teachers can take today only.');

    expect(day.isRefused, isTrue);
    expect(day.refusal, 'Teachers can take today only.');
  });
}
