import { expect, openAdminPage, test, toast, tr } from "../../fixtures/admin.js";

// A month's fees from start to finish: set a class's tuition, bill the month,
// take a payment and print the receipt; the student's ledger shows it.
test.use({ role: "branch" });

// Each language project bills its own class, so they never share an invoice.
const billing = {
  en: { className: "Class 6", student: "Sabbir Uddin", tuition: "1500" },
  bn: { className: "Class 5", student: "Nadia Uddin", tuition: "1200" },
};

test("bills a class for the month, takes a payment and prints the receipt", async ({ page, language }) => {
  const t = (key) => tr(language, `admin.fees.${key}`);
  const { className, student, tuition } = billing[language];

  // 1. The class's monthly tuition.
  await openAdminPage(page, "/admin/fees/setup");
  await page.getByRole("button", { name: t("addTuition") }).click();
  const tuitionForm = page.getByRole("dialog", { name: t("addTuition") });
  await tuitionForm.getByLabel(t("className")).selectOption(className);
  await tuitionForm.getByLabel(t("monthlyTuition")).fill(tuition);
  await tuitionForm.getByRole("button", { name: t("save") }).click();
  await expect(toast(page, t("saved"))).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(className) })).toBeVisible();

  // 2. This month's invoices for that class only.
  await openAdminPage(page, "/admin/fees");
  await page.getByRole("button", { name: t("generate") }).click();
  const generate = page.getByRole("dialog");
  await generate.getByLabel(t("allClassesOption")).uncheck();
  await generate.getByLabel(className, { exact: true }).check();
  await generate.getByRole("button", { name: t("generate") }).click();
  await expect(toast(page, new RegExp(t("generated").split("{")[0].trim()))).toBeVisible();

  // 3. The payment, in full and in cash.
  await openAdminPage(page, "/admin/fees/invoices");
  const invoice = page.getByRole("row", { name: new RegExp(student) });
  await invoice.getByRole("button", { name: t("collect") }).click();
  const payment = page.getByRole("dialog", { name: t("collectTitle") });
  await expect(payment.getByLabel(t("amount"))).not.toHaveValue("");
  await payment.getByRole("button", { name: t("recordPayment") }).click();

  const done = page.getByRole("dialog", { name: new RegExp(t("paymentRecorded").split("{")[0].trim()) });
  const receiptNo = (await done.getByRole("heading").textContent()).match(/[A-Z0-9]+-\d+-\d+/)[0];
  await done.getByRole("button", { name: t("printReceipt") }).click();

  // 4. The receipt, and the student's ledger.
  await expect(page).toHaveURL(/\/admin\/fees\/receipt\/\d+$/);
  await expect(page.getByRole("main")).toContainText(receiptNo);
  await expect(page.getByRole("main")).toContainText(student);

  await openAdminPage(page, "/admin/fees/invoices");
  await expect(page.getByRole("row", { name: new RegExp(student) })).toContainText(t("statusPaid"));
  await page.getByRole("row", { name: new RegExp(student) }).getByRole("link", { name: student }).click();
  await expect(page).toHaveURL(/\/admin\/fees\/students\/\d+$/);
  await expect(page.getByRole("main")).toContainText(receiptNo);
});
