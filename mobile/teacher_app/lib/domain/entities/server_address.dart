/// The school server's address as typed by an admin or teacher, e.g.
/// "school.example.com" → https://school.example.com. A trailing "/api" is
/// dropped. Plain http is refused unless [allowInsecure] (debug builds),
/// because the password travels with each sign-in.
Uri parseServerUrl(String input, {bool allowInsecure = false}) {
  var text = input.trim();
  if (text.isEmpty) throw const FormatException('empty');
  if (!text.contains('://')) text = 'https://$text';
  final uri = Uri.tryParse(text);
  if (uri == null || uri.host.isEmpty || !(uri.scheme == 'https' || uri.scheme == 'http')) {
    throw const FormatException('not a web address');
  }
  if (uri.scheme == 'http' && !allowInsecure) throw const FormatException('not https');
  var path = uri.path.replaceAll(RegExp(r'/+$'), '');
  if (path.endsWith('/api')) path = path.substring(0, path.length - 4);
  return uri.replace(path: path, query: null, fragment: null);
}
