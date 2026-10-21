import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:teacher_app/l10n/app_localizations.dart';

void main() {
  test('counts one student and several students in English', () {
    final en = lookupAppLocalizations(const Locale('en'));

    expect(en.classStudents(1, '1'), '1 student');
    expect(en.classStudents(2, '2'), '2 students');
  });

  test('counts students in Bangla with Bangla digits', () {
    final bn = lookupAppLocalizations(const Locale('bn'));

    expect(bn.classStudents(1, '১'), '১ জন শিক্ষার্থী');
  });
}
