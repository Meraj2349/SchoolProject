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

## Commands

```bash
# server
cd server && npm test            # Jest + Supertest (ESM)
cd server && npm run test:watch
cd server && npm run dev         # needs MySQL + server/.env

# frontend
cd frontend && npm test          # Vitest + Testing Library
cd frontend && npm run lint
cd frontend && npm run dev       # http://localhost:5173
```

CI (`.github/workflows/test.yml`) runs both test suites and the frontend lint on
every push and pull request.

## Conventions

- API responses: `{ success, message?, data? }`; never return `error.message`.
- Errors in domain/use cases: `ValidationError` / `NotFoundError` from
  `server/src/shared/errors` with an i18n key as the code.
- SQL: `?` placeholders only; scope branch-owned tables with `branchFilter()`.
- Secrets live in `.env` files, never in code or `docker-compose.yml`.
