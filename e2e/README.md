# Browser tests of the public website

Playwright opens every public page in Chromium — desktop and phone, Bangla and
English — against the real API and a production build of the frontend.

```bash
npm ci
npx playwright install chromium   # once
npm test                          # npm run report: the HTML report of the last run
```

`npm test` runs `seed.js` first: it drops and rebuilds the database
`E2E_DB_NAME` (default `school_e2e`) from `server/Sql/database.sql` and fills it
with the data the pages show (`fixtures/data.js`). Configure the MySQL server
with `E2E_DB_HOST`, `E2E_DB_PORT`, `E2E_DB_USER`, `E2E_DB_PASSWORD` (defaults:
`127.0.0.1:3306`, `school_test`). Never point it at real data.

Locally an API on :3000 or a frontend on :5173 that is already running is
reused; stop them if you changed the server or the frontend.

What every test checks on its own (`fixtures/test.js`): no console error, no
uncaught exception and no failed API call. Requests outside the site (the
Google map) get an empty page, so the tests do not need the internet.

- `tests/pages.spec.js` — each page loads with its heading and seeded data, no sideways scrolling
- `tests/search.spec.js` — attendance, results, students, teachers, routines, gallery
- `tests/forms.spec.js` — online admission, job application, a whole quiz
- `tests/navigation.spec.js` — header/footer links, phone menu, language switch, branch picker
