# SchoolProject

Multi-branch school management system.

- `server/` — Express 4 + MySQL (`mysql2`), ESM. JWT auth with `super_admin`
  (all branches) and `branch_admin` (one branch, `req.branchId`). Cloudinary for
  images. Bilingual API messages in `server/config/i18n.js` (`en`, `bn`).
- `frontend/` — Next.js (App Router), React 19, React Query, Zustand, Ant Design,
  Tailwind. JSX in `.js` files. **Read `frontend/AGENTS.md` before touching Next APIs.**
- `docker-compose.yml` — backend, frontend, MySQL 8.

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
cd server && npm run test:integration  # real MySQL, see below
cd server && npm run dev               # needs MySQL + server/.env

# frontend
cd frontend && npm test          # Vitest + Testing Library
cd frontend && npm run lint
cd frontend && npm run dev       # http://localhost:5173
```

Integration tests (`server/tests/integration`) build a fresh database from
`server/Sql/database.sql` and call the real app over HTTP. They need a MySQL 8
server; configure it with `TEST_DB_HOST`, `TEST_DB_PORT`, `TEST_DB_USER`,
`TEST_DB_PASSWORD` (defaults: `127.0.0.1:3306`, user/password `school_test`).
The database named by `TEST_DB_NAME` (default `school_test`) is dropped and
recreated on every run — never point it at real data.

CI (`.github/workflows/test.yml`) runs the unit tests, the integration tests
against a MySQL 8 service, and the frontend tests and lint on every push and PR.

## Schema changes

`server/Sql/database.sql` is the full schema for a fresh install (docker-compose
loads it). For every schema change also add an idempotent, MySQL-8-compatible
migration in `server/Sql/` for existing databases (no `ADD COLUMN IF NOT EXISTS`
— that is MariaDB-only; check `information_schema` instead).

## Conventions

- API responses: `{ success, message?, data? }`; never return `error.message`.
- Errors in domain/use cases: `ValidationError` / `NotFoundError` from
  `server/src/shared/errors` with an i18n key as the code.
- SQL: `?` placeholders only; scope branch-owned tables with `branchFilter()`.
- Secrets live in `.env` files, never in code or `docker-compose.yml`.
