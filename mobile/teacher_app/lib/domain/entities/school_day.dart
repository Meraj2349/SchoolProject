/// Bangladesh is UTC+6 all year (no daylight saving).
const _schoolUtcOffset = Duration(hours: 6);

/// The school day ("YYYY-MM-DD") that [now] falls on, as the server counts days.
String schoolToday(DateTime now) {
  final d = now.toUtc().add(_schoolUtcOffset);
  String two(int n) => n.toString().padLeft(2, '0');
  return '${d.year.toString().padLeft(4, '0')}-${two(d.month)}-${two(d.day)}';
}
