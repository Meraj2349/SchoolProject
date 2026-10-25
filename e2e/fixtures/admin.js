import { fileURLToPath } from "node:url";
import { NAV_GROUPS } from "../../frontend/src/components/admin/navigation.js";
import { E2E } from "./data.js";
import { expect, test as base, tr } from "./test.js";

/** Where tests/admin/auth.setup.js saves each admin's signed-in browser. */
export const signedIn = (role) => fileURLToPath(new URL(`../.auth/${role}.json`, import.meta.url));

/** The admin menu (the frontend's own list of admin pages). */
export const ADMIN_PAGES = NAV_GROUPS.flatMap((group) => group.items);

// Admin tests start signed in: `role` picks the account (super | branch),
// null starts signed out.
export const test = base.extend({
  role: ["super", { option: true }],
  storageState: async ({ role }, use) => use(role ? signedIn(role) : { cookies: [], origins: [] }),
});

/** Signs in through the login page. */
export async function signIn(page, language, { email, password }, branch = null) {
  await page.goto("/admin/login");
  await page.waitForLoadState("networkidle");
  if (branch) {
    await page.getByLabel(tr(language, "admin.auth.branch"), { exact: true }).selectOption({ label: branch });
  } else {
    await page.getByText(tr(language, "admin.auth.superAdmin"), { exact: true }).click();
  }
  await page.getByLabel(tr(language, "admin.login.email")).fill(email);
  await page.getByLabel(tr(language, "admin.login.password"), { exact: true }).fill(password);
  await page.getByRole("button", { name: tr(language, "admin.login.loginBtn") }).click();
}

/**
 * Visits an admin page and checks what every admin page must do: it stays
 * open (no bounce to the login page), shows a heading and does not scroll
 * sideways. The `problems` watcher checks for errors.
 */
export async function openAdminPage(page, path) {
  const response = await page.goto(path);
  expect(response?.status(), `${path} should load`).toBeLessThan(400);
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(new RegExp(`${path.replace(/[?]/g, "\\?")}$`));
  await expect(page.locator("main h1, main h2").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, `${path} should not scroll sideways`).toBeLessThanOrEqual(1);
}

/** The admin's own branch in the project's language. */
export const branchLabel = (language, branch = E2E.branchA) => (language === "bn" ? branch.bn : branch.en);

/** A name no other test or project uses: "<prefix> <project> <n>". */
let counter = 0;
export const unique = (testInfo, prefix) => `${prefix} ${testInfo.project.name} ${Date.now() % 100000}${++counter}`;

export { expect, tr };
