import 'package:flutter/material.dart';

import 'app/di.dart';
import 'presentation/app.dart';

/// The school server built into the APK: flutter build apk --dart-define=API_URL=https://...
const defaultServerUrl = String.fromEnvironment('API_URL');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final deps = await AppDependencies.create(defaultServerUrl: defaultServerUrl);
  runApp(TeacherApp(deps: deps));
  await deps.app.start();
}
