# শিক্ষক উপস্থিতি — teacher attendance app

An Android app for class teachers of Star Shiksha Paribar. A teacher signs in
with their mobile number and password and takes **today's attendance of their
own class**: Present, Absent, Late or Leave (ছুটি). It works without a
connection: a saved day waits on the phone and is sent when the phone is online
again (automatically, or with "Send now").

Bangla is the default language; English is in Settings.

## How it fits with the school server

- An admin turns a teacher's access on in the website: **Teachers → App
  access** (mobile number, password, on/off). The teacher must be the class
  teacher (`Classes.TeacherID`) of a class to see it in the app.
- The app talks to `/api/teacher-app/v1` on the school server
  (`server/src/modules/teacher-app`). Five wrong passwords in a row lock the
  number for 15 minutes.
- Teachers can change today only. A day taken offline can still be sent within
  48 hours. Earlier days are corrected by an admin on the website, and a later
  change on the website is never overwritten by an older save from a phone.
- Parents of absent children get one SMS a day, sent by the server
  (`ATTENDANCE_SMS_*` and `SMS_*` in `server/.env.example`).
- Turning access off or setting a new password signs the teacher out on every
  phone.

## Code: Clean Architecture + MVVM

Dependencies point inwards only: `presentation → domain ← data`, and
`app/di.dart` is the only place that wires them together.

```
lib/domain         no Flutter, no HTTP, no database
  entities/        Teacher, Branch, SchoolClass, Profile, Roster, PendingDay, AttendanceStatus,
                   TodayOverview, ClassDay, schoolToday, parseServerUrl
  repositories/    SessionRepository, AttendanceRepository (contracts)
  usecases/        SignIn, RestoreSession, ChangePassword, SignOut, ChangeLanguage,
                   LoadToday, OpenClassDay, SaveClassDay, SyncPendingDays, DiscardPendingDay
  errors.dart      ApiException, OfflineException, SignedOutException
lib/data
  datasources/     TeacherApi (HTTP), LocalStore (sqflite), SessionStore (secure storage)
  models/          JSON ⇄ entities
  repositories/    TeacherAppRepository: implements both contracts, the offline queue
lib/presentation
  viewmodels/      one ChangeNotifier per screen (App, SignIn, Today, TakeAttendance, Settings);
                   they call use cases and expose state and outcomes, never widgets
  views/           the screens: they only read view-model state and call its methods
  widgets/         the website admin's classic kit: AdminBox, InfoBox, CountTile, AdminBadge,
                   Callout, ContentHeader, StatusButtonGroup, AdminSidebar
  theme/           the admin palette (AdminLTE: #3c8dbc header, #ecf0f5 page, #222d32 sidebar)
lib/app/di.dart    composition root
lib/l10n           app_bn.arb (default) and app_en.arb → generated AppLocalizations
```

Tests follow the layers: `test/domain` (entities, use cases with in-memory
repositories), `test/data` (the repository against a fake server, JSON),
`test/presentation` (view models; widget tests of the screens at phone size),
`test/integration` (the real server, see below).

## Develop

Flutter 3.47 (stable).

```bash
flutter pub get
flutter analyze
flutter test                  # unit and widget tests, no network
tool/live_api_test.sh         # against the real server and a throw-away PostgreSQL database
```

`tool/live_api_test.sh` builds a database with the server's migrations
(`server/db/migrations`), starts the API on port 3100 and runs
`test/integration/live_api_test.dart`: sign in, save offline, sync once, the
server's records and the two SMS (log-only mode). Set `LIVE_DB_HOST`,
`LIVE_DB_PORT`, `LIVE_DB_USER` and `LIVE_DB_PASSWORD` for a PostgreSQL server. It
drops the database `LIVE_DB_NAME` (default `teacher_app_live`) first.

Run on a phone or emulator against a server on your computer (debug builds
accept plain `http://`, release builds need `https://`):

```bash
flutter run --dart-define=API_URL=http://192.168.0.10:3000
```

## Build the APK

The school's server address is built in, so teachers only type their number and
password (they can still change it on the sign-in screen):

```bash
flutter build apk --release --dart-define=API_URL=https://api.your-school.example
# → build/app/outputs/flutter-apk/app-release.apk
```

GitHub Actions (`.github/workflows/mobile.yml`) does the same on every push to
`main`: open the run and download **teacher-app-apk**. Set the repository
variable `TEACHER_APP_API_URL` to the server address.

### Signing key

Keep one release key for the life of the app: Android only installs an update
signed with the same key. The key never goes into git (`*.jks` and
`key.properties` are ignored).

1. Create it once:
   `keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload`
2. Keep the file and its passwords somewhere safe (not only on one laptop).
3. To build locally, put the file in `android/app/` and create `android/key.properties`:
   ```
   storeFile=upload-keystore.jks
   storePassword=...
   keyAlias=upload
   keyPassword=...
   ```
4. For GitHub Actions, add repository secrets: `ANDROID_KEYSTORE_BASE64`
   (`base64 -w0 upload-keystore.jks`), `ANDROID_KEYSTORE_PASSWORD`,
   `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

Without a key, release builds are signed with the debug key. That is fine for
trying the app out, but phones cannot update from it to a properly signed build
(uninstall first).

## Install on a teacher's phone

Send the APK (e.g. by WhatsApp or a link), open it on the phone and allow
"Install unknown apps" for that app when Android asks. Android 7 or newer.

## Fonts

Hind Siliguri, SIL Open Font License 1.1 (`assets/fonts/OFL.txt`).
