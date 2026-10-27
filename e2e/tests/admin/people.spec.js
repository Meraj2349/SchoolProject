import { branchLabel, expect, openAdminPage, test, toast, tr, uniqueNumber } from "../../fixtures/admin.js";

// A branch admin keeps the branch's people up to date: students, teachers and
// the teachers' sign-in to the attendance app. What they add shows on the
// public website.
test.use({ role: "branch" });

const API = "http://127.0.0.1:3000/api";

test("adds a student, who can then be found on the public student search, then edits and deletes them", async ({ page, language }) => {
  const t = (key) => tr(language, `admin.students.${key}`);
  const roll = uniqueNumber();
  const lastName = `Tester${roll}`;
  await openAdminPage(page, "/admin/studentList");

  await page.getByRole("button", { name: t("addStudent") }).click();
  const form = page.getByRole("dialog", { name: t("addStudent") });
  await form.getByLabel(t("firstName")).fill("Tanvir");
  await form.getByLabel(t("lastName")).fill(lastName);
  await form.getByLabel(t("class")).selectOption("Class 8");
  await expect(form.getByLabel(t("section"))).toHaveValue("Good");
  await form.getByLabel(t("rollNumber")).fill(roll);
  await form.getByLabel(t("dateOfBirth")).fill("2015-06-01");
  await form.getByLabel(t("parentContact")).fill("01711000202");
  await form.getByRole("button", { name: t("save") }).click();

  await expect(toast(page, t("studentAdded"))).toBeVisible();
  await expect(form).toBeHidden();
  await page.getByRole("searchbox").fill(lastName);
  const row = page.getByRole("row", { name: new RegExp(lastName) });
  await expect(row).toContainText("Class 8");

  // A parent finds them on the website.
  const visitor = await page.context().newPage();
  await visitor.goto("/students");
  await visitor.locator("#student-class").selectOption("Class 8");
  await visitor.locator("#student-section").selectOption("Good");
  await visitor.locator("#student-first-name").fill("Tanvir");
  await visitor.locator("#student-roll").fill(roll);
  await visitor.getByRole("button", { name: tr(language, "students.searchBtn") }).click();
  await expect(visitor.getByRole("main").getByText(`Tanvir ${lastName}`)).toBeVisible();
  await visitor.close();

  await row.getByRole("button", { name: t("edit") }).click();
  const edit = page.getByRole("dialog", { name: t("editStudent") });
  await edit.getByLabel(t("lastName")).fill(`${lastName}x`);
  await edit.getByRole("button", { name: t("save") }).click();
  await expect(toast(page, t("studentUpdated"))).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(`${lastName}x`) })).toBeVisible();

  await page.getByRole("row", { name: new RegExp(`${lastName}x`) }).getByRole("button", { name: t("delete") }).click();
  await page.getByRole("dialog", { name: t("deleteConfirm") }).getByRole("button", { name: t("delete") }).click();
  await expect(toast(page, t("deleted"))).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(lastName) })).toHaveCount(0);
});

test("refuses a roll number already used in the class", async ({ page, language }) => {
  const t = (key) => tr(language, `admin.students.${key}`);
  await openAdminPage(page, "/admin/studentList");

  await page.getByRole("button", { name: t("addStudent") }).click();
  const form = page.getByRole("dialog", { name: t("addStudent") });
  await form.getByLabel(t("firstName")).fill("Second");
  await form.getByLabel(t("lastName")).fill("Rahim");
  await form.getByLabel(t("class")).selectOption("Class 5");
  await form.getByLabel(t("rollNumber")).fill("1"); // Rahim's
  await form.getByLabel(t("dateOfBirth")).fill("2015-06-01");
  await form.getByRole("button", { name: t("save") }).click();

  await expect(form.getByText(t("rollTaken"))).toBeVisible();
  await expect(form.getByLabel(t("rollNumber"))).toHaveAttribute("aria-invalid", "true");
});

test("adds a teacher and gives them the attendance app", async ({ page, language, request }) => {
  const t = (key) => tr(language, `admin.teachers.${key}`);
  const n = uniqueNumber();
  const lastName = `Teacher${n}`;
  const phone = `017${n}`;
  await openAdminPage(page, "/admin/teacherList");

  const form = page.locator("form").filter({ has: page.getByRole("button", { name: t("addTeacher") }) });
  await form.getByLabel(t("firstName")).fill("Farhana");
  await form.getByLabel(t("lastName")).fill(lastName);
  await form.getByLabel(t("email")).fill(`farhana${n}@school.test`);
  await form.getByLabel(t("subject")).fill("Science");
  await form.getByRole("button", { name: t("addTeacher") }).click();
  await expect(page.getByText(t("teacherAdded"))).toBeVisible();

  const row = page.getByRole("row", { name: new RegExp(lastName) });
  await expect(row).toContainText(t("appOff"));
  await row.getByRole("button", { name: t("appAccess") }).click();
  const drawer = page.getByRole("dialog", { name: new RegExp(lastName) });
  await drawer.getByLabel(t("appPhone")).fill(phone);
  await drawer.getByLabel(t("appPassword")).fill("Classroom-2026");
  await drawer.getByLabel(t("appEnabled")).check();
  await drawer.getByRole("button", { name: t("appSave") }).click();
  await expect(toast(page, t("appSaved"))).toBeVisible();
  await expect(row).toContainText(t("appOn"));

  // The teacher can now sign in to the phone app.
  const login = await request.post(`${API}/teacher-app/v1/login`, { data: { phone, password: "Classroom-2026" } });
  expect(login.status()).toBe(200);
  expect(JSON.stringify((await login.json()).data.teacher)).toContain(lastName);
});

test.describe("classes and sections", () => {
  test("a branch admin is told only the super admin adds classes", async ({ page, language }) => {
    await openAdminPage(page, "/admin/classes-sections");
    await expect(page.getByRole("note")).toHaveText(tr(language, "admin.classesSections.onlySuperAdminAdds"));
    await expect(page.getByRole("button", { name: "Add Class" })).toHaveCount(0);
  });

  test.describe("super admin", () => {
    test.use({ role: "super" });

    test("adds a section to a branch, which students can then be put in", async ({ page, language }) => {
      const section = `S${uniqueNumber().slice(-7)}`; // a section name is at most 10 characters
      await openAdminPage(page, "/admin/classes-sections");
      await page.getByRole("combobox", { name: tr(language, "branchSelector.selectBranch") }).selectOption({ label: branchLabel(language) });

      // The page's own text is English only.
      await page.getByLabel("Class").fill("Class 7");
      await page.getByLabel("Section").fill(section);
      await page.getByRole("button", { name: "Add Class" }).click();
      await expect(toast(page, "Class added")).toBeVisible();
      await expect(page.getByRole("row", { name: new RegExp(`Class 7\\s+${section}`) })).toBeVisible();

      await openAdminPage(page, "/admin/studentList");
      await page.getByRole("button", { name: tr(language, "admin.students.addStudent") }).click();
      const form = page.getByRole("dialog");
      await form.getByLabel(tr(language, "admin.students.class")).selectOption("Class 7");
      await expect(form.getByLabel(tr(language, "admin.students.section")).locator("option", { hasText: section })).toHaveCount(1);
    });
  });
});
