import 'attendance_status.dart';

/// A class's day saved on the phone, waiting to reach the server.
class PendingDay {
  /// [clientRef] tells saved days apart on the phone.
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
}
