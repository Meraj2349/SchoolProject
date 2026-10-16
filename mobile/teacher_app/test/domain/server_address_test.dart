import 'package:flutter_test/flutter_test.dart';
import 'package:teacher_app/domain/entities/server_address.dart';

void main() {
  test('reads the school server address the way people type it', () {
    expect(parseServerUrl('school.example.com').toString(), 'https://school.example.com');
    expect(parseServerUrl(' https://school.example.com/api/ ').toString(), 'https://school.example.com');
    expect(parseServerUrl('https://example.com/school/api').toString(), 'https://example.com/school');
  });

  test('refuses plain http, unless allowed, and anything that is not an address', () {
    expect(() => parseServerUrl('http://192.168.0.10:3000'), throwsFormatException);
    expect(parseServerUrl('http://192.168.0.10:3000', allowInsecure: true).toString(), 'http://192.168.0.10:3000');
    expect(() => parseServerUrl(''), throwsFormatException);
    expect(() => parseServerUrl('ftp://school.example.com'), throwsFormatException);
  });
}
