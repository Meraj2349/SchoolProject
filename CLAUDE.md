# SchoolProject

Multi-branch school management system.

- `server/` — Express 4 + PostgreSQL 18 (`pg`), ESM. JWT auth with `super_admin`
  (all branches) and `branch_admin` (one branch, `req.branchId`). Cloudinary for
  images. Bilingual API messages in `server/config/i18n.js` (`en`, `bn`).
- `frontend/` — Next.js (App Router), React 19, React Query, Zustand, Ant Design,
  Tailwind. JSX in `.js` files. **Read `frontend/AGENTS.md` before touching Next APIs.**
- `mobile/teacher_app/` — Flutter (Android) app for class teachers to take
  attendance, offline-first; talks to `/api/teacher-app/v1`. See its README.
- `docker-compose.yml` — backend, frontend, PostgreSQL 18 (+ a one-shot `migrate`).

## How we work: TDD + Clean Architecture

1. **Test first, always.** Red → green → refactor. See `.claude/skills/tdd/SKILL.md`.
2. **Clean Architecture.** New/refactored server code goes in
   `server/src/modules/<feature>/{domain,application,infrastructure,interface}`.
   `server/src/modules/branch/` is the reference. See
   `.claude/skills/clean-architecture/SKILL.md`.
3. Legacy `server/controllers` + `server/models` are migrated one feature at a
   time (strangler pattern). Don't add new logic to them — move the feature first.

Agents in `.claude/agents/`:
- `tdd-developer` — implements a change test-first.
- `clean-code-reviewer` — read-only review for architecture, tests, security.

## Setup

```bash
cp .env.example .env               # secrets for docker compose — fill in real values
cp server/.env.example server/.env # only for running the server without Docker
docker compose up
```

## Commands

```bash
# server
cd server && npm test                  # unit tests: Jest + Supertest (ESM), no DB
cd server && npm run test:watch
cd server && npm run test:integration  # real PostgreSQL, see below
cd server && npm run db:migrate        # apply server/db/migrations (DB_* settings)
cd server && npm run dev               # needs PostgreSQL + server/.env

# frontend
cd frontend && npm test          # Vitest + Testing Library
cd frontend && npm run lint
cd frontend && npm run dev       # http://localhost:5173

# website + admin panel in a real browser (Playwright, PostgreSQL)
cd e2e && npm ci && npm test     # seeds school_e2e (E2E_DB_*), starts API + frontend build

# mobile app (Flutter 3.47)
cd mobile/teacher_app && flutter analyze && flutter test
cd mobile/teacher_app && tool/live_api_test.sh   # against the real API + PostgreSQL
```

Integration tests (`server/tests/integration`) build a fresh database with the
migrations in `server/db/migrations` and call the real app over HTTP. They need
a PostgreSQL 18 server (`LIKE` on the case-insensitive collations needs 18);
configure it with `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_USER`,
`TEST_DB_PASSWORD` (defaults: `127.0.0.1:5432`, user/password `school_test`).
The database named by `TEST_DB_NAME` (default `school_test`) is dropped and
recreated on every run — never point it at real data.

CI (`.github/workflows/test.yml`) runs the unit tests, the integration tests
against a PostgreSQL 18 service, the browser tests (`e2e/`), and the frontend
tests and lint on every push and PR. A new public page or form gets an `e2e/tests`
case too; a new admin page or workflow gets one in `e2e/tests/admin` (the menu
in `frontend/src/components/admin/navigation.js` drives the page checks).
`.github/workflows/mobile.yml` analyzes and tests the app, runs it against the
real API, and builds the APK (artifact `teacher-app-apk`).

## Attendance

- One row per student per day (`UNIQUE (StudentID, ClassDate)`); statuses
  Present, Absent, Late, Leave. `server/src/modules/attendance`.
- A save never overwrites a day taken later (`MarkedAt`): an admin's correction
  survives an older offline save from a phone.
- Teachers (app) mark their own class, today only (offline catch-up ≤ 48 h);
  admins correct any past day on the website.
- The school is one family (স্টার শিক্ষা পরিবার) of branches (শাখা): a super
  admin sees every branch, a branch (sub) admin only theirs and turns on app
  access for their own teachers. Rosters carry `branch` and `classTeacher`;
  `GET /api/attendance/overview?date=` lists each branch's classes, class
  teacher and whether the day is taken (counts follow each student's current
  class, like the roster). The app shows the teacher's branch
  (`teacher.branch` from `/login` and `/me`). The family's branches are seeded
  by the first migration (`server/db/migrations/20261024000000_initial_schema.sql`).
- Absence SMS: `server/src/modules/notifications`, one per child per day, after
  `ATTENDANCE_SMS_DELAY_MINUTES`; provider switch `SMS_PROVIDER=log|bulksmsbd`.

## Schema changes

Every schema change is a new dbmate migration in `server/db/migrations/`
(`npm run db:new -- <name>`, applied by `npm run db:migrate` and by the
docker-compose `migrate` service before the backend starts). Never edit an
applied migration; add a new one. DDL is transactional and `IF NOT EXISTS`
works natively.

- Table and column names keep their original (MySQL-era) spelling and are
  quoted: `"Students"."StudentID"`. API responses use the same keys.
- A new text column gets a collation: `"C"` for statuses, codes, ids, phone
  numbers and links; `ci2` for names, titles, emails and free text
  (`tests/integration/collations.test.js` checks).
- A new foreign key gets an index starting with its columns
  (`tests/integration/pgSchema.test.js` checks).

The app moved from MySQL to PostgreSQL in 2026 (`docs/postgres-migration.md`,
`docs/postgres-cutover.md`); MySQL support was removed afterwards.

## Conventions

- API responses: `{ success, message?, data? }`; never return `error.message`.
- Errors in domain/use cases: `ValidationError` / `NotFoundError` from
  `server/src/shared/errors` with an i18n key as the code.
- SQL: `?` placeholders only; scope branch-owned tables with `branchFilter()`.
- Secrets live in `.env` files, never in code or `docker-compose.yml`.
