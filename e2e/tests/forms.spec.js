import { E2E } from "../fixtures/data.js";
import { expect, openPage, pick, test, tr } from "../fixtures/test.js";

// The public forms, filled in and sent to the real API.

// A different mobile number per browser project: the API refuses a second
// application for the same post from the same number.
const phoneFor = (projectName) => `0171${String([...projectName].reduce((n, c) => n * 31 + c.charCodeAt(0), 7) % 10_000_000).padStart(7, "0")}`;

test.describe("online admission", () => {
  test("sends an application and confirms it", async ({ page, language }) => {
    await openPage(page, "/apply");

    await page.locator("#applicant_name").fill("Tania Akter");
    await page.locator("#branch_id").selectOption({ label: pick(language, E2E.branchB) });
    await page.locator("#date_of_birth").fill("2018-05-14");
    await page.locator("#gender").selectOption("female");
    await page.locator("#applying_for_class").fill("Class 1");
    await page.locator("#parent_name").fill("Shahana Begum");
    await page.locator("#parent_contact").fill("01711000999");
    await page.getByRole("button", { name: tr(language, "apply.submitBtn") }).click();

    await expect(page.getByRole("heading", { name: tr(language, "apply.successTitle") })).toBeVisible();
  });

  test("does not send an empty form", async ({ page, language }) => {
    let sent = false;
    page.on("request", (request) => {
      if (request.method() === "POST" && request.url().includes("/api/applications")) sent = true;
    });
    await openPage(page, "/apply");

    await page.getByRole("button", { name: tr(language, "apply.submitBtn") }).click();

    await expect(page.getByText(tr(language, "apply.requiredFields"))).toBeVisible();
    await expect(page.locator("#applicant_name")).toHaveAttribute("aria-invalid", "true");
    expect(sent).toBe(false);
  });
});

test.describe("job circulars", () => {
  test("opens a circular from the list and applies for a post", async ({ page, language }, testInfo) => {
    await openPage(page, "/jobs");
    await page.getByRole("main").getByRole("link", { name: tr(language, "jobs.applyOnline") }).first().click();
    await expect(page.locator("h1")).toContainText(pick(language, E2E.circular));

    const form = page.locator("form").filter({ has: page.getByRole("button", { name: tr(language, "jobs.form.submit") }) });
    await form.getByLabel(tr(language, "jobs.form.post")).selectOption({ index: 1 });
    await form.getByLabel(tr(language, "jobs.form.fullName")).fill("Mahmud Hasan");
    await form.getByLabel(tr(language, "jobs.form.phone")).fill(phoneFor(testInfo.project.name));
    await form.getByLabel(tr(language, "jobs.form.education")).fill("BSc in Mathematics");
    await form.getByLabel(tr(language, "jobs.form.address")).fill("Delduar, Tangail");
    await form.getByRole("button", { name: tr(language, "jobs.form.submit") }).click();

    await expect(page.getByRole("heading", { name: tr(language, "jobs.form.sent") })).toBeVisible();
  });

  test("points out a wrong mobile number before sending", async ({ page, language }) => {
    await openPage(page, "/jobs");
    await page.getByRole("main").getByRole("link", { name: tr(language, "jobs.applyOnline") }).first().click();

    const form = page.locator("form").filter({ has: page.getByRole("button", { name: tr(language, "jobs.form.submit") }) });
    await form.getByLabel(tr(language, "jobs.form.phone")).fill("12345");
    await form.getByRole("button", { name: tr(language, "jobs.form.submit") }).click();

    await expect(form.getByText(tr(language, "jobs.form.phoneInvalid"))).toBeVisible();
    await expect(form.getByText(tr(language, "jobs.form.fillRequired"))).toBeVisible();
  });
});

test.describe("quiz", () => {
  test("a student signs in, takes a quiz and sees the score and progress", async ({ page, language }) => {
    await openPage(page, "/quaker");
    await page.getByRole("link", { name: tr(language, "quaker.startQuiz") }).first().click();

    // The site header has its own branch picker: use the quiz's form.
    const form = page.locator("form").filter({ has: page.getByRole("button", { name: tr(language, "quiz.verify") }) });
    await form.getByLabel(tr(language, "quiz.branch")).selectOption({ label: pick(language, E2E.branchA) });
    await form.getByLabel(tr(language, "quiz.class")).selectOption("Class 5");
    await form.getByLabel(tr(language, "quiz.section")).selectOption("Good");
    await form.getByLabel(tr(language, "quiz.firstName")).fill(E2E.student.first);
    await form.getByLabel(tr(language, "quiz.lastName")).fill("Uddin");
    await form.getByLabel(tr(language, "quiz.rollNumber")).fill(E2E.student.roll);
    await form.getByRole("button", { name: tr(language, "quiz.verify") }).click();

    await expect(page.getByRole("heading", { name: tr(language, "quiz.pickTitle") })).toBeVisible();
    await page.getByRole("button", { name: tr(language, "quiz.start") }).click();

    // Answer every question with its first option, then submit.
    const submit = page.getByRole("button", { name: tr(language, "quiz.submit") });
    for (let question = 0; question < 20; question += 1) {
      const firstOption = page.locator("h2 + div button[aria-pressed]").first();
      await firstOption.click();
      await expect(firstOption).toHaveAttribute("aria-pressed", "true");
      if (await submit.isVisible()) break;
      await page.getByRole("button", { name: tr(language, "quiz.next") }).click();
    }
    await submit.click();

    await expect(page.getByRole("heading", { name: tr(language, "quiz.complete") })).toBeVisible();
    await page.getByRole("link", { name: tr(language, "quiz.viewProgress") }).click();
    await expect(page).toHaveURL(/\/quaker\/progress/);
  });
});
