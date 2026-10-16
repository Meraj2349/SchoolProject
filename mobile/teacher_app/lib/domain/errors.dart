/// The server answered, but refused: [message] is its reason, already in the
/// teacher's language.
class ApiException implements Exception {
  const ApiException(this.statusCode, this.message);

  final int statusCode;
  final String message;

  /// The server is busy or broken (429 or 5xx): worth sending again later.
  /// Any other refusal (the day is locked, not the teacher's class...) will
  /// not change by sending it again.
  bool get canRetryLater => statusCode == 429 || statusCode >= 500;

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// The server could not be reached (no connection, timeout, DNS, TLS...).
class OfflineException implements Exception {
  const OfflineException();
}

/// The server no longer accepts this phone's sign-in (access switched off,
/// password reset): the teacher has to sign in again.
class SignedOutException implements Exception {
  const SignedOutException();
}
