import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import '../data/datasources/local_store.dart';
import '../data/datasources/session_store.dart';
import '../data/repositories/teacher_app_repository.dart';
import '../domain/repositories/attendance_repository.dart';
import '../domain/repositories/session_repository.dart';
import '../domain/usecases/attendance_use_cases.dart';
import '../domain/usecases/session_use_cases.dart';
import '../presentation/viewmodels/app_view_model.dart';
import '../presentation/viewmodels/settings_view_model.dart';
import '../presentation/viewmodels/sign_in_view_model.dart';
import '../presentation/viewmodels/take_attendance_view_model.dart';
import '../presentation/viewmodels/today_view_model.dart';

/// Composition root: the only place that knows which data sources back the
/// repositories, and that builds the use cases and view models.
class AppDependencies {
  AppDependencies({
    required SessionRepository sessionRepository,
    required AttendanceRepository attendanceRepository,
    required String defaultServerUrl,
    this.onlineChanges,
  })  : _session = sessionRepository,
        _attendance = attendanceRepository {
    app = AppViewModel(
      restore: RestoreSession(_session),
      changeLanguage: ChangeLanguage(_session),
      defaultServerUrl: defaultServerUrl,
    );
  }

  /// The real app: sqflite on the phone, the Android Keystore, HTTP and the
  /// connectivity stream.
  static Future<AppDependencies> create({required String defaultServerUrl}) async {
    final store = await SqfliteLocalStore.open(databaseFactory, p.join(await getDatabasesPath(), 'teacher_app.db'));
    final repository = TeacherAppRepository(
      store: store,
      session: SecureSessionStore(),
      client: http.Client(),
      allowInsecureServer: kDebugMode,
    );
    return AppDependencies(
      sessionRepository: repository,
      attendanceRepository: repository,
      defaultServerUrl: defaultServerUrl,
      onlineChanges: Connectivity()
          .onConnectivityChanged
          .map((results) => results.any((r) => r != ConnectivityResult.none)),
    );
  }

  final SessionRepository _session;
  final AttendanceRepository _attendance;

  /// Fires true when the phone gets a connection back.
  final Stream<bool>? onlineChanges;

  late final AppViewModel app;

  SignInViewModel signInViewModel() => SignInViewModel(signIn: SignIn(_session), app: app, allowInsecureServer: kDebugMode);

  TodayViewModel todayViewModel() => TodayViewModel(
        loadToday: LoadToday(_attendance),
        syncPending: SyncPendingDays(_attendance),
        discardPending: DiscardPendingDay(_attendance),
        app: app,
        onlineChanges: onlineChanges,
      );

  TakeAttendanceViewModel takeAttendanceViewModel({required int classId, required String date}) =>
      TakeAttendanceViewModel(
        openClassDay: OpenClassDay(_attendance),
        saveClassDay: SaveClassDay(_attendance),
        app: app,
        classId: classId,
        date: date,
      );

  SettingsViewModel settingsViewModel() =>
      SettingsViewModel(changePassword: ChangePassword(_session), signOut: SignOut(_session), app: app);
}
