import 'attendance_status.dart';
import 'pending_day.dart';
import 'roster.dart';
import 'teacher.dart';

// What the use cases give the screens: the day at a glance, and one class's day.

enum ClassDayState { notTaken, taken, waiting }

/// One of the teacher's classes on the day.
class ClassToday {
  const ClassToday({required this.schoolClass, required this.state, this.takenAt});

  final SchoolClass schoolClass;
  final ClassDayState state;
  final DateTime? takenAt;
}

class TodayOverview {
  const TodayOverview({
    required this.profile,
    required this.online,
    required this.classes,
    required this.waiting,
    required this.refused,
  });

  final Profile profile;

  /// False: the phone's copy, the server could not be reached.
  final bool online;
  final List<ClassToday> classes;

  /// Days saved on the phone, still to be sent.
  final int waiting;

  /// Days the server refused, with its reason.
  final List<PendingDay> refused;

  String get today => profile.today;
}

/// A class's day to take: everyone starts as present, a saved day keeps its
/// statuses, and a save still waiting on the phone wins over both.
class ClassDay {
  const ClassDay({required this.roster, required this.fresh, required this.statuses, required this.hasWaitingSave});

  final Roster roster;
  final bool fresh;
  final Map<int, AttendanceStatus> statuses;
  final bool hasWaitingSave;
}
