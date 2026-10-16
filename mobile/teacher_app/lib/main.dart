import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import 'data/attendance_repository.dart';
import 'data/local_store.dart';
import 'data/session_store.dart';
import 'ui/app.dart';
import 'ui/app_controller.dart';

/// The school server built into the APK: flutter build apk --dart-define=API_URL=https://...
const defaultServerUrl = String.fromEnvironment('API_URL');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final store = await SqfliteLocalStore.open(databaseFactory, p.join(await getDatabasesPath(), 'teacher_app.db'));
  final repository = AttendanceRepository(
    store: store,
    session: SecureSessionStore(),
    client: http.Client(),
    allowInsecureServer: kDebugMode,
  );
  final onlineChanges = Connectivity()
      .onConnectivityChanged
      .map((results) => results.any((r) => r != ConnectivityResult.none));
  final controller = AppController(repository: repository, onlineChanges: onlineChanges, defaultServerUrl: defaultServerUrl);
  runApp(TeacherApp(controller: controller));
  await controller.start();
}
