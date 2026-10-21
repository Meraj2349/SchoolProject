import 'package:flutter/material.dart';

import '../../domain/entities/attendance_status.dart';

/// The website admin panel's classic palette (AdminLTE), so the app and the
/// office's screens look like one system.
abstract final class AdminColors {
  static const primary = Color(0xFF3C8DBC);
  static const primaryDark = Color(0xFF367FA9);
  static const success = Color(0xFF00A65A);
  static const warning = Color(0xFFF39C12);
  static const danger = Color(0xFFDD4B39);
  static const info = Color(0xFF00C0EF);
  static const muted = Color(0xFF94A3B8);

  static const contentBg = Color(0xFFECF0F5);
  static const loginBg = Color(0xFFD2D6DE);
  static const border = Color(0xFFD2D6DE);
  static const divider = Color(0xFFF4F4F4);
  static const text = Color(0xFF333333);
  static const textMuted = Color(0xFF777777);

  static const sidebarBg = Color(0xFF222D32);
  static const sidebarActiveBg = Color(0xFF1E282C);
  static const sidebarText = Color(0xFFB8C7CE);
  static const sidebarHeading = Color(0xFF4B646F);
  static const sidebarUserBg = Color(0xFF2C3B41);

  static const defaultButtonBg = Color(0xFFF4F4F4);
  static const defaultButtonBorder = Color(0xFFDDDDDD);
  static const defaultButtonText = Color(0xFF444444);
}

/// AdminLTE's small corner radius.
const adminRadius = BorderRadius.all(Radius.circular(3));

enum Tone { primary, success, warning, danger, info, muted }

Color toneColor(Tone tone) => switch (tone) {
      Tone.primary => AdminColors.primary,
      Tone.success => AdminColors.success,
      Tone.warning => AdminColors.warning,
      Tone.danger => AdminColors.danger,
      Tone.info => AdminColors.info,
      Tone.muted => AdminColors.muted,
    };

/// Present green, Absent red, Late amber, Leave blue: as on the website.
Tone statusTone(AttendanceStatus status) => switch (status) {
      AttendanceStatus.present => Tone.success,
      AttendanceStatus.absent => Tone.danger,
      AttendanceStatus.late => Tone.warning,
      AttendanceStatus.leave => Tone.info,
    };

ThemeData adminTheme() {
  const font = 'HindSiliguri'; // Bangla and Latin in one face
  final scheme = ColorScheme.fromSeed(
    seedColor: AdminColors.primary,
    primary: AdminColors.primary,
    secondary: AdminColors.primaryDark,
    error: AdminColors.danger,
    surface: Colors.white,
  );
  const fieldBorder = OutlineInputBorder(borderRadius: adminRadius, borderSide: BorderSide(color: AdminColors.border));
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    fontFamily: font,
    scaffoldBackgroundColor: AdminColors.contentBg,
    dividerColor: AdminColors.divider,
    appBarTheme: const AppBarTheme(
      backgroundColor: AdminColors.primary,
      foregroundColor: Colors.white,
      elevation: 0,
      scrolledUnderElevation: 0,
      titleTextStyle: TextStyle(fontFamily: font, fontSize: 19, fontWeight: FontWeight.w600, color: Colors.white),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AdminColors.primary,
        foregroundColor: Colors.white,
        minimumSize: const Size(0, 46),
        shape: const RoundedRectangleBorder(borderRadius: adminRadius, side: BorderSide(color: AdminColors.primaryDark)),
        textStyle: const TextStyle(fontFamily: font, fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        backgroundColor: AdminColors.defaultButtonBg,
        foregroundColor: AdminColors.defaultButtonText,
        side: const BorderSide(color: AdminColors.defaultButtonBorder),
        shape: const RoundedRectangleBorder(borderRadius: adminRadius),
        textStyle: const TextStyle(fontFamily: font, fontSize: 14, fontWeight: FontWeight.w500),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(foregroundColor: AdminColors.primary, shape: const RoundedRectangleBorder(borderRadius: adminRadius)),
    ),
    inputDecorationTheme: const InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      isDense: true,
      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      border: fieldBorder,
      enabledBorder: fieldBorder,
      focusedBorder: OutlineInputBorder(borderRadius: adminRadius, borderSide: BorderSide(color: AdminColors.primary, width: 1.5)),
      errorBorder: OutlineInputBorder(borderRadius: adminRadius, borderSide: BorderSide(color: AdminColors.danger)),
    ),
    dialogTheme: const DialogThemeData(shape: RoundedRectangleBorder(borderRadius: adminRadius)),
    snackBarTheme: const SnackBarThemeData(behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: adminRadius)),
  );
}
