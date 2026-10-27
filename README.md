# SchoolProject

School management system for the branches of স্টার শিক্ষা পরিবার (Star
Shiksha Paribar): the public website, the admin panel and a teachers'
attendance app.

| Part | What | Stack |
|---|---|---|
| `server/` | REST API | Node.js 22, Express 4, PostgreSQL 18 (`pg`), JWT, Cloudinary |
| `frontend/` | Website + admin panel | Next.js (App Router), React 19, Ant Design, Tailwind |
| `mobile/teacher_app/` | Attendance app for class teachers (offline-first) | Flutter (Android) |
| `e2e/` | Browser tests of the website and admin panel | Playwright |

Admins are either a super admin (every branch) or a branch admin (one branch).
Students, teachers, classes, attendance, exams and results, fees, notices,
news, the gallery, job circulars and the quiz are kept per branch.

## Run it with Docker

```bash
cp .env.example .env     # fill in real values: passwords, JWT secret, Cloudinary keys
docker compose up -d
```

- API: http://localhost:3000
- Website and admin panel: http://localhost:5174
- PostgreSQL: `localhost:5433`, user `school`, database `School_Management`

The one-shot `migrate` service applies `server/db/migrations` before the
backend starts, so an empty database gets the whole schema and the branches.

## Run it for development

You need Node.js 22 and a PostgreSQL 18 server.

```bash
cd server && cp .env.example .env    # DB_* settings for your PostgreSQL
npm ci && npm run db:migrate && npm run dev     # http://localhost:3000

cd frontend && npm ci && npm run dev            # http://localhost:5173
```

## Tests

```bash
cd server && npm test                  # unit tests, no database
cd server && npm run test:integration  # real PostgreSQL (TEST_DB_*), drops and rebuilds school_test
cd frontend && npm test && npm run lint
cd e2e && npm ci && npm test           # website + admin panel in a real browser
cd mobile/teacher_app && flutter analyze && flutter test
```

CI runs all of them on every push and pull request (`.github/workflows/`).
How the project is built (test-first, clean architecture, conventions) is in
[`CLAUDE.md`](CLAUDE.md).

## Operations

- Nightly backups: `scripts/backup-postgres.sh` (cron), restore steps in
  [`docs/postgres-cutover.md`](docs/postgres-cutover.md#3-backups-set-up-before-the-cutover).
- Schema changes: a new migration in `server/db/migrations` (`npm run db:new -- <name>`).
- History: the app moved from MySQL to PostgreSQL in 2026
  ([`docs/postgres-migration.md`](docs/postgres-migration.md)).
