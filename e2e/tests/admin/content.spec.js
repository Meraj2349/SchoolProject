import { expect, openAdminPage, test, tr, uniqueNumber } from "../../fixtures/admin.js";

// What admins publish appears on the public website, and hiding it takes it
// off again. The super admin on "All branches" publishes for the whole school.

const isoDay = (offset) => {
  const day = new Date();
  day.setDate(day.getDate() + offset);
  return day.toISOString().slice(0, 10);
};

/** The public page in a second tab of the same browser. */
async function visit(page, path) {
  const visitor = await page.context().newPage();
  await visitor.goto(path);
  await visitor.waitForLoadState("networkidle");
  return visitor;
}

test("publishes a notice on the home page, then hides it", async ({ page, language }) => {
  const t = (key) => tr(language, `admin.notices.${key}`);
  const title = `Sports day moved ${uniqueNumber()}`;
  await openAdminPage(page, "/admin/notices");

  await page.getByLabel(t("titleLabel")).fill(title);
  await page.getByLabel(t("descriptionLabel")).fill("Sports day is now on Thursday.");
  await page.getByRole("button", { name: t("addNotice") }).click();
  await expect(page.getByText(t("noticeAdded"))).toBeVisible();

  const row = page.getByRole("row", { name: new RegExp(title) });
  await expect(row.getByRole("button", { name: t("show") })).toHaveAttribute("aria-pressed", "true");
  let home = await visit(page, "/");
  await expect(home.getByText(title).first()).toBeVisible();
  await home.close();

  await row.getByRole("button", { name: t("show") }).click();
  await expect(row.getByRole("button", { name: t("show") })).toHaveAttribute("aria-pressed", "false");
  home = await visit(page, "/");
  await expect(home.getByText(title)).toHaveCount(0);
  await home.close();
});

test("publishes news on the home page", async ({ page, language }) => {
  const t = (key) => tr(language, `admin.news.${key}`);
  const n = uniqueNumber();
  const title = { en: `Library opens ${n}`, bn: `গ্রন্থাগার খুলছে ${n}` };
  await openAdminPage(page, "/admin/news");

  await page.getByLabel(t("titleBn")).fill(title.bn);
  await page.getByLabel(t("titleEn")).fill(title.en);
  await page.getByLabel(t("date")).fill(isoDay(0));
  await page.getByRole("button", { name: t("addNews") }).click();
  await expect(page.getByText(t("newsAdded"))).toBeVisible();

  const home = await visit(page, "/");
  await expect(home.getByText(title[language]).first()).toBeVisible();
  await home.close();
});

test.describe("branch admin", () => {
  test.use({ role: "branch" });

  test("adds an event to the branch's events page", async ({ page, language }) => {
    const t = (key) => tr(language, `admin.events.${key}`);
    const name = `Science fair ${uniqueNumber()}`;
    await openAdminPage(page, "/admin/events");

    await page.getByLabel(t("eventName")).fill(name);
    await page.getByLabel(t("type")).selectOption("Academic");
    await page.getByLabel(t("startDate")).fill(isoDay(14));
    await page.getByLabel(t("endDate")).fill(isoDay(14));
    await page.getByLabel(t("venue")).fill("School hall");
    await page.getByLabel(t("description")).fill("Projects by classes 5 to 10.");
    await page.getByRole("button", { name: t("addEvent") }).click();
    await expect(page.getByText(t("eventAdded"))).toBeVisible();

    const events = await visit(page, "/events");
    await expect(events.getByText(name).first()).toBeVisible();
    await events.close();
  });
});
