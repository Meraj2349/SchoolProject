# Cutover runbook: MySQL → PostgreSQL

Phase 6 of [postgres-migration.md](postgres-migration.md). This covers moving
the live school data from MySQL to PostgreSQL on the docker-compose server,
the rollback, and the backups after the switch. Every command runs on the
server, in the project folder (where `docker-compose.yml` and `.env` are).

**Timeline**

| When | What | Section |
|---|---|---|
| Any day before | Read-only MySQL user, `check`, fix data, set up backups | 1–3 |
| A few days before | Rehearsal on a copy of production, timed | 4 |
| Friday evening | Cutover: API offline, final copy, verify, switch, reopen | 5 |
| +48 hours | Go / no-go | 6 |
| After "go" | Retire MySQL | 8 |

## 0. Until the cutover, production stays on MySQL

`docker-compose.yml` now starts the backend on **PostgreSQL** by default.
Until the switch in section 5, the server's `.env` must keep the backend on
MySQL, and the `mysql` profile must be on:

```bash
# .env (until the cutover)
DB_DIALECT=mysql
DB_HOST=db
DB_USER=root
DB_PASSWORD=<the MySQL root password>
MYSQL_ROOT_PASSWORD=<the MySQL root password>
POSTGRES_PASSWORD=<a new long random password>   # openssl rand -hex 32
```

```bash
docker compose --profile mysql up -d
```

This also starts the empty `postgres` service and runs the `migrate`
service, which builds the PostgreSQL schema. The app doesn't use PostgreSQL yet.
The backend doesn't wait for MySQL, so right after `up` its log may show
`Database connection failed` for the first seconds; it reconnects as soon as
MySQL is ready.

## 1. A read-only MySQL user for the copy

The copy only reads MySQL. Give it a user that can't change anything:

```bash
docker compose exec db mysql -uroot -p -e "
  CREATE USER 'copy_reader'@'%' IDENTIFIED BY '<password>';
  GRANT SELECT ON School_Management.* TO 'copy_reader'@'%';"
```

The copy tool (`server/scripts/mysql-to-postgres/`) runs inside the backend
image. The shell function below saves typing the settings for each command;
paste it into the shell you work in:

```bash
# The two passwords from .env (sourcing the whole file breaks on values with spaces)
POSTGRES_PASSWORD="$(grep '^POSTGRES_PASSWORD=' .env | cut -d= -f2-)"
MYSQL_ROOT_PASSWORD="$(grep '^MYSQL_ROOT_PASSWORD=' .env | cut -d= -f2-)"
COPY_READER_PASSWORD='<password>'

pgcopy() {
  docker compose run --rm --no-deps \
    -e MYSQL_HOST=db -e MYSQL_USER=copy_reader -e MYSQL_PASSWORD="$COPY_READER_PASSWORD" \
    -e MYSQL_DATABASE="${MYSQL_DATABASE:-School_Management}" \
    -e DB_HOST=postgres -e DB_PORT=5432 -e DB_USER=school -e DB_PASSWORD="$POSTGRES_PASSWORD" \
    -e DB_NAME="${PG_DATABASE:-School_Management}" \
    backend node scripts/mysql-to-postgres/index.js "$@"
}
```

| Command | What it does | Changes data? |
|---|---|---|
| `pgcopy check` | Lists MySQL data that PostgreSQL would refuse | No |
| `pgcopy copy --replace` | Runs `check`, then deletes all PostgreSQL data and copies every MySQL table in one transaction. Commits only if every table verifies | PostgreSQL only |
| `pgcopy verify` | Compares every table row by row. Prints row counts and a hash per table; exits 1 if anything differs | No |

**Time zone.** MySQL `DATETIME` values have no time zone. The tool reads them
in the MySQL server's own UTC offset, the one the app wrote them in, and
prints it, e.g. `DATETIME values read as UTC+00:00`. The MySQL container has
no `TZ` and runs on UTC, so expect `+00:00`. If the database ever ran
somewhere else (e.g. XAMPP on a PC set to Bangladesh time), set
`-e MYSQL_TIMEZONE=+06:00`. Before trusting the offset, check one known time:
when a recent quiz started, `QuizSessions.StartedAt`, should show the right
hour on the website after the rehearsal. `TIMESTAMP` columns carry their own
time zone and are always copied correctly.

## 2. Check the data and fix it in MySQL

```bash
pgcopy check
```

It names each problem with an example row. Fix each one in MySQL (`docker
compose exec db mysql -uroot -p School_Management`), then run `check` again
until it prints `No problems found`.

| Problem | Why PostgreSQL refuses it | Typical fix |
|---|---|---|
| `zero date(s)` | `0000-00-00` isn't a date | `UPDATE t SET col = NULL WHERE CAST(col AS CHAR) LIKE '0000%';` (or the real date) |
| `empty ENUM value(s)` | MySQL saved `''` for a value not in the list; the `CHECK` refuses it | Set the intended value, e.g. `UPDATE Attendance SET Status = 'Present' WHERE Status = '';` |
| `differ only in upper/lower case` | The PostgreSQL unique key ignores case | Merge or rename one of the rows |
| `NUL character` | PostgreSQL text can't hold `\0` | `UPDATE t SET col = REPLACE(col, CHAR(0), '') WHERE LOCATE(X'00', CAST(col AS BINARY)) > 0;` |
| `column/table missing in MySQL` | A MySQL migration in `server/Sql/` wasn't applied | Apply it |
| `column/table missing in PostgreSQL` | MySQL has data with nowhere to go | Stop and find out where it came from before going on |

## 3. Backups (set up before the cutover)

`scripts/backup-postgres.sh` runs `pg_dump -Fc` (the database) and
`pg_dumpall --globals-only` (roles) inside the postgres container, checks
the dump reads back with `pg_restore --list`, keeps `BACKUP_KEEP_DAYS` (14)
days, and copies the new files off the server with rsync when
`BACKUP_REMOTE` is set.

```bash
sudo mkdir -p /var/backups/school
crontab -e
# every night at 02:30
30 2 * * * BACKUP_REMOTE=backup@files.example:/srv/school /opt/SchoolProject/scripts/backup-postgres.sh >> /var/log/school-backup.log 2>&1
```

Use an SSH key without a passphrase for the cron user, and keep the
destination on another machine. A backup on the same disk is not a backup.

Until the cutover, also keep the existing MySQL backups running.

### Restore

Tested with `pg_restore` reading the dump from stdin; collations, triggers
and identity sequences all come back.

```bash
docker compose stop backend
docker compose exec -T postgres psql -U school -d postgres \
  -c 'DROP DATABASE "School_Management" WITH (FORCE)' \
  -c 'CREATE DATABASE "School_Management"'
docker compose exec -T postgres pg_restore -U school -d School_Management --no-owner --exit-on-error \
  < /var/backups/school/school-YYYYmmdd-HHMMSS.dump
docker compose start backend
```

Only on a new server, where the `school` role doesn't exist yet, load the
roles first:
`docker compose exec -T postgres psql -U school -d postgres < globals-….sql`.
The postgres container already creates `school`, so on the same server skip
this step: it ends in a harmless "role already exists" error.

Once a month, restore the latest dump into a scratch database (`CREATE
DATABASE restore_test`, `-d restore_test`), check a few row counts, and drop
it again. A restore that has never been tried is not a backup.

## 4. Rehearsal (a few days before)

Do the whole copy once on production's real data without touching
production, and time it.

1. Dump production MySQL and load it into a scratch database next to it:
   ```bash
   docker compose exec -T db mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines School_Management > /tmp/prod.sql
   docker compose exec -T db mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE rehearsal; GRANT SELECT ON rehearsal.* TO 'copy_reader'@'%';"
   docker compose exec -T db mysql -uroot -p"$MYSQL_ROOT_PASSWORD" rehearsal < /tmp/prod.sql
   ```
2. A scratch PostgreSQL database with the schema:
   ```bash
   docker compose exec -T postgres psql -U school -d postgres -c 'CREATE DATABASE rehearsal'
   docker compose run --rm -e DB_NAME=rehearsal migrate
   ```
3. Copy and verify, timing it:
   ```bash
   MYSQL_DATABASE=rehearsal PG_DATABASE=rehearsal pgcopy check
   time MYSQL_DATABASE=rehearsal PG_DATABASE=rehearsal pgcopy copy --replace
   MYSQL_DATABASE=rehearsal PG_DATABASE=rehearsal pgcopy verify
   ```
   Note the time. A test with the full seed plus 81 000 attendance rows took
   7 seconds; production should take minutes at most. The downtime in
   section 5 is this plus about 15 minutes.
4. Smoke-test the copy: start a second backend on the rehearsal database
   (a different port, nothing else changes):
   ```bash
   docker compose run --rm --no-deps -p 3001:3000 \
     -e DB_DIALECT=postgres -e DB_HOST=postgres -e DB_USER=school -e DB_PASSWORD="$POSTGRES_PASSWORD" -e DB_NAME=rehearsal \
     -e ATTENDANCE_SMS_ENABLED=false backend
   ```
   Keep SMS off here, or parents get a second message. Point a browser or
   the API at port 3001 and go through the smoke checklist (section 7).
5. Remove both scratch databases (`DROP DATABASE rehearsal` on each side)
   and `/tmp/prod.sql`, which holds every family's data.

## 5. Cutover (Friday evening)

Tell the branch admins beforehand. Teachers can keep taking attendance in
the app: it saves offline and sends it when the API is back. Catch-up works
for up to 48 hours.

1. **Take the API offline.** The website stops working; that's expected.
   ```bash
   docker compose stop backend
   ```
2. **Back up MySQL** as it is now; it's the rollback copy:
   ```bash
   mkdir -p /var/backups/school
   docker compose exec -T db mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines School_Management \
     | gzip > /var/backups/school/mysql-final-$(date +%Y%m%d-%H%M).sql.gz
   ```
3. **Make sure the schema is current, then copy:**
   ```bash
   docker compose run --rm migrate
   pgcopy check
   pgcopy copy --replace
   pgcopy verify | tee /var/backups/school/cutover-verify.txt
   ```
   `copy` ends with `Copied and verified N tables` and `verify` ends with
   `All N tables match`. Anything else: stop and roll back (section 6),
   which at this point only means starting the backend again.
4. **Switch the backend to PostgreSQL.** Keep the old `.env` for the
   rollback, then change these four lines in `.env`:
   ```bash
   cp .env .env.before-cutover
   ```
   ```bash
   DB_DIALECT=postgres
   DB_HOST=postgres
   DB_USER=school
   DB_PASSWORD=
   ```
   Leave `DB_PASSWORD` empty, and don't put a comment on its line: in
   `.env` the comment would become the password. When it's empty, compose
   uses `POSTGRES_PASSWORD`. Check before starting:
   ```bash
   docker compose config | grep -E 'DB_(DIALECT|HOST|USER):'   # postgres, postgres, school
   ```
   Then start the backend, keeping the MySQL service running for the
   rollback, and note the time: from here on, new data goes to PostgreSQL
   only.
   ```bash
   docker compose --profile mysql up -d
   date '+%Y-%m-%d %H:%M:%S%z' | tee /var/backups/school/switch-time.txt
   docker compose logs --tail=50 backend      # "Connected to the database"
   ```
5. **Smoke test** (section 7) against the live site.
6. **Reopen:** tell the branch admins. Watch `docker compose logs -f backend`
   for an hour: a 500 there is almost always SQL that behaves differently on
   PostgreSQL. Note the endpoint and the error.
7. Run the backup script by hand once and check the file:
   `scripts/backup-postgres.sh`.

From now on PostgreSQL is the live database: **never run `pgcopy copy`
again**, because it would replace the new data with MySQL's old data.

## 6. Rollback

Possible until the go/no-go, 48 hours after reopening. MySQL is untouched:
the copy only read it.

The switch back is the same in both cases:

```bash
cp .env.before-cutover .env
docker compose --profile mysql up -d
docker compose exec -T backend sh -c 'echo $DB_DIALECT'   # mysql
```

- **Before reopening (step 3–5 failed):** nothing is lost, apart from what
  the smoke test saved.
- **After reopening:** anything saved since the switch (attendance, fees,
  results) is only in PostgreSQL. List it before switching back and enter it
  again on MySQL. For attendance, using the time in `switch-time.txt`:
  ```bash
  docker compose exec -T postgres psql -U school -d School_Management \
    -c "SELECT \"AttendanceID\", \"StudentID\", \"ClassDate\", \"Status\", \"MarkedByType\", \"UpdatedAt\"
        FROM \"Attendance\" WHERE \"UpdatedAt\" > '$(cat /var/backups/school/switch-time.txt)' ORDER BY \"UpdatedAt\""
  ```
  This also lists the attendance teachers took in the app since then; an
  admin enters it on the website after the switch. Do the same for other
  tables with an `UpdatedAt`/`updated_at` or `created_at` column, and
  compare row counts with `cutover-verify.txt`.

**Go / no-go after 48 hours:** go if there are no unexplained 500s, the
nightly backup ran and was copied off the server, and the branch admins
report nothing missing. Then section 8.

## 7. Smoke checklist

Run it after the rehearsal (port 3001) and after the cutover (the live site).
Each step uses data that existed before the copy:

- [ ] The website's home page shows the branches, news and notices.
- [ ] A super admin and a branch admin sign in (a branch admin sees only their branch).
- [ ] Students: the list, search for a name in Bangla and in English, open one student.
- [ ] Attendance: the overview for today, a class's grid for last month, then
      correct one past day and reload (the change stays).
- [ ] Teacher app: sign in on a phone and take today's attendance for one class.
- [ ] Fees: a student's invoices and the receipt of an existing payment.
- [ ] Results: the public result search finds a known student.
- [ ] A new student, then delete it: the new id continues after the old ones.
- [ ] Images and the routine PDFs open (uploads are in volumes, not the database).

## 8. After "go": retire MySQL

Do this in a PR, once the go/no-go is passed:

- Remove the `db` service, the `mysql_data` volume entry and the MySQL
  settings from `docker-compose.yml`, `.env.example` and `server/.env.example`.
  Keep the last MySQL dump (step 5.2) with the other backups for a year.
- Remove the MySQL driver (`server/src/shared/db/mysqlDriver.js`,
  `server/config/db.config.js`), the `mysql2` and unused `sequelize`
  dependencies, the MySQL CI job and the `*Migration.test.js` tests.
- Remove `server/Sql/` (it stays in git history) and this copy tool
  (`server/scripts/mysql-to-postgres/`, `tests/copy/`, the `server-copy` CI job).
- In CLAUDE.md, schema changes then need only a dbmate migration.
- On the server: `docker compose rm db` and, once the dump is safe
  elsewhere, `docker volume rm <project>_mysql_data`.
