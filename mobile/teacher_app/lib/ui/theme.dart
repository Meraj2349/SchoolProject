import 'package:flutter/material.dart';

import '../domain/attendance.dart';

// The school website's colours: navy and gold on cream.
const schoolNavy = Color(0xFF0D1F3C);
const schoolNavyDeep = Color(0xFF081428);
const schoolGold = Color(0xFFC9A84C);
const schoolGoldSoft = Color(0xFFE2C07A);
const schoolCream = Color(0xFFFDF8F0);
const schoolInk = Color(0xFF1F2933);

const statusColors = {
  AttendanceStatus.present: Color(0xFF2E7D32),
  AttendanceStatus.absent: Color(0xFFC62828),
  AttendanceStatus.late: Color(0xFFB7791F),
  AttendanceStatus.leave: Color(0xFF1565C0),
};

ThemeData schoolTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: schoolNavy,
    primary: schoolNavy,
    secondary: schoolGold,
    surface: schoolCream,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    fontFamily: 'HindSiliguri',
    scaffoldBackgroundColor: schoolCream,
    appBarTheme: const AppBarTheme(
      backgroundColor: schoolNavy,
      foregroundColor: Colors.white,
      titleTextStyle: TextStyle(fontFamily: 'HindSiliguri', fontSize: 20, fontWeight: FontWeight.w600, color: Colors.white),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: schoolNavy,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(52),
        textStyle: const TextStyle(fontFamily: 'HindSiliguri', fontSize: 18, fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder(), filled: true, fillColor: Colors.white),
    cardTheme: const CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: EdgeInsets.symmetric(vertical: 6),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
        side: BorderSide(color: Color(0x220D1F3C)),
      ),
    ),
  );
}
