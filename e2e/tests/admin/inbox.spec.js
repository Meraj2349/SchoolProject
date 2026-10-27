import { E2E } from "../../fixtures/data.js";
import { branchLabel, expect, openAdminPage, test, toast, tr, uniqueNumber } from "../../fixtures/admin.js";

// Applications sent from the website reach the branch's admin, who answers them.
test.use({ role: "branch" });

test("an online admission reaches the branch admin, who accepts it", async ({ page, language }) => {
  const t = (key) => tr(language, `admin.applications.${key}`);
  const applicant = `Rafi ${uniqueNumber()}`;

  // A parent applies on the website.
  const parent = await page.context().newPage();
  await parent.goto("/apply");
  await parent.waitForLoadState("networkidle");
  await parent.locator("#applicant_name").fill(applicant);
  await parent.locator("#branch_id").selectOption({ label: branchLabel(language, E2E.branchA) });
  await parent.locator("#date_of_birth").fill("2019-02-01");
  await parent.locator("#gender").selectOption("male");
  await parent.locator("#applying_for_class").fill("Class 1");
  await parent.locator("#parent_name").fill("Jamal Uddin");
  await parent.locator("#parent_contact").fill("01711000888");
  await parent.getByRole("button", { name: tr(language, "apply.submitBtn") }).click();
  await expect(parent.getByRole("heading", { name: tr(language, "apply.successTitle") })).toBeVisible();
  await parent.close();

  await openAdminPage(page, "/admin/applications");
  const status = page.getByRole("combobox", { name: `${t("updateStatus")}: ${applicant}` });
  await expect(status).toHaveValue("pending");
  await status.selectOption("accepted");
  await expect(page.getByText(t("statusUpdated"))).toBeVisible();

  await page.reload();
  await expect(page.getByRole("combobox", { name: `${t("updateStatus")}: ${applicant}` })).toHaveValue("accepted");
});

test("a job application reaches the branch admin, who shortlists it", async ({ page, language }) => {
  const t = (key) => tr(language, `admin.jobApplications.${key}`);
  const n = uniqueNumber();
  const applicant = `Shirin ${n}`;

  // A teacher applies for the circular's post.
  const visitor = await page.context().newPage();
  await visitor.goto("/jobs");
  await visitor.getByRole("main").getByRole("link", { name: tr(language, "jobs.applyOnline") }).first().click();
  const form = visitor.locator("form").filter({ has: visitor.getByRole("button", { name: tr(language, "jobs.form.submit") }) });
  await form.getByLabel(tr(language, "jobs.form.post")).selectOption({ index: 1 });
  await form.getByLabel(tr(language, "jobs.form.fullName")).fill(applicant);
  await form.getByLabel(tr(language, "jobs.form.phone")).fill(`018${n}`);
  await form.getByLabel(tr(language, "jobs.form.education")).fill("MSc in Physics");
  await form.getByLabel(tr(language, "jobs.form.address")).fill("Natiapara, Tangail");
  await form.getByRole("button", { name: tr(language, "jobs.form.submit") }).click();
  await expect(visitor.getByRole("heading", { name: tr(language, "jobs.form.sent") })).toBeVisible();
  await visitor.close();

  await openAdminPage(page, "/admin/job-applications");
  const row = page.getByRole("row", { name: new RegExp(applicant) });
  await expect(row).toContainText(tr(language, "jobs.statuses.new"));
  await row.getByRole("button", { name: t("details") }).click();
  const details = page.getByRole("dialog", { name: applicant });
  await expect(details).toContainText("MSc in Physics");
  await details.getByLabel(t("status")).selectOption("shortlisted");
  await expect(toast(page, t("statusUpdated"))).toBeVisible();
  await details.getByRole("button", { name: t("close") }).first().click();
  await expect(row).toContainText(tr(language, "jobs.statuses.shortlisted"));
});
