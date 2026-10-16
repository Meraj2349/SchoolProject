import '../entities/teacher.dart';
import '../repositories/session_repository.dart';

// The teacher's sign-in and the app's language. Each use case is one intent;
// it depends only on the SessionRepository contract.

const defaultLanguage = 'bn';

typedef SessionStatus = ({bool signedIn, String? serverUrl, String language});

class RestoreSession {
  const RestoreSession(this._repository);

  final SessionRepository _repository;

  Future<SessionStatus> call() async => (
        signedIn: await _repository.isSignedIn(),
        serverUrl: await _repository.lastServerUrl(),
        language: await _repository.savedLanguage() ?? defaultLanguage,
      );
}

class SignIn {
  const SignIn(this._repository);

  final SessionRepository _repository;

  Future<Profile> call({required String serverUrl, required String phone, required String password}) =>
      _repository.signIn(serverUrl: serverUrl, phone: phone, password: password);
}

class ChangePassword {
  const ChangePassword(this._repository);

  final SessionRepository _repository;

  /// The server's rule: at least 8 characters.
  static const minLength = 8;

  static bool isAcceptable(String password) => password.runes.length >= minLength;

  Future<void> call({required String current, required String next}) => _repository.changePassword(current, next);
}

class SignOut {
  const SignOut(this._repository);

  final SessionRepository _repository;

  Future<void> call() => _repository.signOut();
}

class ChangeLanguage {
  const ChangeLanguage(this._repository);

  final SessionRepository _repository;

  Future<void> call(String code) => _repository.saveLanguage(code);
}
