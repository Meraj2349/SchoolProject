import { E2E } from "../fixtures/data.js";
import { expect, openPage, pick, test, tr } from "../fixtures/test.js";

// Every public page loads in a real browser, shows its heading and the data
// seeded for it, and runs without console errors or failed API calls.
const PAGES = [
  { path: "/", heading: "schoolName", shows: () => [E2E.notice] },
  { path: "/about", heading: "about.title" },
  { path: "/apply", heading: "apply.pageTitle", offers: (lang) => [pick(lang, E2E.branchA), pick(lang, E2E.branchB)] },
  { path: "/attendance", heading: "attendance.pageTitle" },
  { path: "/branches", heading: "branches.pageTitle", shows: (lang) => [pick(lang, E2E.branchA), pick(lang, E2E.branchB)] },
  { path: "/chairman-message", heading: "chairman.pageTitle", shows: () => [E2E.chairmanMessage] },
  { path: "/events", heading: "events.title", shows: () => [E2E.event] },
  { path: "/gallery", heading: "gallery.title" },
  { path: "/jobs", heading: "jobs.pageTitle", shows: (lang) => [pick(lang, E2E.circular)] },
  { path: "/result", heading: "results.pageTitle" },
  { path: "/routine", heading: "routine.pageTitle", shows: () => [E2E.routine] },
  { path: "/students", heading: "students.pageTitle" },
  { path: "/teachers", heading: "teachers.pageTitle", shows: () => [`${E2E.teacher.first} ${E2E.teacher.last}`] },
  { path: "/quaker", heading: "quaker.headline" },
  { path: "/quaker/start", heading: "quiz.identityTitle" },
];

for (const { path, heading, shows = () => [], offers = () => [] } of PAGES) {
  test(`${path} loads with its content`, async ({ page, language }) => {
    await openPage(page, path);

    await expect(page.locator("h1").first()).toContainText(tr(language, heading));
    for (const text of shows(language)) await expect(page.getByText(text).first()).toBeVisible();
    // Choices in a dropdown.
    for (const text of offers(language)) await expect(page.getByRole("option", { name: text }).first()).toBeAttached();
  });
}

test.describe("a page that does not exist", () => {
  test.use({ allowedConsoleErrors: [/status of 404/] });

  test("shows the not-found page with a way home", async ({ page }) => {
    const response = await page.goto("/no-such-page");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("link", { name: /home|হোম/i }).first()).toBeVisible();
  });
});
