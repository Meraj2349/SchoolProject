---
name: run-project
description: How to start this school project locally and check it works, either the whole stack with docker compose (PostgreSQL 18, migrate, API, website + admin panel) or the server and frontend with npm for development. Use when asked to run, start, restart or smoke-test the app, or when it won't start (port clash, missing .env, old MySQL containers).
---

# Run the project

## With Docker (the whole stack)

```bash
cp .env.example .env        # once; then fill in the values below
docker compose up -d --build
docker compose ps           # postgres healthy, migrate "Exited (0)", backend + frontend Up
```

`.env` must have real values for `POSTGRES_PASSWORD`, `JWT_SECRET_KEY`
(`openssl rand -hex 32`) and the three `CLOUDINARY_*` keys. Compose refuses
to start without them. Image uploads need working Cloudinary keys; the rest
of the app works with placeholder values. Never commit `.env`.

| Service | URL / port |
|---|---|
| API (`backend`) | http://localhost:3000 |
| Website + admin panel (`frontend`) | http://localhost:5174 (admin: `/admin/login`) |
| PostgreSQL (`postgres`) | `localhost:${POSTGRES_PORT:-5433}`, user `school`, db `School_Management` |

Order: `postgres` → `migrate` (applies `server/db/migrations`, then exits) →
`backend` → `frontend`. If `migrate` fails, the backend never starts. Read
`docker compose logs migrate`.

Stop with `docker compose down`. **Don't add `-v`**: that deletes the
database and uploads volumes.

## For development (npm)

Needs Node.js 22 (20 works for the tests) and a PostgreSQL 18 server. The
compose `postgres` service is fine: `docker compose up -d postgres`.

```bash
cd server && cp .env.example .env   # DB_* → your PostgreSQL (port 5433 for compose's)
npm ci && npm run db:migrate && npm run dev     # http://localhost:3000

cd frontend && npm ci && npm run dev            # http://localhost:5173
```

The frontend proxies `/api/*` to `http://localhost:3000`.

## First login on a fresh database

The migrations seed the branches (শাখা), class names and a few demo rows, but
**no admin**. While the `Admin` table is empty, `POST /api/admin/createAdmin`
is open. Use the register page (`/admin/register`) to create the first super
admin, then log in at `/admin/login`. After that only a super admin can
create admins.

## Smoke check

```bash
curl -s localhost:3000/                    # "Welcome to the School Project API"
curl -s localhost:3000/api/branches | head -c 300   # the seeded branches
curl -s -o /dev/null -w '%{http_code}\n' localhost:5174/   # 200
```

For a visual check, open the site with the `claude-in-chrome` skill and take
a screenshot of `/` and `/admin/login`.

## When it won't start

- **Port already in use** (`bind: address already in use`): see who holds it
  with `docker ps --format '{{.Names}}\t{{.Ports}}'` or `ss -ltnp`. For
  PostgreSQL, set `POSTGRES_PORT=5434` (any free port) in `.env`.
- **Old MySQL-era containers** (`schoolproject-db-1`, image `mysql:8.0`) are
  still running: `docker compose down --remove-orphans` removes them. The
  `schoolproject_mysql_data` volume stays; delete it only on purpose.
- **Backend exits with `DB_DIALECT=mysql is no longer supported`**: an old
  `.env` still has MySQL settings. Remove `DB_DIALECT`, `DB_HOST=db`,
  `DB_USER=root` and `MYSQL_ROOT_PASSWORD` (there is no `db` service any more).
- **`Set POSTGRES_PASSWORD in .env`** (or another `Set … in .env`): a required
  value is missing from `.env`.
- **Frontend changes don't show** in Docker: rebuild with
  `docker compose up -d --build frontend`.
