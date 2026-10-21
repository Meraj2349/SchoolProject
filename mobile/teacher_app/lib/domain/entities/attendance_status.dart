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
