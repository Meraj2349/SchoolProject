import { createRequire } from "node:module";
import { E2E } from "../../fixtures/data.js";
import { branchLabel, expect, openAdminPage, signIn, test, tr } from "../../fixtures/admin.js";

// Signing in and out, and what happens without a session.

const jwt = createRequire(new URL("../../../server/package.json", import.meta.url))("jsonwebtoken");
const refused = { allowedApiErrors: ["/api/admin/login"], allowedConsoleErrors: [/status of 401/] };

const invalidCredentials = { en: "Invalid email or password.", bn: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।" };

test.describe("signed out", () => {
  // The refused sign-ins below answer 401.
  test.use({ role: null, ...refused });

  test("a wrong password keeps the admin on the login page with the reason", async ({ page, language }) => {
    await signIn(page, language, { ...E2E.admins.super, password: "wrong-password" });
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toHaveText(language === "bn" ? invalidCredentials.bn : invalidCredentials.en);
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("a branch admin cannot sign in to another branch", async ({ page, language }) => {
    await signIn(page, language, E2E.admins.branch, branchLabel(language, E2E.branchB));
    await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("a branch admin signs in to their branch and sees its name", async ({ page, language }) => {
    await signIn(page, language, E2E.admins.branch, branchLabel(language));
    await expect(page).toHaveURL(/\/admin\/dashboard$/);
    await page.getByRole("button", { name: tr(language, "admin.shell.branchAdmin") }).click();
    await expect(page.getByRole("menu")).toContainText(branchLabel(language));
  });

  test("an admin page without a session goes to the login page", async ({ page }) => {
    await page.goto("/admin/studentList");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("signed in", () => {
  test("signing out goes to the login page and closes the admin pages", async ({ page, language }) => {
    await openAdminPage(page, "/admin/dashboard");
    await page.getByRole("button", { name: tr(language, "admin.shell.superAdmin") }).click();
    await page.getByRole("menuitem", { name: tr(language, "admin.shell.signOut") }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("expired session", () => {
  // The page's first API calls answer 401, which signs the admin out.
  test.use({ allowedApiErrors: ["/api/"], allowedConsoleErrors: [/status of 401/] });

  test("an expired session goes to the login page", async ({ page, context }) => {
    const expired = jwt.sign({ adminID: 9001, role: "super_admin", branch_id: null }, "e2e-secret", { expiresIn: -60 });
    await context.addCookies([{ name: "token", value: expired, domain: "localhost", path: "/" }]);

    await page.goto("/admin/studentList");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
