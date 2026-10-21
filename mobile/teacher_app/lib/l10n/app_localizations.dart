import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_bn.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('bn'),
    Locale('en'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In bn, this message translates to:
  /// **'শিক্ষক উপস্থিতি'**
  String get appTitle;

  /// No description provided for @schoolName.
  ///
  /// In bn, this message translates to:
  /// **'স্টার শিক্ষা পরিবার'**
  String get schoolName;

  /// No description provided for @signInTitle.
  ///
  /// In bn, this message translates to:
  /// **'সাইন ইন'**
  String get signInTitle;

  /// No description provided for @signInHint.
  ///
  /// In bn, this message translates to:
  /// **'বিদ্যালয় থেকে পাওয়া মোবাইল নম্বর ও পাসওয়ার্ড দিন।'**
  String get signInHint;

  /// No description provided for @serverLabel.
  ///
  /// In bn, this message translates to:
  /// **'বিদ্যালয়ের সার্ভারের ঠিকানা'**
  String get serverLabel;

  /// No description provided for @serverHint.
  ///
  /// In bn, this message translates to:
  /// **'যেমন school.example.com'**
  String get serverHint;

  /// No description provided for @changeServer.
  ///
  /// In bn, this message translates to:
  /// **'সার্ভারের ঠিকানা বদলান'**
  String get changeServer;

  /// No description provided for @phoneLabel.
  ///
  /// In bn, this message translates to:
  /// **'মোবাইল নম্বর'**
  String get phoneLabel;

  /// No description provided for @passwordLabel.
  ///
  /// In bn, this message translates to:
  /// **'পাসওয়ার্ড'**
  String get passwordLabel;

  /// No description provided for @signInButton.
  ///
  /// In bn, this message translates to:
  /// **'সাইন ইন'**
  String get signInButton;

  /// No description provided for @fieldRequired.
  ///
  /// In bn, this message translates to:
  /// **'এটি দিতে হবে'**
  String get fieldRequired;

  /// No description provided for @serverInvalid.
  ///
  /// In bn, this message translates to:
  /// **'সঠিক ঠিকানা দিন (https://...)'**
  String get serverInvalid;

  /// No description provided for @offlineSignIn.
  ///
  /// In bn, this message translates to:
  /// **'ইন্টারনেট সংযোগ নেই। সাইন ইন করতে ইন্টারনেট চালু করুন।'**
  String get offlineSignIn;

  /// No description provided for @errorGeneric.
  ///
  /// In bn, this message translates to:
  /// **'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।'**
  String get errorGeneric;

  /// No description provided for @signedOutNotice.
  ///
  /// In bn, this message translates to:
  /// **'আপনাকে সাইন আউট করা হয়েছে। আবার সাইন ইন করুন।'**
  String get signedOutNotice;

  /// No description provided for @greeting.
  ///
  /// In bn, this message translates to:
  /// **'আসসালামু আলাইকুম, {name}'**
  String greeting(String name);

  /// No description provided for @todayIs.
  ///
  /// In bn, this message translates to:
  /// **'আজ {date}'**
  String todayIs(String date);

  /// No description provided for @noClasses.
  ///
  /// In bn, this message translates to:
  /// **'আপনি এখনো কোনো শ্রেণির শ্রেণিশিক্ষক নন। বিদ্যালয়ের অ্যাডমিনকে বলুন।'**
  String get noClasses;

  /// No description provided for @classStudents.
  ///
  /// In bn, this message translates to:
  /// **'{n, plural, other{{count} জন শিক্ষার্থী}}'**
  String classStudents(int n, String count);

  /// No description provided for @notTaken.
  ///
  /// In bn, this message translates to:
  /// **'নেওয়া হয়নি'**
  String get notTaken;

  /// No description provided for @takenAt.
  ///
  /// In bn, this message translates to:
  /// **'নেওয়া হয়েছে {time}'**
  String takenAt(String time);

  /// No description provided for @waitingToSync.
  ///
  /// In bn, this message translates to:
  /// **'পাঠানোর অপেক্ষায়'**
  String get waitingToSync;

  /// No description provided for @offlineBanner.
  ///
  /// In bn, this message translates to:
  /// **'ইন্টারনেট সংযোগ নেই। ফোনে সংরক্ষিত তালিকা দেখানো হচ্ছে।'**
  String get offlineBanner;

  /// No description provided for @pendingBanner.
  ///
  /// In bn, this message translates to:
  /// **'{count}টি দিনের উপস্থিতি পাঠানোর অপেক্ষায়'**
  String pendingBanner(String count);

  /// No description provided for @syncNow.
  ///
  /// In bn, this message translates to:
  /// **'এখন পাঠান'**
  String get syncNow;

  /// No description provided for @synced.
  ///
  /// In bn, this message translates to:
  /// **'{count}টি দিনের উপস্থিতি পাঠানো হয়েছে'**
  String synced(String count);

  /// No description provided for @refusedTitle.
  ///
  /// In bn, this message translates to:
  /// **'পাঠানো যায়নি: {className}, {date}'**
  String refusedTitle(String className, String date);

  /// No description provided for @discard.
  ///
  /// In bn, this message translates to:
  /// **'বাদ দিন'**
  String get discard;

  /// No description provided for @takeTitle.
  ///
  /// In bn, this message translates to:
  /// **'{className} — {section}'**
  String takeTitle(String className, String section);

  /// No description provided for @present.
  ///
  /// In bn, this message translates to:
  /// **'উপস্থিত'**
  String get present;

  /// No description provided for @absent.
  ///
  /// In bn, this message translates to:
  /// **'অনুপস্থিত'**
  String get absent;

  /// No description provided for @late.
  ///
  /// In bn, this message translates to:
  /// **'দেরিতে'**
  String get late;

  /// No description provided for @leave.
  ///
  /// In bn, this message translates to:
  /// **'ছুটি'**
  String get leave;

  /// No description provided for @counts.
  ///
  /// In bn, this message translates to:
  /// **'উপস্থিত {present} · অনুপস্থিত {absent} · দেরিতে {late} · ছুটি {leave}'**
  String counts(String present, String absent, String late, String leave);

  /// No description provided for @allPresent.
  ///
  /// In bn, this message translates to:
  /// **'সবাই উপস্থিত'**
  String get allPresent;

  /// No description provided for @save.
  ///
  /// In bn, this message translates to:
  /// **'সংরক্ষণ'**
  String get save;

  /// No description provided for @savedOnline.
  ///
  /// In bn, this message translates to:
  /// **'উপস্থিতি সংরক্ষণ হয়েছে'**
  String get savedOnline;

  /// No description provided for @savedOffline.
  ///
  /// In bn, this message translates to:
  /// **'ফোনে সংরক্ষণ হয়েছে। ইন্টারনেট পেলেই পাঠানো হবে।'**
  String get savedOffline;

  /// No description provided for @keptNewer.
  ///
  /// In bn, this message translates to:
  /// **'{count} জনের অবস্থা পরে অফিস থেকে বদলানো হয়েছে, সেটিই রাখা হয়েছে।'**
  String keptNewer(String count);

  /// No description provided for @lockedDay.
  ///
  /// In bn, this message translates to:
  /// **'অ্যাপে শুধু আজকের উপস্থিতি নেওয়া যায়। অন্য দিনের জন্য অফিসকে বলুন।'**
  String get lockedDay;

  /// No description provided for @rosterOffline.
  ///
  /// In bn, this message translates to:
  /// **'ইন্টারনেট নেই: ফোনে সংরক্ষিত তালিকা।'**
  String get rosterOffline;

  /// No description provided for @noRosterOffline.
  ///
  /// In bn, this message translates to:
  /// **'ইন্টারনেট নেই, আর এই শ্রেণির তালিকা এখনো ফোনে সংরক্ষিত হয়নি।'**
  String get noRosterOffline;

  /// No description provided for @takenBy.
  ///
  /// In bn, this message translates to:
  /// **'{name} নিয়েছেন, {time}'**
  String takenBy(String name, String time);

  /// No description provided for @noStudents.
  ///
  /// In bn, this message translates to:
  /// **'এই শ্রেণিতে কোনো শিক্ষার্থী নেই।'**
  String get noStudents;

  /// No description provided for @retry.
  ///
  /// In bn, this message translates to:
  /// **'আবার চেষ্টা করুন'**
  String get retry;

  /// No description provided for @settingsTitle.
  ///
  /// In bn, this message translates to:
  /// **'সেটিংস'**
  String get settingsTitle;

  /// No description provided for @language.
  ///
  /// In bn, this message translates to:
  /// **'ভাষা'**
  String get language;

  /// No description provided for @bangla.
  ///
  /// In bn, this message translates to:
  /// **'বাংলা'**
  String get bangla;

  /// No description provided for @english.
  ///
  /// In bn, this message translates to:
  /// **'English'**
  String get english;

  /// No description provided for @changePassword.
  ///
  /// In bn, this message translates to:
  /// **'পাসওয়ার্ড বদলান'**
  String get changePassword;

  /// No description provided for @currentPassword.
  ///
  /// In bn, this message translates to:
  /// **'বর্তমান পাসওয়ার্ড'**
  String get currentPassword;

  /// No description provided for @newPassword.
  ///
  /// In bn, this message translates to:
  /// **'নতুন পাসওয়ার্ড'**
  String get newPassword;

  /// No description provided for @passwordTooShort.
  ///
  /// In bn, this message translates to:
  /// **'অন্তত ৮টি অক্ষর দিন'**
  String get passwordTooShort;

  /// No description provided for @passwordChanged.
  ///
  /// In bn, this message translates to:
  /// **'পাসওয়ার্ড বদলানো হয়েছে'**
  String get passwordChanged;

  /// No description provided for @signOut.
  ///
  /// In bn, this message translates to:
  /// **'সাইন আউট'**
  String get signOut;

  /// No description provided for @signOutConfirm.
  ///
  /// In bn, this message translates to:
  /// **'সাইন আউট করবেন?'**
  String get signOutConfirm;

  /// No description provided for @signOutPending.
  ///
  /// In bn, this message translates to:
  /// **'{count}টি দিনের উপস্থিতি এখনো পাঠানো হয়নি। সাইন আউট করলে সেগুলো মুছে যাবে।'**
  String signOutPending(String count);

  /// No description provided for @cancel.
  ///
  /// In bn, this message translates to:
  /// **'বাতিল'**
  String get cancel;

  /// No description provided for @signedInAs.
  ///
  /// In bn, this message translates to:
  /// **'{name} ({phone})'**
  String signedInAs(String name, String phone);

  /// No description provided for @mainNavigation.
  ///
  /// In bn, this message translates to:
  /// **'প্রধান মেনু'**
  String get mainNavigation;

  /// No description provided for @navToday.
  ///
  /// In bn, this message translates to:
  /// **'আজকের উপস্থিতি'**
  String get navToday;

  /// No description provided for @statusOnline.
  ///
  /// In bn, this message translates to:
  /// **'অনলাইন'**
  String get statusOnline;

  /// No description provided for @statusOffline.
  ///
  /// In bn, this message translates to:
  /// **'অফলাইন'**
  String get statusOffline;

  /// No description provided for @signInBoxMessage.
  ///
  /// In bn, this message translates to:
  /// **'উপস্থিতি নিতে সাইন ইন করুন'**
  String get signInBoxMessage;

  /// No description provided for @myClasses.
  ///
  /// In bn, this message translates to:
  /// **'আমার শ্রেণি'**
  String get myClasses;

  /// No description provided for @statClasses.
  ///
  /// In bn, this message translates to:
  /// **'শ্রেণি'**
  String get statClasses;

  /// No description provided for @statTaken.
  ///
  /// In bn, this message translates to:
  /// **'নেওয়া হয়েছে'**
  String get statTaken;

  /// No description provided for @statNotTaken.
  ///
  /// In bn, this message translates to:
  /// **'বাকি'**
  String get statNotTaken;

  /// No description provided for @statWaiting.
  ///
  /// In bn, this message translates to:
  /// **'পাঠানো বাকি'**
  String get statWaiting;

  /// No description provided for @studentsBox.
  ///
  /// In bn, this message translates to:
  /// **'শিক্ষার্থী'**
  String get studentsBox;

  /// No description provided for @account.
  ///
  /// In bn, this message translates to:
  /// **'অ্যাকাউন্ট'**
  String get account;

  /// A branch of the school family; the teacher's branch is shown on Today, in the menu and in the settings.
  ///
  /// In bn, this message translates to:
  /// **'শাখা'**
  String get branch;

  /// No description provided for @security.
  ///
  /// In bn, this message translates to:
  /// **'নিরাপত্তা'**
  String get security;

  /// No description provided for @settingsSubtitle.
  ///
  /// In bn, this message translates to:
  /// **'ভাষা, পাসওয়ার্ড ও সাইন আউট'**
  String get settingsSubtitle;

  /// No description provided for @sending.
  ///
  /// In bn, this message translates to:
  /// **'পাঠানো হচ্ছে…'**
  String get sending;

  /// No description provided for @signOutHint.
  ///
  /// In bn, this message translates to:
  /// **'এই ফোন থেকে সাইন আউট হলে ফোনে রাখা সব তথ্য মুছে যাবে।'**
  String get signOutHint;

  /// No description provided for @roll.
  ///
  /// In bn, this message translates to:
  /// **'রোল {roll}'**
  String roll(String roll);

  /// No description provided for @openNavigation.
  ///
  /// In bn, this message translates to:
  /// **'মেনু খুলুন'**
  String get openNavigation;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['bn', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'bn':
      return AppLocalizationsBn();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
