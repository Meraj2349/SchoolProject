# Browser tests of the website and the admin panel

Playwright opens every public page and every admin page in Chromium — desktop
and phone, Bangla and English — against the real API and a production build of
the frontend.

```bash
npm ci
npx playwright install chromium   # once
npm test                          # npm run report: the HTML report of the last run
```

`npm test` runs `seed.js` first: it drops and rebuilds the database
`E2E_DB_NAME` (default `school_e2e`) with the server's schema and fills it
with the data the pages show (`fixtures/data.js`). Configure the PostgreSQL
server with `E2E_DB_HOST`, `E2E_DB_PORT`, `E2E_DB_USER`, `E2E_DB_PASSWORD`
(defaults: `127.0.0.1`, port 5432, `school_test`; see `fixtures/database.js`).
Never point it at real data.

Locally an API on :3000 or a frontend on :5173 that is already running is
reused; stop them if you changed the server or the frontend.

What every test checks on its own (`fixtures/test.js`): no console error, no
uncaught exception and no failed API call. Requests outside the site (the
Google map) get an empty page, so the tests do not need the internet.

- `tests/pages.spec.js` — each page loads with its heading and seeded data, no sideways scrolling
- `tests/search.spec.js` — attendance, results, students, teachers, routines, gallery
- `tests/forms.spec.js` — online admission, job application, a whole quiz
- `tests/navigation.spec.js` — header/footer links, phone menu, language switch, branch picker

## Admin panel (`tests/admin`)

Run after the public tests (the admin tests change data). `auth.setup.js`
signs in once through the real login page as each seeded admin
(`fixtures/data.js`: a super admin, and a branch admin of the Natiapara
branch) and saves the browser to `.auth/` (git-ignored). A test picks the
account with `test.use({ role: "super" | "branch" | null })`. The workflows run
on desktop in both languages; the page checks on a phone too.

Every admin page is also checked for fields without a label a screen reader
can read. Tests share one database, so what they create gets a unique name
(`uniqueNumber()`), and the two language projects never change the same
record (each takes attendance on its own day, bills its own class).

- `pages.spec.js` — every menu page opens for both admins; a branch admin's menu has no super-admin pages and their addresses are refused
- `auth.spec.js` — sign in, wrong password, wrong branch, sign out, expired session
- `people.spec.js` — students (found on the public search), teachers and the attendance app, classes and sections
- `academics.spec.js` — attendance (past day, today, branch overview), an exam and its marks (found on the public result page)
- `fees.spec.js` — tuition, the month's invoices, a payment, the receipt and the ledger
- `content.spec.js` — notices, news and events on the public site
- `inbox.spec.js` — online admissions and job applications sent from the website
- `quiz.spec.js` — the question bank (what students get), results, leaderboard
- `super-admin.spec.js` — a new branch and its admin; branch admins see only their branch
- `settings.spec.js` — an admin changes their password
