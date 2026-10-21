import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../app/di.dart';
import '../l10n/app_localizations.dart';
import 'theme/admin_theme.dart';
import 'viewmodels/app_view_model.dart';
import 'viewmodels/sign_in_view_model.dart';
import 'viewmodels/today_view_model.dart';
import 'views/sign_in_view.dart';
import 'views/today_view.dart';
import 'widgets/view_model_builder.dart';

/// The app shell: language, theme, and sign-in or the teacher's day.
class TeacherApp extends StatefulWidget {
  const TeacherApp({super.key, required this.deps});

  final AppDependencies deps;

  @override
  State<TeacherApp> createState() => _TeacherAppState();
}

class _TeacherAppState extends State<TeacherApp> {
  final _navigator = GlobalKey<NavigatorState>();

  AppViewModel get _app => widget.deps.app;

  @override
  void initState() {
    super.initState();
    _app.addListener(_closePagesWhenSignedOut);
  }

  @override
  void dispose() {
    _app.removeListener(_closePagesWhenSignedOut);
    super.dispose();
  }

  /// Signed out (by the server, or on purpose): back to the sign-in page.
  void _closePagesWhenSignedOut() {
    if (_app.phase == AppPhase.signedOut) _navigator.currentState?.popUntil((route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) => ListenableBuilder(
        listenable: _app,
        builder: (context, _) => MaterialApp(
          navigatorKey: _navigator,
          onGenerateTitle: (context) => AppLocalizations.of(context).appTitle,
          theme: adminTheme(),
          locale: Locale(_app.language),
          supportedLocales: AppLocalizations.supportedLocales,
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: switch (_app.phase) {
            AppPhase.starting => const Scaffold(body: Center(child: CircularProgressIndicator())),
            AppPhase.signedOut => ViewModelBuilder<SignInViewModel>(
                key: const ValueKey('sign-in'),
                create: widget.deps.signInViewModel,
                builder: (context, vm) => SignInView(viewModel: vm),
              ),
            AppPhase.signedIn => ViewModelBuilder<TodayViewModel>(
                key: const ValueKey('today'),
                create: widget.deps.todayViewModel,
                onReady: (vm) => vm.load(),
                builder: (context, vm) => TodayView(deps: widget.deps, viewModel: vm),
              ),
          },
        ),
      );
}
