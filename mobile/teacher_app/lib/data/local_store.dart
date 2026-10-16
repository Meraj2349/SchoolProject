import 'dart:convert';

import 'package:sqflite/sqflite.dart';

import '../domain/attendance.dart';

/// What the phone keeps so the app works without a connection: the teacher's
/// profile, the class lists last loaded, and the days still to be sent.
abstract class LocalStore {
  Future<Profile?> profile();
  Future<void> saveProfile(Profile profile);
  Future<Roster?> roster(int classId, String date);

  /// The class's list as last saved, whatever its day.
  Future<Roster?> latestRoster(int classId);
  Future<void> saveRoster(Roster roster);

  /// Oldest first.
  Future<List<PendingDay>> pendingDays();

  /// Adds the day, replacing an earlier unsent save of the same class and day.
  Future<void> putPending(PendingDay day);
  Future<void> removePending(String clientRef);

  /// Everything: on sign-out, or when another teacher signs in.
  Future<void> clear();
}

class SqfliteLocalStore implements LocalStore {
  SqfliteLocalStore._(this._db);

  final Database _db;

  static const _version = 1;

  /// Opens (and creates) the database at [path] with [factory]
  /// (sqflite on the phone, sqflite_common_ffi in tests).
  static Future<SqfliteLocalStore> open(DatabaseFactory factory, String path) async {
    final db = await factory.openDatabase(
      path,
      options: OpenDatabaseOptions(
        version: _version,
        // Each in-memory store (tests) is its own database, never a shared one.
        singleInstance: path != inMemoryDatabasePath,
        onCreate: (db, _) async {
          await db.execute('CREATE TABLE cache (key TEXT PRIMARY KEY, json TEXT NOT NULL)');
          await db.execute('''
            CREATE TABLE pending_days (
              client_ref TEXT PRIMARY KEY,
              class_id INTEGER NOT NULL,
              date TEXT NOT NULL,
              json TEXT NOT NULL,
              created_at INTEGER NOT NULL,
              UNIQUE (class_id, date)
            )''');
        },
      ),
    );
    return SqfliteLocalStore._(db);
  }

  Future<Map<String, dynamic>?> _cached(String key) async {
    final rows = await _db.query('cache', where: 'key = ?', whereArgs: [key]);
    return rows.isEmpty ? null : jsonDecode(rows.first['json'] as String) as Map<String, dynamic>;
  }

  Future<void> _cache(String key, Map<String, dynamic> json) =>
      _db.insert('cache', {'key': key, 'json': jsonEncode(json)}, conflictAlgorithm: ConflictAlgorithm.replace);

  static String _rosterKey(int classId, String date) => 'roster:$classId:$date';

  @override
  Future<Profile?> profile() async {
    final json = await _cached('profile');
    return json == null ? null : Profile.fromJson(json);
  }

  @override
  Future<void> saveProfile(Profile profile) => _cache('profile', profile.toJson());

  @override
  Future<Roster?> roster(int classId, String date) async {
    final json = await _cached(_rosterKey(classId, date));
    return json == null ? null : Roster.fromJson(json);
  }

  @override
  Future<Roster?> latestRoster(int classId) async {
    final json = await _cached('roster-latest:$classId');
    return json == null ? null : Roster.fromJson(json);
  }

  @override
  Future<void> saveRoster(Roster roster) async {
    await _cache(_rosterKey(roster.classId, roster.date), roster.toJson());
    await _cache('roster-latest:${roster.classId}', roster.toJson());
  }

  @override
  Future<List<PendingDay>> pendingDays() async {
    final rows = await _db.query('pending_days', orderBy: 'created_at, client_ref');
    return [for (final row in rows) PendingDay.fromJson(jsonDecode(row['json'] as String) as Map<String, dynamic>)];
  }

  @override
  Future<void> putPending(PendingDay day) => _db.transaction((txn) async {
        await txn.delete('pending_days', where: 'class_id = ? AND date = ?', whereArgs: [day.classId, day.date]);
        await txn.insert('pending_days', {
          'client_ref': day.clientRef,
          'class_id': day.classId,
          'date': day.date,
          'json': jsonEncode(day.toJson()),
          'created_at': day.takenAt.millisecondsSinceEpoch,
        });
      });

  @override
  Future<void> removePending(String clientRef) =>
      _db.delete('pending_days', where: 'client_ref = ?', whereArgs: [clientRef]);

  @override
  Future<void> clear() async {
    await _db.delete('cache');
    await _db.delete('pending_days');
  }
}
