---
name: Actual Project Architecture
description: Real stack and directory layout — differs significantly from the agent system prompt assumptions
type: project
---

The SchoolProject (repo root, e.g. /home/meraj/IdeaProjects/SchoolProject) has one web frontend (`frontend/`, website + admin panel) and a Flutter teacher app (`mobile/teacher_app/`):

**Backend** (`server/`):
- Node.js + Express (plain JavaScript, ES modules, `"type": "module"`)
- PostgreSQL 18 via `pg` (raw SQL through `server/src/shared/db`; no ORM). MySQL was retired in 2026
- Runs on port 3000 (`npm run dev` uses nodemon)
- JWT auth, bcryptjs, Cloudinary for images
- Entry point: `server/app.js`
- CORS is set to `http://localhost:5173` (see `server/app.js`)

**Frontend** (`frontend/`) — Next.js (the old Vite `client/` app was removed):
- Next.js 16.2.3 + React 19, App Router
- Tailwind CSS v4, @tanstack/react-query v5, Ant Design v6, Framer Motion, Zustand v5
- Runs on port 5173 (`npm run dev` — set via `next dev --port 5173` in package.json)
- Auth: Zustand store (authStore.js) + js-cookie (token cookie key = "token")
- API client: axios in `src/lib/httpClient.js`, reads `NEXT_PUBLIC_API_URL` env var
- All API calls go through `httpClient` which proxies to http://localhost:3000/api
- Also has `next.config.mjs` rewrites: `/api/:path*` → `http://localhost:3000/api/:path*`
- jsconfig paths: `@/*` → `./src/*`

**Key API path quirks (backend uses non-REST paths for some routes)**:
- Notices: POST `/notices/add`, PUT `/notices/edit/:id`, DELETE `/notices/delete/:id`, PUT `/notices/toggle-visibility/:id`
- Messages: POST `/messages/add`, PUT `/messages/edit/:id`, DELETE `/messages/delete/:id`
- Classes: POST `/classes/add`, PUT `/classes/edit/:id`, DELETE `/classes/delete/:id`
- Subjects: POST `/subjects/add`, PUT `/subjects/edit/:id`, DELETE `/subjects/delete/:id`
- Teachers: POST `/teachers/addTeacher`, PUT `/teachers/updateTeacher/:id`, DELETE `/teachers/deleteTeacher/:id`
- Admin auth: PUT `/admin/updateEmailPassword` (NOT `/admin/update`)
- Exams: POST `/exams/by-class` (to create)
- Images, Events, Students, Results, Attendance, Routines use standard REST paths

**Database**:
- PostgreSQL 18 (docker compose service `postgres`, host port 5433); schema from `server/db/migrations` (dbmate format)
- Database name: `School_Management`; connection settings in server/.env (DB_*)
- Tables include Admin, Attendance, Classes, Exams, Images, Messages, Notices, Results, Routines, Students, Subjects, Teachers (full list: `server/db/migrations/20261024000000_initial_schema.sql`)

**No separate admin panel** — Admin is built into the same Next.js `frontend/` app under `/admin/*` routes with layout at `src/app/admin/layout.js` (includes Sidebar + AdminGuard).

Why: The old Vite/React `client/` app was replaced by Next.js (`frontend/`) and deleted.
How to apply: When working on this project, use the frontend/ directory for UI work. Backend is plain JS Express with PostgreSQL.

## Public Pages Design System — Navy/Gold (completed 2026-04-16)

- Colors: Navy #1a2744 (dark #111b33, mid #243156), Gold #c9a84c (light #e8c97a, pale #fdf6e3)
- Applied to 4 quick-link pages: Students, Teachers, Results, Attendance
- Hero: gradient navy background, white title, gold bottom-border accent line, gold shimmer radial overlays
- Filter bar: attaches directly below hero (border-top 3px gold, border-radius 0 0 20px 20px), card-style with shadow
- Buttons: solid navy, 999px pill border-radius, navy-dark on hover, translateY(-2px)
- Grade badges (ResultsPage): A+/A=green, B+/B=yellow, C+/C=orange, D/F=red
- Attendance status badges: present=green, absent=red, late=yellow, excused=blue — each with matching border
- Results table uses `.results-table` class in StudentListpage.css (navy thead, gold-light text)
- CSS variables: scoped per file (--navy for students/results, --t-navy for teachers, --a-navy for attendance)
- CSS files: `frontend/src/styles/StudentListpage.css` (students + results), `frontend/src/styles/listcss/teacherslist.css`, `frontend/src/styles/listcss/attendancelist.css`

## Tailwind CSS Migration (completed 2026-04-12)

All admin panel and shared layout components fully migrated to Tailwind CSS v4 (already installed). Key changes:

- `src/app/globals.css`: Added `@layer components` with shared admin classes: `form-input`, `btn-primary`, `btn-secondary`, `btn-icon`, `btn-delete`, `error-message`, `success-message`, `flash-error`, `flash-success`, `table-header`, `table-cell`, `status-badge`, `status-{pending|reviewed|accepted|rejected}`, `status-select`
- `Sidebar.js`, `Navbar.js`, `Footer.js`: Fully Tailwind — no CSS imports
- `AdminLayoutInner.js`: Tailwind flex layout. Sidebar is fixed 280px wide; main content has `md:ml-[280px]`
- `LanguageSwitcher.js`: Tailwind — no CSS import
- All 17 admin feature pages (`features/admin/**`): All CSS imports removed, all inline `style={{}}` converted to Tailwind, all shared class names use globals.css @layer components
- Login/Register pages: Full Tailwind — no CSS imports
- Public pages (`features/home/`, `features/about/`, etc.) and shared components (`LottieLoader`, `NotFound`, `ChairmanCard`, etc.) retain their CSS files — not touched
- Build result: `npx next build` → 0 errors, 0 warnings, all routes static

Approach: Tailwind v4 + PostCSS is via `@tailwindcss/postcss` in `postcss.config.mjs`. No `tailwind.config.js` needed for v4 — just `@import "tailwindcss"` in globals.css.

## Attendance System (completed 2026-04-14)

Full attendance CRUD system was built. Key facts:
- (History; attendance has since moved to `server/src/modules/attendance`, see CLAUDE.md "Attendance") Original model: raw SQL — `Attendance` table with `AttendanceID, StudentID, ClassID, ClassDate, Status` columns
- Backend routes registered at `/api/attendance` in `server/app.js`
- Two key admin pages: `AdminPage.js` (mark attendance for a class/date — uses `upsertCell` per student), `AdminAttendanceGridPage.js` (interactive month grid — uses `getGrid` API which returns `{students, dates}` matrix)
- `upsertCell` endpoint (`POST /attendance/cell`) auto-resolves `classID` from `studentId` server-side — frontend never needs to pass `classID`
- Grid endpoint (`GET /attendance/grid?className=&section=&startDate=&endDate=`) returns `{ students: [{StudentID, FirstName, LastName, RollNumber, attendance: {date: status}}], dates: [] }`
- `validateStatus` helper only accepts Present/Absent; `upsertAttendanceCellController` has its own inline validation that also accepts "Late"
- Sidebar has two attendance links: `/admin/attendance` ("Mark Attendance") and `/admin/attendance/grid` ("Attendance Grid")

## Branch Multi-tenancy (fully implemented 2026-04-14)

All major models accept `branchId = null` as last param. Pattern follows `student.model.js`:
- `branchFilter(branchId, tableAlias?)` from `server/utils/branchFilter.js` (modules also use `server/src/shared/branchScope.js`)
- null branchId = super_admin (no filter); number = branch_admin (scoped)
- All controllers read `req.branchId` (set by `authMiddleware`) and pass to model functions
- All protected routes use `router.use(authMiddleware)` or per-route middleware
- **Event model special rule:** When branchId is set, uses `WHERE (branch_id = ? OR branch_id IS NULL)` to include global/school-wide events (branch_id NULL = global)
- Models updated: teacher, classes, attendance, subjects, exam, result, routine, event
- Routes with `router.use(authMiddleware)`: teacher, classes, attendance, subjects, exam, result
- Event routes: GET routes public; POST/PUT/DELETE require `authMiddleware`
- Routine routes: per-route `authMiddleware` on write routes only

**Key middleware behavior in `auth.middleware.js`:**
- `super_admin`: `req.branchId` = `parseInt(req.query.branch_id)` if provided, else null (sees all)
- `branch_admin`: `req.branchId` always = `decoded.branch_id` from JWT (immutable)
- This allows super_admin UI to send `?branch_id=X` to scope reads to a specific branch

**Frontend branch store:**
- `frontend/src/store/branchStore.js` — Zustand store persisted to localStorage key `branch-store`; fields: `currentBranchId`, `currentBranchName`; methods: `setBranch`, `lockBranch`, `resetBranch`
- `frontend/src/store/authStore.js` — stores `token`, `role`, `branchId`; `setAuth(token, role, branchId)` on login
- `frontend/src/lib/httpClient.js` — interceptor reads `branch-store` localStorage and appends `?branch_id=X` to all requests when `currentBranchId` is set
- `frontend/src/components/ui/BranchSelector.js` — dropdown for super_admin, read-only badge for branch_admin; lives in AdminTopBar
- `frontend/src/lib/queryKeys.js` — ALL branch-sensitive key factory functions accept `branchId = null` param so React Query automatically refetches when super_admin switches branches
- All hooks (`useTeachers`, `useClasses`, `useStudents`, `useEvents`, `useRoutines`) read `currentBranchId` from `useBranchStore` and pass into query keys
- Admin feature pages that use `useQuery` directly also import `useBranchStore` and pass `branchId` into query keys

## Branch Management Admin Page (added 2026-04-15)

- Route: `/admin/branches` — only visible and accessible to `super_admin`
- Feature component: `frontend/src/features/admin/branches/AdminPage.js`
- App route: `frontend/src/app/admin/branches/page.js`
- Hook: `frontend/src/hooks/useBranches.js` — exports `useBranches`, `useCreateBranch`, `useUpdateBranch`, `useDeleteBranch` (all React Query)
- Service: `frontend/src/services/branch.service.js` — added `create`, `update`, `remove` methods alongside `getAll`/`getStats`
- Sidebar: "Branches" nav item added with `FaCodeBranch` icon, `superAdminOnly: true` — only shows for `super_admin`
- i18n keys: `sidebar.branches`, `admin.branches.*` added to both `en.json` and `bn.json`
- Backend branch routes (`/api/branches`) already fully CRUD-capable; POST/PUT/DELETE require `authMiddleware`
- Branch controller handles Cloudinary image upload/delete on create/update/delete

## Super Admin Registration (fixed 2026-04-15)

- `server/controllers/admin.controller.js`: `createAdminController` now allows `role: "super_admin"` from request body
- When `role === "super_admin"`: skips `branch_id` requirement, passes `null` as `branch_id` to model
- When `role` is anything else: defaults to `"branch_admin"` and requires `branch_id`
- `frontend/src/features/admin/auth/RegisterPage.js`: updated to show "Super Admin" option in the branch select dropdown (same sentinel value `"super"` as LoginPage). Step 2 shows badge for super admin. Sends `role: "super_admin", branch_id: null` when super admin is selected.

## i18n Implementation (added 2026-04-12)

Bilingual support (English + Bangla) was added across the full stack:

- **Frontend store:** `frontend/src/store/languageStore.js` — Zustand store with persist middleware. Key function is `useTranslations(namespace?)` hook. The resolver function is named `resolveKey` (important: NOT `get` — renamed to avoid collision with Zustand's `get` parameter in the store creator).
- **Translation files:** `frontend/src/i18n/en.json` and `frontend/src/i18n/bn.json` — nested JSON covering all UI pages including all admin sections. Keys follow the pattern `section.subsection.key` (e.g. `admin.notices.title`).
- **Language switcher:** `frontend/src/components/ui/LanguageSwitcher.js` — rendered in both Navbar (public pages) and Sidebar (admin pages).
- **Backend i18n:** `server/config/i18n.js` — bilingual API response messages object. `server/middlewares/language.middleware.js` — reads `Accept-Language` header and sets `req.language` ("en" | "bn", defaults to "bn").
- **HTTP client:** `frontend/src/lib/httpClient.js` — Axios interceptor reads Zustand's localStorage (key: "language", path: `state.language`) and sets `Accept-Language` header on every outgoing API request.
- **Default language:** Bangla ("bn") everywhere — both frontend default and backend fallback.
- **All admin feature pages** use `useTranslations("admin.sectionName")` from the store.
- **LanguageSwitcher** persists the choice to localStorage via Zustand persist middleware.
