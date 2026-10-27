import { expect, openAdminPage, test, toast, tr, uniqueNumber } from "../../fixtures/admin.js";

// A branch admin's school day: attendance, exams and results. What they save
// shows on the overview and on the public result page.
test.use({ role: "branch" });

const isoDay = (offset) => {
  const day = new Date();
  day.setDate(day.getDate() + offset);
  return day.toISOString().slice(0, 10);
};

/** The form that holds a submit button. */
const formWith = (page, button) => page.locator("form").filter({ has: page.getByRole("button", { name: button }) });

async function openClassDay(page, language, date) {
  const t = (key) => tr(language, `admin.attendance.${key}`);
  await page.getByLabel(t("className")).selectOption("Class 6");
  await page.getByLabel(t("section")).selectOption("Good");
  await page.getByLabel(t("date")).fill(date);
  return page.getByRole("row", { name: /Sabbir Uddin/ });
}

test("corrects a past day's attendance, which stays saved", async ({ page, language }) => {
  const t = (key) => tr(language, `admin.attendance.${key}`);
  // Each language project corrects its own day, so they never overwrite each other.
  const date = isoDay(language === "en" ? -2 : -3);
  await openAdminPage(page, "/admin/attendance");

  const sabbir = await openClassDay(page, language, date);
  await sabbir.getByRole("radio", { name: t("absent") }).check();
  await page.getByRole("button", { name: t("saveAttendance") }).click();
  await expect(toast(page, t("attendanceSaved"))).toBeVisible();
  await expect(page.getByRole("main")).toContainText(`(${t("byAdmin")})`);

  await openAdminPage(page, "/admin/attendance");
  const again = await openClassDay(page, language, date);
  await expect(again.getByRole("radio", { name: t("absent") })).toBeChecked();
});

test("takes today's attendance and the branch overview shows the class as taken", async ({ page, language }) => {
  const t = (key) => tr(language, `admin.attendance.${key}`);
  await openAdminPage(page, "/admin/attendance");

  const sabbir = await openClassDay(page, language, isoDay(0));
  await page.getByRole("button", { name: t("allPresent") }).click();
  await expect(sabbir.getByRole("radio", { name: t("present") })).toBeChecked();
  await page.getByRole("button", { name: t("saveAttendance") }).click();
  await expect(toast(page, t("attendanceSaved"))).toBeVisible();

  await openAdminPage(page, "/admin/attendance/overview");
  await expect(page.getByRole("row", { name: /Class 6/ }).first()).toContainText(t("takenShort"));
});

test("creates an exam and enters marks, which the student finds on the result page", async ({ page, language }) => {
  const exams = (key) => tr(language, `admin.exams.${key}`);
  const results = (key) => tr(language, `admin.results.${key}`);
  const examName = `Half-yearly ${uniqueNumber()}`;

  await openAdminPage(page, "/admin/exams");
  const examForm = formWith(page, exams("addExam"));
  await examForm.getByLabel(exams("examType")).selectOption("Half-Yearly");
  await examForm.getByLabel(exams("examName")).fill(examName);
  await examForm.getByLabel(exams("class"), { exact: true }).selectOption("Class 5");
  await examForm.getByLabel(exams("section"), { exact: true }).selectOption("Good");
  // Exams are set up before they are held: the server refuses a past date.
  await examForm.getByLabel(exams("examDate")).fill(isoDay(7));
  await examForm.getByRole("button", { name: exams("addExam") }).click();
  await expect(page.getByText(exams("examAdded"))).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(examName) })).toBeVisible();

  await openAdminPage(page, "/admin/results");
  const resultForm = formWith(page, results("addResult"));
  await resultForm.getByLabel(results("className")).selectOption("Class 5");
  await resultForm.getByLabel(results("section")).selectOption("Good");
  await resultForm.getByLabel("Student").selectOption({ label: "Karim Uddin — Roll 2" });
  await resultForm.getByLabel(results("exam")).selectOption({ label: `${examName} – Half-Yearly` });
  await resultForm.getByLabel(results("subject")).selectOption({ label: "Mathematics" });
  await resultForm.getByLabel(results("marksObtained")).fill("77");
  await resultForm.getByLabel(results("totalMarks")).fill("100");
  await resultForm.getByRole("button", { name: results("addResult") }).click();
  await expect(page.getByText(results("resultAdded"))).toBeVisible();

  // Karim looks his result up on the website.
  const visitor = await page.context().newPage();
  await visitor.goto("/result");
  await visitor.locator("#result-class").selectOption("Class 5");
  await visitor.locator("#result-section").selectOption("Good");
  await visitor.locator("#result-first-name").fill("Karim");
  await visitor.locator("#result-roll").fill("2");
  await visitor.getByRole("button", { name: tr(language, "results.searchBtn") }).click();
  await expect(visitor.getByText(examName).first()).toBeVisible();
  await visitor.close();
});
