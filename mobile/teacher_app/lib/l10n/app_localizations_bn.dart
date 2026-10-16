// ignore: unused_import
import 'package:intl/intl.dart' as intl;

import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Bengali Bangla (`bn`).
class AppLocalizationsBn extends AppLocalizations {
  AppLocalizationsBn([String locale = 'bn']) : super(locale);

  @override
  String get appTitle => 'শিক্ষক উপস্থিতি';

  @override
  String get schoolName => 'স্টার শিক্ষা পরিবার';

  @override
  String get signInTitle => 'সাইন ইন';

  @override
  String get signInHint =>
      'বিদ্যালয় থেকে পাওয়া মোবাইল নম্বর ও পাসওয়ার্ড দিন।';

  @override
  String get serverLabel => 'বিদ্যালয়ের সার্ভারের ঠিকানা';

  @override
  String get serverHint => 'যেমন school.example.com';

  @override
  String get changeServer => 'সার্ভারের ঠিকানা বদলান';

  @override
  String get phoneLabel => 'মোবাইল নম্বর';

  @override
  String get passwordLabel => 'পাসওয়ার্ড';

  @override
  String get signInButton => 'সাইন ইন';

  @override
  String get fieldRequired => 'এটি দিতে হবে';

  @override
  String get serverInvalid => 'সঠিক ঠিকানা দিন (https://...)';

  @override
  String get offlineSignIn =>
      'ইন্টারনেট সংযোগ নেই। সাইন ইন করতে ইন্টারনেট চালু করুন।';

  @override
  String get errorGeneric => 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।';

  @override
  String get signedOutNotice =>
      'আপনাকে সাইন আউট করা হয়েছে। আবার সাইন ইন করুন।';

  @override
  String greeting(String name) {
    return 'আসসালামু আলাইকুম, $name';
  }

  @override
  String todayIs(String date) {
    return 'আজ $date';
  }

  @override
  String get noClasses =>
      'আপনি এখনো কোনো শ্রেণির শ্রেণিশিক্ষক নন। বিদ্যালয়ের অ্যাডমিনকে বলুন।';

  @override
  String classStudents(String count) {
    return '$count জন শিক্ষার্থী';
  }

  @override
  String get notTaken => 'নেওয়া হয়নি';

  @override
  String takenAt(String time) {
    return 'নেওয়া হয়েছে $time';
  }

  @override
  String get waitingToSync => 'পাঠানোর অপেক্ষায়';

  @override
  String get offlineBanner =>
      'ইন্টারনেট সংযোগ নেই। ফোনে সংরক্ষিত তালিকা দেখানো হচ্ছে।';

  @override
  String pendingBanner(String count) {
    return '$countটি দিনের উপস্থিতি পাঠানোর অপেক্ষায়';
  }

  @override
  String get syncNow => 'এখন পাঠান';

  @override
  String synced(String count) {
    return '$countটি দিনের উপস্থিতি পাঠানো হয়েছে';
  }

  @override
  String refusedTitle(String className, String date) {
    return 'পাঠানো যায়নি: $className, $date';
  }

  @override
  String get discard => 'বাদ দিন';

  @override
  String takeTitle(String className, String section) {
    return '$className — $section';
  }

  @override
  String get present => 'উপস্থিত';

  @override
  String get absent => 'অনুপস্থিত';

  @override
  String get late => 'দেরিতে';

  @override
  String get leave => 'ছুটি';

  @override
  String counts(String present, String absent, String late, String leave) {
    return 'উপস্থিত $present · অনুপস্থিত $absent · দেরিতে $late · ছুটি $leave';
  }

  @override
  String get allPresent => 'সবাই উপস্থিত';

  @override
  String get save => 'সংরক্ষণ';

  @override
  String get savedOnline => 'উপস্থিতি সংরক্ষণ হয়েছে';

  @override
  String get savedOffline => 'ফোনে সংরক্ষণ হয়েছে। ইন্টারনেট পেলেই পাঠানো হবে।';

  @override
  String keptNewer(String count) {
    return '$count জনের অবস্থা পরে অফিস থেকে বদলানো হয়েছে, সেটিই রাখা হয়েছে।';
  }

  @override
  String get lockedDay =>
      'অ্যাপে শুধু আজকের উপস্থিতি নেওয়া যায়। অন্য দিনের জন্য অফিসকে বলুন।';

  @override
  String get rosterOffline => 'ইন্টারনেট নেই: ফোনে সংরক্ষিত তালিকা।';

  @override
  String get noRosterOffline =>
      'ইন্টারনেট নেই, আর এই শ্রেণির তালিকা এখনো ফোনে সংরক্ষিত হয়নি।';

  @override
  String takenBy(String name, String time) {
    return '$name নিয়েছেন, $time';
  }

  @override
  String get noStudents => 'এই শ্রেণিতে কোনো শিক্ষার্থী নেই।';

  @override
  String get retry => 'আবার চেষ্টা করুন';

  @override
  String get settingsTitle => 'সেটিংস';

  @override
  String get language => 'ভাষা';

  @override
  String get bangla => 'বাংলা';

  @override
  String get english => 'English';

  @override
  String get changePassword => 'পাসওয়ার্ড বদলান';

  @override
  String get currentPassword => 'বর্তমান পাসওয়ার্ড';

  @override
  String get newPassword => 'নতুন পাসওয়ার্ড';

  @override
  String get passwordTooShort => 'অন্তত ৮টি অক্ষর দিন';

  @override
  String get passwordChanged => 'পাসওয়ার্ড বদলানো হয়েছে';

  @override
  String get signOut => 'সাইন আউট';

  @override
  String get signOutConfirm => 'সাইন আউট করবেন?';

  @override
  String signOutPending(String count) {
    return '$countটি দিনের উপস্থিতি এখনো পাঠানো হয়নি। সাইন আউট করলে সেগুলো মুছে যাবে।';
  }

  @override
  String get cancel => 'বাতিল';

  @override
  String signedInAs(String name, String phone) {
    return '$name ($phone)';
  }

  @override
  String get mainNavigation => 'প্রধান মেনু';

  @override
  String get navToday => 'আজকের উপস্থিতি';

  @override
  String get statusOnline => 'অনলাইন';

  @override
  String get statusOffline => 'অফলাইন';

  @override
  String get signInBoxMessage => 'উপস্থিতি নিতে সাইন ইন করুন';

  @override
  String get myClasses => 'আমার শ্রেণি';

  @override
  String get statClasses => 'শ্রেণি';

  @override
  String get statTaken => 'নেওয়া হয়েছে';

  @override
  String get statNotTaken => 'বাকি';

  @override
  String get statWaiting => 'পাঠানো বাকি';

  @override
  String get studentsBox => 'শিক্ষার্থী';

  @override
  String get account => 'অ্যাকাউন্ট';

  @override
  String get security => 'নিরাপত্তা';

  @override
  String get settingsSubtitle => 'ভাষা, পাসওয়ার্ড ও সাইন আউট';

  @override
  String get sending => 'পাঠানো হচ্ছে…';

  @override
  String get signOutHint =>
      'এই ফোন থেকে সাইন আউট হলে ফোনে রাখা সব তথ্য মুছে যাবে।';

  @override
  String roll(String roll) {
    return 'রোল $roll';
  }

  @override
  String get openNavigation => 'মেনু খুলুন';
}
