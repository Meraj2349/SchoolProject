import 'package:flutter/foundation.dart';

import '../../domain/usecases/session_use_cases.dart';

enum AppPhase { starting, signedOut, signedIn }

/// The app as a whole: whether someone is signed in, and in which language.
class AppViewModel extends ChangeNotifier {
  AppViewModel({required this._restore, required this._changeLanguage, required this.defaultServerUrl});

  final RestoreSession _restore;
  final ChangeLanguage _changeLanguage;

  /// The school's server, built into the APK (--dart-define=API_URL=...).
  final String defaultServerUrl;

  AppPhase phase = AppPhase.starting;
  String language = defaultLanguage;
  String? _lastServerUrl;

  /// Set when the server signed this phone out (access off, password reset).
  bool signedOutByServer = false;

  /// The address to sign in to: the last one used, else the built-in one.
  String get serverForSignIn => _lastServerUrl ?? defaultServerUrl;

  Future<void> start() async {
    final session = await _restore();
    language = session.language;
    _lastServerUrl = session.serverUrl;
    phase = session.signedIn ? AppPhase.signedIn : AppPhase.signedOut;
    notifyListeners();
  }

  void signedIn({String? serverUrl}) {
    _lastServerUrl = serverUrl ?? _lastServerUrl;
    signedOutByServer = false;
    phase = AppPhase.signedIn;
    notifyListeners();
  }

  void signedOut({required bool byServer}) {
    signedOutByServer = byServer;
    phase = AppPhase.signedOut;
    notifyListeners();
  }

  Future<void> setLanguage(String code) async {
    language = code;
    notifyListeners();
    await _changeLanguage(code);
  }
}
