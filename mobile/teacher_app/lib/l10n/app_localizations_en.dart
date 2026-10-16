// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Teacher attendance';

  @override
  String get schoolName => 'Star Shiksha Paribar';

  @override
  String get signInTitle => 'Sign in';

  @override
  String get signInHint =>
      'Use the mobile number and password your school gave you.';

  @override
  String get serverLabel => 'School server address';

  @override
  String get serverHint => 'e.g. school.example.com';

  @override
  String get changeServer => 'Change server address';

  @override
  String get phoneLabel => 'Mobile number';

  @override
  String get passwordLabel => 'Password';

  @override
  String get signInButton => 'Sign in';

  @override
  String get fieldRequired => 'Required';

  @override
  String get serverInvalid => 'Give a valid address (https://...)';

  @override
  String get offlineSignIn =>
      'No connection. Connect to the internet to sign in.';

  @override
  String get errorGeneric => 'Something went wrong. Please try again.';

  @override
  String get signedOutNotice =>
      'You have been signed out. Please sign in again.';

  @override
  String greeting(String name) {
    return 'Hello, $name';
  }

  @override
  String todayIs(String date) {
    return 'Today is $date';
  }

  @override
  String get noClasses =>
      'You are not the class teacher of any class yet. Ask the school admin.';

  @override
  String classStudents(String count) {
    return '$count students';
  }

  @override
  String get notTaken => 'Not taken';

  @override
  String takenAt(String time) {
    return 'Taken at $time';
  }

  @override
  String get waitingToSync => 'Waiting to send';

  @override
  String get offlineBanner =>
      'No connection. Showing the lists saved on the phone.';

  @override
  String pendingBanner(String count) {
    return 'Waiting to be sent: $count';
  }

  @override
  String get syncNow => 'Send now';

  @override
  String synced(String count) {
    return 'Sent: $count';
  }

  @override
  String refusedTitle(String className, String date) {
    return 'Not sent: $className, $date';
  }

  @override
  String get discard => 'Discard';

  @override
  String takeTitle(String className, String section) {
    return '$className — $section';
  }

  @override
  String get present => 'Present';

  @override
  String get absent => 'Absent';

  @override
  String get late => 'Late';

  @override
  String get leave => 'Leave';

  @override
  String counts(String present, String absent, String late, String leave) {
    return 'Present $present · Absent $absent · Late $late · Leave $leave';
  }

  @override
  String get allPresent => 'All present';

  @override
  String get save => 'Save';

  @override
  String get savedOnline => 'Attendance saved';

  @override
  String get savedOffline =>
      'Saved on the phone. It will be sent when you are online.';

  @override
  String keptNewer(String count) {
    return '$count students were changed later by the office; that change was kept.';
  }

  @override
  String get lockedDay =>
      'Only today\'s attendance can be taken in the app. Ask the office about another day.';

  @override
  String get rosterOffline => 'No connection: the list saved on the phone.';

  @override
  String get noRosterOffline =>
      'No connection, and this class list is not on the phone yet.';

  @override
  String takenBy(String name, String time) {
    return 'Taken by $name at $time';
  }

  @override
  String get noStudents => 'No students in this class.';

  @override
  String get retry => 'Try again';

  @override
  String get settingsTitle => 'Settings';

  @override
  String get language => 'Language';

  @override
  String get bangla => 'বাংলা (Bangla)';

  @override
  String get english => 'English';

  @override
  String get changePassword => 'Change password';

  @override
  String get currentPassword => 'Current password';

  @override
  String get newPassword => 'New password';

  @override
  String get passwordTooShort => 'At least 8 characters';

  @override
  String get passwordChanged => 'Password changed';

  @override
  String get signOut => 'Sign out';

  @override
  String get signOutConfirm => 'Sign out?';

  @override
  String signOutPending(String count) {
    return '$count days have not been sent yet. Signing out deletes them.';
  }

  @override
  String get cancel => 'Cancel';

  @override
  String signedInAs(String name, String phone) {
    return '$name ($phone)';
  }

  @override
  String get mainNavigation => 'MAIN NAVIGATION';

  @override
  String get navToday => 'Today\'s attendance';

  @override
  String get statusOnline => 'Online';

  @override
  String get statusOffline => 'Offline';

  @override
  String get signInBoxMessage => 'Sign in to start taking attendance';

  @override
  String get myClasses => 'My classes';

  @override
  String get statClasses => 'Classes';

  @override
  String get statTaken => 'Taken';

  @override
  String get statNotTaken => 'Not taken';

  @override
  String get statWaiting => 'To send';

  @override
  String get studentsBox => 'Students';

  @override
  String get account => 'Account';

  @override
  String get security => 'Security';

  @override
  String get settingsSubtitle => 'Language, password and signing out';

  @override
  String get sending => 'Sending…';

  @override
  String get signOutHint =>
      'Signing out removes everything kept on this phone.';

  @override
  String roll(String roll) {
    return 'Roll $roll';
  }

  @override
  String get openNavigation => 'Open menu';
}
