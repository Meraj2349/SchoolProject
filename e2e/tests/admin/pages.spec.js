import { ADMIN_HOME } from "../../../frontend/src/components/admin/navigation.js";
import { ADMIN_PAGES, expect, openAdminPage, test, tr } from "../../fixtures/admin.js";

// Every page of the admin menu (the frontend's own list) opens for each kind
// of admin without errors. A branch admin never gets the super admin's pages.

const superAdminOnly = ADMIN_PAGES.filter((item) => item.superAdminOnly);
const everyoneElse = ADMIN_PAGES.filter((item) => !item.superAdminOnly);

async function expectCurrentPage(page, language, isMobile, item) {
  // Phones hide the breadcrumbs.
  if (isMobile) return;
  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" }).locator("[aria-current='page']");
  await expect(breadcrumb).toHaveText(tr(language, item.path === ADMIN_HOME ? "admin.shell.home" : item.key));
}

/** Every link in the admin menu, with all its groups opened. */
async function menuLinks(page, language, isMobile) {
  if (isMobile) await page.getByRole("button", { name: tr(language, "admin.shell.toggleMenu") }).click();
  const menu = page.getByRole("complementary", { name: tr(language, "admin.shell.menu") });
  const closed = menu.locator("button[aria-expanded='false']");
  while ((await closed.count()) > 0) await closed.first().click();
  return menu.getByRole("link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
}

test.describe("super admin", () => {
  for (const item of ADMIN_PAGES) {
    test(`${item.path} opens`, async ({ page, language, isMobile }) => {
      await openAdminPage(page, item.path);
      await expectCurrentPage(page, language, isMobile, item);
    });
  }

  test("the menu has every admin page", async ({ page, language, isMobile }) => {
    await openAdminPage(page, "/admin/dashboard");
    expect((await menuLinks(page, language, isMobile)).sort()).toEqual(ADMIN_PAGES.map((item) => item.path).sort());
  });
});

test.describe("branch admin", () => {
  test.use({ role: "branch" });

  for (const item of everyoneElse) {
    test(`${item.path} opens`, async ({ page, language, isMobile }) => {
      await openAdminPage(page, item.path);
      await expectCurrentPage(page, language, isMobile, item);
    });
  }

  test("the menu leaves out the super admin's pages", async ({ page, language, isMobile }) => {
    await openAdminPage(page, "/admin/dashboard");
    expect((await menuLinks(page, language, isMobile)).sort()).toEqual(everyoneElse.map((item) => item.path).sort());
  });

  for (const item of superAdminOnly) {
    test(`${item.path} is refused by its address`, async ({ page, language }) => {
      await openAdminPage(page, item.path);
      await expect(page.getByRole("main")).toContainText(tr(language, "admin.shell.superAdminOnly"));
      await expect(page.getByRole("main").getByRole("button")).toHaveCount(0);
      await expect(page.getByRole("main").getByRole("textbox")).toHaveCount(0);
    });
  }
});
