import { E2E } from "../fixtures/data.js";
import { expect, headerControls, openPage, pick, test, tr } from "../fixtures/test.js";

// What every page shares: the menu, the language switch and the branch picker.

test("every link in the header and footer opens a working page", async ({ page, request, isMobile }) => {
  // The phone layout hides the same links behind the menu; checked below.
  test.skip(isMobile, "the links are the same on phones");
  await openPage(page, "/");

  const hrefs = await page.locator("header a[href^='/'], footer a[href^='/']").evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute("href")))]);
  expect(hrefs.length).toBeGreaterThan(8);
  const broken = [];
  for (const href of hrefs) {
    const response = await request.get(href);
    if (response.status() >= 400) broken.push(`${href} → ${response.status()}`);
  }
  expect(broken).toEqual([]);
});

test("the phone menu opens, goes to a page and closes", async ({ page, language, isMobile }) => {
  test.skip(!isMobile, "desktop shows the menu bar instead");
  await openPage(page, "/");

  await page.getByRole("button", { name: tr(language, "site.openMenu") }).click();
  const menu = page.getByRole("dialog", { name: tr(language, "site.menu") });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: tr(language, "nav.events"), exact: true }).click();

  await expect(page).toHaveURL(/\/events$/);
  await expect(page.locator("h1").first()).toContainText(tr(language, "events.title"));
  await expect(page.getByRole("button", { name: tr(language, "site.openMenu") })).toHaveAttribute("aria-expanded", "false");
});

test("the language switch changes the page and is remembered", async ({ page, language, isMobile }) => {
  const other = language === "bn" ? "en" : "bn";
  await openPage(page, "/teachers");

  const controls = await headerControls(page, language, isMobile);
  // A click before React has taken over the page is lost; try until it lands.
  await expect(async () => {
    await controls.getByRole("button", { name: other === "en" ? "EN" : "বাংলা", exact: true }).click();
    await expect(page.locator("h1").first()).toContainText(tr(other, "teachers.pageTitle"), { timeout: 1000 });
  }).toPass();
  await expect(page.locator("html")).toHaveAttribute("lang", other);
  await page.reload();
  await expect(page.locator("h1").first()).toContainText(tr(other, "teachers.pageTitle"));
});

test("choosing a branch shows that branch's content on every page", async ({ page, language, isMobile }) => {
  await openPage(page, "/teachers");
  await expect(page.getByText("Kamal Hossain").first()).toBeVisible();

  const controls = await headerControls(page, language, isMobile);
  await expect(async () => {
    await controls.getByRole("button", { name: tr(language, "branchSelector.switchBranch") }).click();
    await expect(page.getByRole("option", { name: pick(language, E2E.branchB) })).toBeVisible({ timeout: 1000 });
  }).toPass();
  await page.getByRole("option", { name: pick(language, E2E.branchB) }).click();
  if (isMobile && (await controls.isVisible())) await controls.getByRole("button", { name: tr(language, "site.closeMenu") }).click();

  await expect(page.getByText("Rupa Begum").first()).toBeVisible();
  await expect(page.getByText("Kamal Hossain")).toHaveCount(0);

  // Still chosen on the next page.
  await page.goto("/branches");
  const after = await headerControls(page, language, isMobile);
  await expect(after.getByRole("button", { name: tr(language, "branchSelector.switchBranch") })).toContainText(pick(language, E2E.branchB));
});

test("a job circular's own page shows its posts and the application form", async ({ page, language }) => {
  await openPage(page, "/jobs");
  await page.getByRole("main").getByRole("link", { name: tr(language, "jobs.applyOnline") }).first().click();

  await expect(page).toHaveURL(/\/jobs\/\d+$/);
  await expect(page.getByRole("table").getByText(pick(language, E2E.post))).toBeVisible();
  await expect(page.getByRole("button", { name: tr(language, "jobs.form.submit") })).toBeVisible();
});
