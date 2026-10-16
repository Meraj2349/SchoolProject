import 'package:flutter/foundation.dart';

import '../../domain/entities/server_address.dart';
import '../../domain/errors.dart';
import '../../domain/usecases/session_use_cases.dart';
import 'app_view_model.dart';

/// Why signing in did not work; the view turns it into text.
@immutable
sealed class SignInError {
  const SignInError();

  /// The server's own reason, already in the teacher's language.
  const factory SignInError.refused(String message) = SignInRefused;
  const factory SignInError.offline() = SignInOffline;
  const factory SignInError.badServer() = SignInBadServer;
  const factory SignInError.unexpected() = SignInUnexpected;
}

class SignInRefused extends SignInError {
  const SignInRefused(this.message);

  final String message;

  @override
  bool operator ==(Object other) => other is SignInRefused && other.message == message;

  @override
  int get hashCode => message.hashCode;
}

// Without fields these are always const, so identical values are equal.
class SignInOffline extends SignInError {
  const SignInOffline();
}

class SignInBadServer extends SignInError {
  const SignInBadServer();
}

class SignInUnexpected extends SignInError {
  const SignInUnexpected();
}

class SignInViewModel extends ChangeNotifier {
  SignInViewModel({required this._signIn, required this._app, this.allowInsecureServer = false});

  /// Debug builds may use a plain-http server (a laptop on the school's network).
  final bool allowInsecureServer;

  final SignIn _signIn;
  final AppViewModel _app;

  bool busy = false;
  SignInError? error;

  bool get signedOutByServer => _app.signedOutByServer;

  /// A school server address the app may sign in to.
  bool isValidServer(String address) {
    try {
      parseServerUrl(address, allowInsecure: allowInsecureServer);
      return true;
    } on FormatException {
      return false;
    }
  }
  String get serverForSignIn => _app.serverForSignIn;

  Future<void> submit({required String server, required String phone, required String password}) async {
    busy = true;
    error = null;
    notifyListeners();
    try {
      await _signIn(serverUrl: server, phone: phone, password: password);
      _app.signedIn(serverUrl: server);
    } on ApiException catch (e) {
      error = SignInError.refused(e.message);
    } on OfflineException {
      error = const SignInError.offline();
    } on FormatException {
      error = const SignInError.badServer();
    } catch (_) {
      error = const SignInError.unexpected();
    } finally {
      busy = false;
      notifyListeners();
    }
  }
}
