#!/usr/bin/env bash
# Nightly PostgreSQL backup for the docker-compose install. Run it on the
# server from cron, e.g. at 02:30 every night:
#
#   30 2 * * * /opt/SchoolProject/scripts/backup-postgres.sh >> /var/log/school-backup.log 2>&1
#
# Writes, in BACKUP_DIR:
#   school-YYYYmmdd-HHMMSS.dump   the database (pg_dump custom format, for pg_restore)
#   globals-YYYYmmdd-HHMMSS.sql   roles and their passwords (pg_dumpall --globals-only)
# then deletes backups older than BACKUP_KEEP_DAYS and, if BACKUP_REMOTE is
# set, copies the new files off the server with rsync. Restoring: see
# docs/postgres-cutover.md ("Backups and restore").
#
#   BACKUP_DIR        default /var/backups/school
#   BACKUP_KEEP_DAYS  default 14
#   BACKUP_REMOTE     optional rsync destination, e.g. backup@files.example:/srv/school
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/school}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
BACKUP_REMOTE="${BACKUP_REMOTE:-}"

# docker compose finds docker-compose.yml (and .env) in the project folder.
cd "$(dirname "$0")/.."

fail() {
  echo "backup-postgres: $*" >&2
  exit 1
}

stamp="$(date +%Y%m%d-%H%M%S)"
dump="$BACKUP_DIR/school-$stamp.dump"
globals="$BACKUP_DIR/globals-$stamp.sql"
mkdir -p "$BACKUP_DIR"
trap 'rm -f "$dump.partial" "$globals.partial"' EXIT

# The container's own POSTGRES_USER and POSTGRES_DB, so no password is needed here.
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$dump.partial" \
  || fail "pg_dump failed; no backup written"
docker compose exec -T postgres pg_restore --list < "$dump.partial" > /dev/null \
  || fail "the new dump cannot be read back by pg_restore; no backup written"
docker compose exec -T postgres sh -c 'pg_dumpall -U "$POSTGRES_USER" --globals-only' > "$globals.partial" \
  || fail "pg_dumpall failed; no backup written"

mv "$dump.partial" "$dump"
mv "$globals.partial" "$globals"
echo "backup-postgres: wrote $dump ($(wc -c < "$dump") bytes)"

find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'school-*.dump' -o -name 'globals-*.sql' \) \
  -mtime +"$BACKUP_KEEP_DAYS" -print -delete

if [ -n "$BACKUP_REMOTE" ]; then
  rsync -a "$dump" "$globals" "$BACKUP_REMOTE" || fail "copying to $BACKUP_REMOTE failed (the local backup is kept)"
fi
