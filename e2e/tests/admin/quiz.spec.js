import { E2E } from "../../fixtures/data.js";
import { expect, openAdminPage, test, toast, tr, uniqueNumber } from "../../fixtures/admin.js";

// The question bank (the super admin's) and what students get from it; the
// results and leaderboard pages show the quizzes students took.

const API = "http://127.0.0.1:3000/api";

/** The prompts of a quiz Sabbir (Class 6, Good, roll 1) starts now. */
async function quizFor(request) {
  const verify = await request.post(`${API}/quiz/verify`, {
    data: { branchId: 1, firstName: "Sabbir", lastName: "Uddin", className: "Class 6", section: "Good", rollNumber: "1" },
  });
  expect(verify.status()).toBe(200);
  const { token } = (await verify.json()).data;
  const start = await request.post(`${API}/quiz/start`, { data: { count: 50 }, headers: { Authorization: `Bearer ${token}` } });
  if (start.status() === 404) return []; // no questions left for the class
  expect(start.status()).toBe(200);
  return (await start.json()).data.questions.map((question) => question.prompt);
}

test("adds a question that students get in their quiz, and hides it again", async ({ page, language, request }) => {
  const t = (key) => tr(language, `admin.quiz.${key}`);
  const prompt = `Which gas do plants take in? (${uniqueNumber()})`;
  await openAdminPage(page, "/admin/quiz/questions");

  await page.getByRole("button", { name: t("addQuestion") }).click();
  const form = page.getByRole("dialog", { name: t("addQuestion") });
  await form.getByLabel(t("class"), { exact: false }).first().selectOption("6");
  await form.getByLabel(t("subject"), { exact: false }).first().fill("Science");
  await form.getByLabel(t("promptEn")).fill(prompt);
  for (const [letter, option] of [["A", "Oxygen"], ["B", "Carbon dioxide"], ["C", "Nitrogen"], ["D", "Helium"]]) {
    await form.getByLabel(`${t("option")} ${letter}`, { exact: false }).first().fill(option);
  }
  await form.getByLabel(t("correctAnswer")).selectOption("B");
  await form.getByRole("button", { name: t("save") }).click();
  await expect(toast(page, t("questionAdded"))).toBeVisible();

  expect(await quizFor(request)).toContain(prompt);

  await page.getByLabel(t("class")).selectOption("6");
  const row = page.getByRole("row", { name: new RegExp(prompt.replace(/[()?]/g, "\\$&")) });
  await expect(row).toContainText(t("shown"));
  await row.getByRole("button", { name: t("hide") }).click();
  await expect(toast(page, t("questionHidden"))).toBeVisible();

  expect(await quizFor(request)).not.toContain(prompt);
});

test("the results and leaderboard show the quiz a student took on the website", async ({ page, language }) => {
  await openAdminPage(page, "/admin/quiz/results");
  await expect(page.getByRole("row", { name: new RegExp(`${E2E.student.first} Uddin`) }).first()).toBeVisible();

  await openAdminPage(page, "/admin/quiz/leaderboard");
  await expect(page.getByRole("row", { name: new RegExp(`${E2E.student.first} Uddin`) }).first()).toBeVisible();
});

test.describe("branch admin", () => {
  test.use({ role: "branch" });

  test("can read the question bank but not change it", async ({ page, language }) => {
    const t = (key) => tr(language, `admin.quiz.${key}`);
    await openAdminPage(page, "/admin/quiz/questions");
    await expect(page.getByText(t("readOnlyNote"))).toBeVisible();
    await expect(page.getByRole("button", { name: t("addQuestion") })).toHaveCount(0);
  });
});
