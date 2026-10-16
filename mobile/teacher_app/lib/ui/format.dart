import 'package:intl/intl.dart';

import '../domain/attendance.dart';
import '../l10n/app_localizations.dart';

/// "09:15" on the school's clock (Bangladesh, UTC+6), in the app's language.
String formatSchoolTime(DateTime time, String locale) =>
    DateFormat('HH:mm', locale).format(time.toUtc().add(const Duration(hours: 6)));

/// "16 October 2026" for a "YYYY-MM-DD" school day.
String formatSchoolDay(String day, String locale) => DateFormat.yMMMMd(locale).format(DateTime.parse(day));

/// A count in the app's language (Bangla digits in Bangla).
String formatCount(int value, String locale) => NumberFormat.decimalPattern(locale).format(value);

String statusLabel(AppLocalizations t, AttendanceStatus status) => switch (status) {
      AttendanceStatus.present => t.present,
      AttendanceStatus.absent => t.absent,
      AttendanceStatus.late => t.late,
      AttendanceStatus.leave => t.leave,
    };
