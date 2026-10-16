import 'package:flutter/foundation.dart';

import '../../domain/errors.dart';
import '../../domain/usecases/session_use_cases.dart';
import 'app_view_model.dart';

/// How a password change went; the view turns it into text.
@immutable
sealed class PasswordOutcome {
  const PasswordOutcome();

  const factory PasswordOutcome.changed() = PasswordChanged;
  const factory PasswordOutcome.tooShort() = PasswordTooShort;
  const factory PasswordOutcome.offline() = PasswordOffline;

  /// The server's reason (e.g. the current password is wrong).
  const factory PasswordOutcome.refused(String message) = PasswordRefused;
}

// Without fields these are always const, so identical values are equal.
class PasswordChanged extends PasswordOutcome {
  const PasswordChanged();
}

class PasswordTooShort extends PasswordOutcome {
  const PasswordTooShort();
}

class PasswordOffline extends PasswordOutcome {
  const PasswordOffline();
}

class PasswordRefused extends PasswordOutcome {
  const PasswordRefused(this.message);

  final String message;

  @override
  bool operator ==(Object other) => other is PasswordRefused && other.message == message;

  @override
  int get hashCode => message.hashCode;
}

/// Language, password and signing out.
class SettingsViewModel extends ChangeNotifier {
  SettingsViewModel({required this._changePassword, required this._signOut, required this._app}) {
    _app.addListener(notifyListeners);
  }

  final ChangePassword _changePassword;
  final SignOut _signOut;
  final AppViewModel _app;

  String get language => _app.language;
  Future<void> setLanguage(String code) => _app.setLanguage(code);

  Future<PasswordOutcome> changePassword({required String current, required String next}) async {
    if (!ChangePassword.isAcceptable(next)) return const PasswordOutcome.tooShort();
    try {
      await _changePassword(current: current, next: next);
      return const PasswordOutcome.changed();
    } on ApiException catch (e) {
      return PasswordOutcome.refused(e.message);
    } on OfflineException {
      return const PasswordOutcome.offline();
    } on SignedOutException {
      _app.signedOut(byServer: true);
      return const PasswordOutcome.offline();
    }
  }

  Future<void> signOut() async {
    await _signOut();
    _app.signedOut(byServer: false);
  }

  @override
  void dispose() {
    _app.removeListener(notifyListeners);
    super.dispose();
  }
}
