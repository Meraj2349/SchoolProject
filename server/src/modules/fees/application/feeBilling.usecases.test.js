import { beforeEach, describe, expect, it } from "@jest/globals";
import { NotFoundError } from "../../../shared/errors/index.js";
import { makeFakeFeeRepository } from "./fakeFeeRepository.js";
import { makeFeeBillingUseCases } from "./feeBilling.usecases.js";

const A = 1;
const B = 2;
const ADMIN = 5;
const code = (c) => expect.objectContaining({ code: c });
const march = { year: 2026, month: 3 };

describe("fee billing use cases", () => {
  let repo;
  let today;
  let useCases;

  const generate = (input = {}, branchId = A) =>
    useCases.generateMonthlyInvoices({ branchId, adminId: ADMIN, input: { ...march, ...input } });
  const pay = (invoiceId, input = {}) =>
    useCases.recordPayment({ branchId: A, adminId: ADMIN, invoiceId, input: { method: "cash", ...input } });
  const firstInvoiceOf = async (studentId) =>
    (await useCases.listInvoices({ branchId: A, filters: { student_id: studentId } }))[0];

  beforeEach(async () => {
    today = "2026-03-05";
    repo = makeFakeFeeRepository({
      students: [
        { id: 7, branch_id: A, class_name: "Class 5", section: "Good" },
        { id: 9, branch_id: A, class_name: "Class 6" },
        { id: 8, branch_id: B, class_name: "Class 5" },
      ],
    });
    await repo.saveSettings(A, { due_day: 10, late_fine: 50, receipt_prefix: "MN" });
    await repo.createStructure(A, { class_name: "Class 5", academic_year: 2026, monthly_tuition: 1000 });
    await repo.createStructure(B, { class_name: "Class 5", academic_year: 2026, monthly_tuition: 900 });
    useCases = makeFeeBillingUseCases({ feeRepository: repo, today: () => today });
  });

  describe("generateMonthlyInvoices", () => {
    it("bills each student of the branch their class tuition, due on the branch's due day", async () => {
      const result = await generate();

      expect(result).toEqual({ created: 1, already_invoiced: 0, without_fees: 1 });
      const invoice = await firstInvoiceOf(7);
      expect(invoice).toMatchObject({ ...march, branch_id: A, due_date: "2026-03-10", status: "unpaid", total: 1000 });
      expect(invoice).toMatchObject({ created_by: ADMIN, class_name: "Class 5", section: "Good" });
    });

    it("is safe to run twice for the same month", async () => {
      await generate();

      expect(await generate()).toEqual({ created: 0, already_invoiced: 1, without_fees: 1 });
      expect(repo.tables.invoices.rows.size).toBe(1);
    });

    it("adds the chosen extra fees at their default or a given amount", async () => {
      const exam = await repo.createHead(A, { name_en: "Exam fee", default_amount: 300, active: true });
      const trip = await repo.createHead(A, { name_en: "Trip", default_amount: 200, active: true });

      await generate({ extras: [{ head_id: exam.id }, { head_id: trip.id, amount: "150" }] });

      expect((await firstInvoiceOf(7)).total).toBe(1450);
      expect((await firstInvoiceOf(9)).total).toBe(450);
    });

    it("refuses another branch's fee head", async () => {
      const other = await repo.createHead(B, { name_en: "Exam fee", default_amount: 300, active: true });

      await expect(generate({ extras: [{ head_id: other.id }] })).rejects.toThrow(code("fee_head_not_found"));
      expect(repo.tables.invoices.rows.size).toBe(0);
    });

    it("bills only the chosen classes", async () => {
      await repo.createStructure(A, { class_name: "Class 6", academic_year: 2026, monthly_tuition: 1100 });

      expect(await generate({ class_names: ["Class 6"] })).toMatchObject({ created: 1 });
      expect(await firstInvoiceOf(7)).toBeUndefined();
    });

    it("applies the student's discounts that are valid that month", async () => {
      await repo.createDiscount(A, { student_id: 7, kind: "percent", value: 50, applies_to: "tuition", reason: null, valid_from: null, valid_to: null });
      await repo.createDiscount(A, { student_id: 7, kind: "fixed", value: 100, applies_to: "tuition", reason: null, valid_from: "2026-04-01", valid_to: null });

      await generate();

      expect((await firstInvoiceOf(7)).total).toBe(500);
    });

    it("rejects extras or classes that are not lists", async () => {
      await expect(generate({ extras: { head_id: 1 } })).rejects.toThrow(code("fee_generate_invalid"));
      await expect(generate({ class_names: "Class 5" })).rejects.toThrow(code("fee_generate_invalid"));
      await expect(generate({ class_names: [{}] })).rejects.toThrow(code("fee_generate_invalid"));
    });

    it("needs a branch and a valid month", async () => {
      await expect(generate({}, null)).rejects.toThrow(code("fee_branch_required"));
      await expect(generate({ month: 13 })).rejects.toThrow(code("fee_period_invalid"));
    });
  });

  describe("recordPayment", () => {
    let invoiceId;

    beforeEach(async () => {
      await generate();
      invoiceId = (await firstInvoiceOf(7)).id;
    });

    it("records a partial payment with a numbered receipt", async () => {
      const receipt = await pay(invoiceId, { amount: 400 });

      expect(receipt.payment).toMatchObject({ amount: 400, receipt_no: "MN-2026-00001", received_by: ADMIN, paid_on: today });
      expect(receipt.invoice).toMatchObject({ status: "partial", total: 1000, paid: 400, balance: 600 });
    });

    it("marks the invoice paid once the balance is cleared, with the next receipt number", async () => {
      await pay(invoiceId, { amount: 400 });

      const receipt = await pay(invoiceId, { amount: 600 });

      expect(receipt.payment.receipt_no).toBe("MN-2026-00002");
      expect(receipt.invoice.status).toBe("paid");
    });

    it("refuses to take more than the balance and records nothing", async () => {
      await expect(pay(invoiceId, { amount: 1000.01 })).rejects.toThrow(code("fee_payment_exceeds_balance"));
      expect(repo.tables.payments.rows.size).toBe(0);
    });

    it("adds the late fine first when paid after the due date", async () => {
      today = "2026-03-11";

      const receipt = await pay(invoiceId, { amount: 1050 });

      expect(receipt.invoice).toMatchObject({ total: 1050, status: "paid" });
      expect(receipt.invoice.items).toContainEqual(expect.objectContaining({ kind: "late_fine", amount: 50 }));
    });

    it("charges no late fine when the payment is dated on time", async () => {
      today = "2026-03-20";

      const receipt = await pay(invoiceId, { amount: 1000, paid_on: "2026-03-09" });

      expect(receipt.invoice.status).toBe("paid");
    });

    it("cannot pay another branch's invoice", async () => {
      await generate({}, B);
      const otherId = (await useCases.listInvoices({ branchId: B, filters: {} }))[0].id;

      await expect(pay(otherId, { amount: 1 })).rejects.toThrow(code("fee_invoice_not_found"));
    });
  });

  describe("voidPayment", () => {
    let paymentId;

    beforeEach(async () => {
      await generate();
      const receipt = await pay((await firstInvoiceOf(7)).id, { amount: 1000 });
      paymentId = receipt.payment.id;
    });

    const voidIt = (input = { reason: "Wrong student" }) =>
      useCases.voidPayment({ branchId: A, adminId: ADMIN, paymentId, input });

    it("keeps the payment but reopens the balance", async () => {
      await voidIt();

      expect(repo.tables.payments.rows.get(paymentId)).toMatchObject({ voided_by: ADMIN, void_reason: "Wrong student" });
      expect(await firstInvoiceOf(7)).toMatchObject({ status: "unpaid", balance: 1000 });
    });

    it("cannot void twice or without a reason", async () => {
      await expect(voidIt({ reason: "" })).rejects.toThrow(code("fee_void_reason_required"));
      await voidIt();
      await expect(voidIt()).rejects.toThrow(code("fee_payment_already_voided"));
    });

    it("cannot void another branch's payment", async () => {
      await expect(
        useCases.voidPayment({ branchId: B, adminId: ADMIN, paymentId, input: { reason: "x" } }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("applyLateFines", () => {
    beforeEach(() => generate());

    it("fines every invoice of the month that is still owed after its due date, once", async () => {
      today = "2026-03-11";

      expect(await useCases.applyLateFines({ branchId: A, input: march })).toEqual({ fined: 1 });
      expect(await useCases.applyLateFines({ branchId: A, input: march })).toEqual({ fined: 0 });
      expect((await firstInvoiceOf(7)).total).toBe(1050);
    });

    it("does nothing before the due date", async () => {
      expect(await useCases.applyLateFines({ branchId: A, input: march })).toEqual({ fined: 0 });
    });

    it("leaves paid invoices alone", async () => {
      await pay((await firstInvoiceOf(7)).id, { amount: 1000 });
      today = "2026-03-11";

      expect(await useCases.applyLateFines({ branchId: A, input: march })).toEqual({ fined: 0 });
    });
  });

  describe("reading", () => {
    beforeEach(() => generate());

    it("rejects an unknown status filter", async () => {
      await expect(useCases.listInvoices({ branchId: A, filters: { status: "bogus" } })).rejects.toThrow(
        code("fee_status_invalid"),
      );
    });

    it("rejects a repeated text filter instead of passing a list to the database", async () => {
      await expect(
        useCases.listInvoices({ branchId: A, filters: { class_name: ["Class 5", "Class 6"] } }),
      ).rejects.toThrow(code("fee_filter_invalid"));
    });

    it("returns an invoice with its items, payments and totals", async () => {
      const { id } = await firstInvoiceOf(7);

      expect(await useCases.getInvoice({ branchId: A, id })).toMatchObject({ total: 1000, paid: 0, balance: 1000, items: [expect.any(Object)], payments: [] });
      await expect(useCases.getInvoice({ branchId: B, id })).rejects.toThrow(code("fee_invoice_not_found"));
    });

    it("builds a student's ledger with what they owe overall", async () => {
      await pay((await firstInvoiceOf(7)).id, { amount: 250 });

      const ledger = await useCases.studentLedger({ branchId: A, studentId: 7 });

      expect(ledger.student).toMatchObject({ id: 7 });
      expect(ledger.invoices).toHaveLength(1);
      expect(ledger.payments).toHaveLength(1);
      expect(ledger.totals).toEqual({ total: 1000, paid: 250, balance: 750 });
      await expect(useCases.studentLedger({ branchId: A, studentId: 8 })).rejects.toThrow(code("fee_student_not_found"));
    });

    it("summarises a month: billed, collected, outstanding, overdue and per class", async () => {
      await repo.createStructure(A, { class_name: "Class 6", academic_year: 2026, monthly_tuition: 800 });
      await generate();
      await pay((await firstInvoiceOf(9)).id, { amount: 800 });
      today = "2026-03-11";

      const summary = await useCases.monthlySummary({ branchId: A, input: march });

      expect(summary).toEqual({
        ...march,
        invoices: 2,
        billed: 1800,
        collected: 800,
        outstanding: 1000,
        overdue: 1,
        by_class: [
          { class_name: "Class 5", invoices: 1, billed: 1000, collected: 0, outstanding: 1000 },
          { class_name: "Class 6", invoices: 1, billed: 800, collected: 800, outstanding: 0 },
        ],
      });
    });

    it("returns a payment's receipt and refuses another branch's", async () => {
      const { payment } = await pay((await firstInvoiceOf(7)).id, { amount: 100 });

      const receipt = await useCases.getReceipt({ branchId: A, paymentId: payment.id });

      expect(receipt.payment.receipt_no).toBe("MN-2026-00001");
      expect(receipt.invoice.balance).toBe(900);
      await expect(useCases.getReceipt({ branchId: B, paymentId: payment.id })).rejects.toThrow(code("fee_payment_not_found"));
    });
  });
});
