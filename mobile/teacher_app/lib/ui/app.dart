import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../l10n/app_localizations.dart';
import 'app_controller.dart';
import 'screens/sign_in_screen.dart';
import 'screens/today_screen.dart';
import 'theme.dart';

class TeacherApp extends StatefulWidget {
  const TeacherApp({super.key, required this.controller});

  final AppController controller;

  @override
  State<TeacherApp> createState() => _TeacherAppState();
}

class _TeacherAppState extends State<TeacherApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  /// Back in the app (perhaps the next morning): reload the day and send what was saved while away.
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && widget.controller.phase == AppPhase.signedIn) {
      unawaited(widget.controller.refresh());
    }
  }

  @override
  Widget build(BuildContext context) => ListenableBuilder(
        listenable: widget.controller,
        builder: (context, _) {
          final controller = widget.controller;
          return MaterialApp(
            onGenerateTitle: (context) => AppLocalizations.of(context).appTitle,
            theme: schoolTheme(),
            locale: Locale(controller.language),
            supportedLocales: AppLocalizations.supportedLocales,
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            home: switch (controller.phase) {
              AppPhase.starting => const Scaffold(body: Center(child: CircularProgressIndicator())),
              AppPhase.signedOut => SignInScreen(key: const ValueKey('sign-in'), controller: controller),
              AppPhase.signedIn => TodayScreen(controller: controller),
            },
          );
        },
      );
}
