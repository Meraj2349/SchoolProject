import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Local data source: where the app keeps the server address, the sign-in token and the chosen
/// language between launches.
abstract class SessionStore {
  Future<String?> serverUrl();
  Future<void> setServerUrl(String url);
  Future<String?> token();
  Future<void> setToken(String? token);
  Future<String?> language();
  Future<void> setLanguage(String language);
}

/// Android Keystore-backed storage: the token never sits in plain files.
class SecureSessionStore implements SessionStore {
  SecureSessionStore([FlutterSecureStorage? storage]) : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const _serverKey = 'server_url';
  static const _tokenKey = 'token';
  static const _languageKey = 'language';

  @override
  Future<String?> serverUrl() => _storage.read(key: _serverKey);

  @override
  Future<void> setServerUrl(String url) => _storage.write(key: _serverKey, value: url);

  @override
  Future<String?> token() => _storage.read(key: _tokenKey);

  @override
  Future<void> setToken(String? token) =>
      token == null ? _storage.delete(key: _tokenKey) : _storage.write(key: _tokenKey, value: token);

  @override
  Future<String?> language() => _storage.read(key: _languageKey);

  @override
  Future<void> setLanguage(String language) => _storage.write(key: _languageKey, value: language);
}

/// Keeps everything in memory: for tests.
class MemorySessionStore implements SessionStore {
  MemorySessionStore({this._serverUrl, this._token, this._language});

  String? _serverUrl;
  String? _token;
  String? _language;

  @override
  Future<String?> serverUrl() async => _serverUrl;

  @override
  Future<void> setServerUrl(String url) async => _serverUrl = url;

  @override
  Future<String?> token() async => _token;

  @override
  Future<void> setToken(String? token) async => _token = token;

  @override
  Future<String?> language() async => _language;

  @override
  Future<void> setLanguage(String language) async => _language = language;
}
