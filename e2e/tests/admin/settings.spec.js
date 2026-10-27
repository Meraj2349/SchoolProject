import fs from "node:fs";
import { branchLabel, expect, openAdminPage, signedIn, signIn, test, tr, uniqueNumber } from "../../fixtures/admin.js";

// An admin changes their own password; the old one stops working.

const API = "http://127.0.0.1:3000/api";

// Starts signed out; the old password's refused sign-in answers 401.
test.use({ role: null, allowedApiErrors: ["/api/admin/login"], allowedConsoleErrors: [/status of 401/] });

test("an admin changes their password and signs in with the new one", async ({ page, language, request }) => {
  const t = (key) => tr(language, `admin.settings.${key}`);
  const n = uniqueNumber();
  const account = { email: `settings${n}@school.test`, password: `Settings-${n}` };
  const newPassword = `${account.password}-new`;

  // A fresh account for every run, made by the super admin.
  const { cookies } = JSON.parse(fs.readFileSync(signedIn("super"), "utf8"));
  const superToken = cookies.find((cookie) => cookie.name === "token").value;
  const created = await request.post(`${API}/admins`, {
    headers: { Authorization: `Bearer ${superToken}` },
    data: { Username: `settings${n}`, Email: account.email, Password: account.password, role: "branch_admin", branch_id: 1 },
  });
  expect(created.ok()).toBe(true);

  await signIn(page, language, account, branchLabel(language));
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await openAdminPage(page, "/admin/updateEmailPassword");
  await page.getByLabel(t("email")).fill(account.email);
  await page.getByLabel(t("currentPassword")).fill(account.password);
  await page.getByLabel(t("newPassword")).fill(newPassword);
  await page.getByRole("button", { name: t("update") }).click();
  await expect(page.getByText(t("successMessage"))).toBeVisible();

  await page.getByRole("button", { name: tr(language, "admin.shell.branchAdmin") }).click();
  await page.getByRole("menuitem", { name: tr(language, "admin.shell.signOut") }).click();
  await signIn(page, language, account, branchLabel(language));
  await expect(page.getByRole("alert").filter({ hasText: /\S/ })).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login$/);

  await signIn(page, language, { ...account, password: newPassword }, branchLabel(language));
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
});
