import { expect, openAdminPage, signIn, test, toast, tr, uniqueNumber } from "../../fixtures/admin.js";

// The super admin opens a branch and gives it an admin, who then runs only
// that branch. Branch admins never see another branch's people.

test("opens a branch, gives it an admin, and that admin sees only the new branch", async ({ page, language }) => {
  const branches = (key) => tr(language, `admin.branches.${key}`);
  const admins = (key) => tr(language, `admin.admins.${key}`);
  const n = uniqueNumber();
  const branch = { en: `Elasin ${n}`, bn: `এলাসিন ${n}` };
  const account = { email: `elasin${n}@school.test`, password: `Elasin-${n}` };

  await openAdminPage(page, "/admin/branches");
  await page.getByLabel(branches("nameEn")).fill(branch.en);
  await page.getByLabel(branches("nameBn")).fill(branch.bn);
  await page.getByLabel(branches("addressEn")).fill("Elasin, Delduar, Tangail");
  await page.getByRole("button", { name: branches("addBranch") }).click();
  await expect(toast(page, branches("branchAdded"))).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(branch.en) })).toBeVisible();

  await openAdminPage(page, "/admin/admins");
  await page.getByRole("button", { name: admins("addAdmin") }).click();
  const form = page.getByRole("dialog", { name: admins("addAdmin") });
  await form.getByLabel(admins("name")).fill(`Elasin admin ${n}`);
  await form.getByLabel(admins("email")).fill(account.email);
  await form.getByLabel(admins("password")).fill(account.password);
  await form.getByLabel(admins("role")).selectOption("branch_admin");
  await form.getByLabel(admins("branch")).selectOption({ label: language === "bn" ? branch.bn : branch.en });
  await form.getByRole("button", { name: admins("save") }).click();
  await expect(toast(page, admins("adminAdded"))).toBeVisible();

  // The new admin signs in to their branch: it has no students yet.
  await page.getByRole("button", { name: tr(language, "admin.shell.superAdmin") }).click();
  await page.getByRole("menuitem", { name: tr(language, "admin.shell.signOut") }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await signIn(page, language, account, language === "bn" ? branch.bn : branch.en);
  await expect(page).toHaveURL(/\/admin\/dashboard$/);

  await openAdminPage(page, "/admin/studentList");
  await expect(page.getByText(tr(language, "admin.students.noStudents"))).toBeVisible();
  await expect(page.getByText("Rahim Uddin")).toHaveCount(0);
});

test.describe("branch admin", () => {
  test.use({ role: "branch" });

  test("never sees another branch's teachers", async ({ page }) => {
    await openAdminPage(page, "/admin/teacherList");
    await expect(page.getByText("Kamal Hossain").first()).toBeVisible();
    await expect(page.getByText("Rupa Begum")).toHaveCount(0); // a Bathuli teacher
  });
});
