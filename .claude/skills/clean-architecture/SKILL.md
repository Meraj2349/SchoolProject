---
name: clean-architecture
description: Clean Architecture and clean-code rules for this school project. Use when creating a new server module, moving legacy code (server/controllers, server/models) into server/src/modules, adding frontend features, or reviewing code for layering, naming and dependency-direction problems.
---

# Clean Architecture & Clean Code

## Server layout

New and refactored server code lives in `server/src`, one folder per feature
(vertical slice). `server/src/modules/branch` is the reference implementation —
copy its shape.

```
server/src/
├── shared/
│   ├── errors/              DomainError, ValidationError, NotFoundError
│   ├── db/                  the PostgreSQL client: db.query/…, db.withTransaction(tx => …),
│   │                        `?` → $n placeholders, sql helpers (inList, insertList, …), migrate
│   ├── http/                sendError (domain error → status + translated message),
│   │                        errorHandler, requireRole, requireWriteBranch, rateLimit
│   ├── infrastructure/      adapters shared by modules (cloudinaryImageStorage)
│   ├── branchScope.js       canSee / canManage / assertCanManage / newRowBranch
│   ├── paging.js            toPage({ page, pageSize })
│   ├── schoolDate.js        school time zone (Asia/Dhaka), schoolToday(), addDays()
│   └── bdMobile.js          normalizeBdMobile() for Bangladeshi phone numbers
└── modules/<feature>/
    ├── domain/              entities, value objects, pure business rules
    ├── application/         use cases: make<Feature>UseCases({ ...ports })
    ├── infrastructure/      adapters: PostgreSQL repository, external services
    ├── interface/           HTTP controller: make<Feature>Controller({ useCases })
    └── index.js             composition root — wires adapters into use cases
```

Routes stay in `server/routes/*.routes.js` (they own auth, `authorize()` and
multer) and import the controller from `src/modules/<feature>/index.js`.

### The dependency rule

Dependencies point **inwards only**:

```
interface → application → domain
infrastructure → (implements ports used by) application
index.js → everything (wiring only)
```

| Layer | May import | Must NOT import |
|---|---|---|
| `domain` | `shared/errors` | express, pg, `shared/db`, cloudinary, fs, i18n |
| `application` | `domain`, `shared/errors` | express, `req`/`res`, `shared/db`, models, cloudinary |
| `interface` | `shared/http`, `config/i18n` | `shared/db`, models, SQL |
| `infrastructure` | `shared/db`, models, SDKs | interface |

Use cases receive their dependencies (repository, image storage, clock…) as
arguments. That is what makes them testable with in-memory fakes.

### Responsibilities

- **Domain**: validation and normalisation of input (e.g. `toNewBranch`),
  invariants. Throws `ValidationError("<i18n_key>")`.
- **Application**: orchestrates a single user intent (`createBranch`,
  `deleteBranch`). Checks existence (`NotFoundError`), calls ports, decides order
  (e.g. look up before uploading so nothing is orphaned). Returns plain objects,
  never HTTP shapes.
- **Interface**: reads `req.params/body/file/language`, calls one use case,
  writes `{ success, message?, data? }`. Errors go through `sendError` — never
  put `error.message` in a response.
- **Infrastructure**: SQL with `?` placeholders only (never string-built
  values), `branchFilter()` (`server/utils/branchFilter.js`) for branch
  scoping, SDK calls. Several writes that belong together go in
  `db.withTransaction(async (tx) => …)`. No business rules.

### Error codes are i18n keys

Throw `new ValidationError("branch_name_required")`; add the key to
`server/config/i18n.js` with both `en` and `bn` text. The controller translates
it with `req.language`.

## Migrating a legacy module (strangler pattern)

Legacy code is `server/controllers/*.controller.js` + `server/models/*.model.js`.
Move one feature at a time:

1. Write characterisation tests for the current behaviour that matters (status
   codes, response shape) against the new controller using fake use cases.
2. Extract domain rules and use cases test-first.
3. Write the repository adapter — at first it may delegate to the old model
   functions (see `postgres-branch.repository.js`), then absorb the SQL later.
4. Point the route file at the new controller; delete the old controller.
5. Never change behaviour and structure in the same step.

**Where the migration stands (Oct 2026).** Already modules in
`server/src/modules`: admins, applications, attendance, branch, content,
dashboard, exams, fees, gallery, job-applications, notifications, quiz,
results, teacher-app. Still legacy (`server/controllers` + `server/models`):
admin (auth), chairman, classes, event, routine, student, subjects, teacher.
Check `ls server/controllers` for the current list. A change to one of those
features starts by moving it.

## Schema changes (PostgreSQL 18, dbmate)

- Every change is a **new** migration: `cd server && npm run db:new -- <name>`
  creates `server/db/migrations/<timestamp>_<name>.sql`. Applied by
  `npm run db:migrate` and by the docker-compose `migrate` service. Never edit
  an applied migration. DDL is transactional; `IF NOT EXISTS` works.
- Table and column names keep their MySQL-era spelling and are quoted:
  `"Students"."StudentID"`. API responses use the same keys.
- A new text column gets a collation: `"C"` for statuses, codes, ids, phone
  numbers and links; `ci2` for names, titles, emails and free text.
- A new foreign key gets an index that starts with its columns.
- The integration tests check the last two (`collations.test.js`,
  `pgSchema.test.js`).

## Frontend layout (Next.js App Router)

```
src/app/<route>/page.js     thin: renders a feature page, no logic
src/features/<feature>/     page components and feature-only components
src/components/{ui,shared,layout}/  reusable presentational components
src/hooks/useX.js           React Query hooks — the only place that calls services
src/services/x.service.js   HTTP calls via @/lib/httpClient, no React
src/store/xStore.js         Zustand client state (auth, branch, language)
src/lib/                    framework-free helpers (queryKeys, httpClient)
```

Rules: components never call `httpClient`/axios directly — go through a hook →
service. Query keys come from `lib/queryKeys.js`. Text comes from
`useTranslations()` with keys in both `i18n/en.json` and `i18n/bn.json`.
Note `frontend/AGENTS.md`: this Next.js version differs from older ones — read
`node_modules/next/dist/docs/` before using Next APIs.

## Clean code checklist

- **Names** reveal intent: `findOrFail`, `toBranchUpdate`, not `doIt`, `data2`.
  Booleans read as questions (`isProposed`, `hasImage`).
- **Functions** do one thing, are short (aim < 20 lines), take ≤ 3 params (use
  an object beyond that), and avoid boolean flag params.
- **No duplication**: extract once the same logic appears a second time.
- **Comments** explain *why*, not *what*. Delete commented-out code.
- **Guard clauses** over nested `if`s; fail fast.
- **No magic values**: name constants (`IMAGE_FOLDER = "school/branches"`).
- **Immutability** by default; don't mutate arguments.
- **Errors**: throw typed errors, handle them at the boundary (`sendError`), no
  empty `catch {}` except for documented best-effort cleanup.
- **Security**: parameterised SQL only, branch scoping on every branch-owned
  table, never trust `branch_id` from the body for a branch_admin, no secrets in
  code or `docker-compose.yml` — use `.env`.
- Leave the code cleaner than you found it (Boy Scout rule), but keep
  refactors in their own commit.
