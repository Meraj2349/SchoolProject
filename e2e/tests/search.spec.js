import { E2E } from "../fixtures/data.js";
import { expect, openPage, test, tr } from "../fixtures/test.js";

// The public look-up pages, used the way a parent or student uses them.
const STUDENT = `${E2E.student.first} Uddin`;

test.describe("attendance", () => {
  test("shows a class's attendance with each student's status", async ({ page, language }) => {
    await openPage(page, "/attendance");

    await page.locator("#attendance-class").selectOption("Class 5");
    await page.locator("#attendance-section").selectOption("Good");
    await page.getByRole("button", { name: tr(language, "attendance.searchBtn") }).click();

    const table = page.getByRole("table");
    await expect(table.getByRole("row", { name: new RegExp(STUDENT) }).first()).toContainText(tr(language, "attendance.statuses.present"));
    await expect(table.getByRole("row", { name: /Karim Uddin/ }).first()).toContainText(tr(language, "attendance.statuses.absent"));
    await expect(page.getByRole("list", { name: tr(language, "attendance.summary") })).toBeVisible();
  });

  test("says when a class has no attendance yet", async ({ page, language }) => {
    await openPage(page, "/attendance");

    await page.locator("#attendance-class").selectOption("Class 9");
    await page.locator("#attendance-section").selectOption("Good");
    await page.getByRole("button", { name: tr(language, "attendance.searchBtn") }).click();

    await expect(page.getByText(tr(language, "attendance.noRecords"))).toBeVisible();
  });
});

test.describe("results", () => {
  test("finds a student's exam results by class, section, name and roll", async ({ page, language }) => {
    await openPage(page, "/result");

    await page.locator("#result-class").selectOption("Class 5");
    await page.locator("#result-section").selectOption("Good");
    await page.locator("#result-first-name").fill(E2E.student.first);
    await page.locator("#result-roll").fill(E2E.student.roll);
    await page.getByRole("button", { name: tr(language, "results.searchBtn") }).click();

    await expect(page.getByText(E2E.exam).first()).toBeVisible();
    await expect(page.getByText("Mathematics").first()).toBeVisible();
    await expect(page.getByText("Bangla").first()).toBeVisible();
  });
});

test.describe("students", () => {
  test("finds a student by class, section, name and roll", async ({ page, language }) => {
    await openPage(page, "/students");

    await page.locator("#student-class").selectOption("Class 5");
    await page.locator("#student-section").selectOption("Good");
    await page.locator("#student-first-name").fill(E2E.student.first.toLowerCase());
    await page.locator("#student-roll").fill(E2E.student.roll);
    await page.getByRole("button", { name: tr(language, "students.searchBtn") }).click();

    await expect(page.getByRole("heading", { name: STUDENT })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Karim Uddin" })).toHaveCount(0);
  });
});

test.describe("teachers", () => {
  test("lists the teachers and filters them by name", async ({ page }) => {
    await openPage(page, "/teachers");
    await expect(page.getByText("Kamal Hossain").first()).toBeVisible();

    await page.locator("#teacher-search").fill(E2E.teacher.first.toLowerCase());

    await expect(page.getByText(`${E2E.teacher.first} ${E2E.teacher.last}`).first()).toBeVisible();
    await expect(page.getByText("Kamal Hossain")).toHaveCount(0);
  });
});

test.describe("routines", () => {
  test("filters routines by class", async ({ page }) => {
    await openPage(page, "/routine");
    await expect(page.getByText(E2E.routine).first()).toBeVisible();

    await page.locator("#routine-class").selectOption("Class 6");
    await expect(page.getByText(E2E.routine)).toHaveCount(0);

    await page.locator("#routine-class").selectOption("Class 5");
    await expect(page.getByText(E2E.routine).first()).toBeVisible();
  });
});

test.describe("gallery", () => {
  test("shows photos and filters them by category", async ({ page, language }) => {
    await openPage(page, "/gallery");
    await expect(page.locator("main img")).toHaveCount(2);

    await page.getByRole("button", { name: tr(language, "gallery.categories.school") }).click();

    await expect(page.locator("main img")).toHaveCount(1);
    await expect(page.getByRole("button", { name: tr(language, "gallery.categories.school") })).toHaveAttribute("aria-pressed", "true");
  });
});
