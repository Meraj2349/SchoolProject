#!/usr/bin/env bash
# Runs test/integration/live_api_test.dart against the real school server:
# builds a throw-away MySQL database, starts the API on port 3100 with absence
# SMS in log-only mode and no delay, gives the class teacher app access through
# the admin API, runs the test, and stops the server.
#
#   MYSQL_HOST=127.0.0.1 MYSQL_USER=school_test MYSQL_PASSWORD=school_test tool/live_api_test.sh
#
# The database named by LIVE_DB_NAME (default teacher_app_live) is dropped first.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_DIR="$APP_DIR/../../server"
HOST="${MYSQL_HOST:-127.0.0.1}"
PORT_DB="${MYSQL_PORT:-3306}"
USER="${MYSQL_USER:-school_test}"
PASSWORD="${MYSQL_PASSWORD:-school_test}"
DB="${LIVE_DB_NAME:-teacher_app_live}"
API_PORT="${LIVE_API_PORT:-3100}"
SECRET="live-api-test-secret"
mysql_cli() { mysql -h"$HOST" -P"$PORT_DB" -u"$USER" -p"$PASSWORD" "$@"; }

mysql_cli -e "DROP DATABASE IF EXISTS \`$DB\`; CREATE DATABASE \`$DB\` CHARACTER SET utf8mb4;" 2>/dev/null
mysql_cli "$DB" < "$SERVER_DIR/Sql/database.sql" 2>/dev/null
mysql_cli "$DB" < "$APP_DIR/tool/live_api_seed.sql" 2>/dev/null
mysql_cli "$DB" < "$SERVER_DIR/Sql/star_family_branches_migration.sql" 2>/dev/null

LOG="$(mktemp)"
(cd "$SERVER_DIR" && DB_HOST="$HOST" DB_PORT="$PORT_DB" DB_USER="$USER" DB_PASSWORD="$PASSWORD" DB_NAME="$DB" \
  PORT="$API_PORT" JWT_SECRET_KEY="$SECRET" JWT_EXPIRES_IN=1h \
  ATTENDANCE_SMS_ENABLED=true ATTENDANCE_SMS_DELAY_MINUTES=0 SMS_PROVIDER=log \
  exec node app.js > "$LOG" 2>&1) &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true; echo "server log: $LOG"' EXIT
for _ in $(seq 1 30); do curl -sf "http://127.0.0.1:$API_PORT/" >/dev/null && break; sleep 1; done

ADMIN_TOKEN="$(cd "$SERVER_DIR" && node -e "console.log(require('jsonwebtoken').sign({ adminID: 1, role: 'branch_admin', branch_id: 1 }, '$SECRET', { expiresIn: '1h' }))")"
curl -sf -X PUT "http://127.0.0.1:$API_PORT/api/teachers/7/app-access" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"phone":"01711000007","password":"class5-secret","enabled":true}' >/dev/null

cd "$APP_DIR"
LIVE_API_URL="http://127.0.0.1:$API_PORT" LIVE_ADMIN_TOKEN="$ADMIN_TOKEN" \
  flutter test test/integration/live_api_test.dart "$@"
echo "--- SMS the server would have sent (log-only mode) ---"
grep "SMS log only" "$LOG" || true
