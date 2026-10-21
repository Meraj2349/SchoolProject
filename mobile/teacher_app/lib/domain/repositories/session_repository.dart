import '../entities/teacher.dart';

/// The teacher's sign-in on this phone, and the app's language.
abstract interface class SessionRepository {
  Future<bool> isSignedIn();

  /// The server the teacher last signed in to, if any.
  Future<String?> lastServerUrl();

  /// Throws ApiException (refused), OfflineException, or FormatException (bad address).
  Future<Profile> signIn({required String serverUrl, required String phone, required String password});

  Future<void> changePassword(String current, String next);

  /// Forgets the sign-in and everything kept on the phone.
  Future<void> signOut();

  Future<String?> savedLanguage();
  Future<void> saveLanguage(String code);
}
