import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import {
  BRANCH_A,
  BRANCH_B,
  bearer,
  branchAdminToken,
  count,
  db,
  resetDb,
  seedStudent,
  superAdminToken,
} from "./helpers.js";

const adminA = bearer(branchAdminToken(BRANCH_A));
const adminB = bearer(branchAdminToken(BRANCH_B, 3));
const YEAR = 2026;
const MONTH = 3;

const api = {
  get: (url, auth = adminA) => request(app).get(`/api/fees${url}`).set(auth),
  post: (url, body = {}, auth = adminA) => request(app).post(`/api/fees${url}`).set(auth).send(body),
  put: (url, body = {}, auth = adminA) => request(app).put(`/api/fees${url}`).set(auth).send(body),
  delete: (url, auth = adminA) => request(app).delete(`/api/fees${url}`).set(auth),
};

// Class 5 tuition 1000, late fine 50 after the 10th, and one invoice for March.
async function seedBilledStudent(auth = adminA, branchId = BRANCH_A) {
  const { studentId } = await seedStudent({ branchId });
  await api.put("/settings", { due_day: 10, late_fine: 50, receipt_prefix: "MN" }, auth).expect(200);
  await api.post("/structures", { class_name: "Class 5", academic_year: YEAR, monthly_tuition: 1000 }, auth).expect(201);
  await api.post("/invoices/generate", { year: YEAR, month: MONTH }, auth).expect(200);
  const { body } = await api.get(`/invoices?student_id=${studentId}`, auth);
  return { studentId, invoiceId: body.data[0].id };
}

const payToday = (invoiceId, amount, auth = adminA) =>
  api.post(`/invoices/${invoiceId}/payments`, { amount, method: "cash", paid_on: "2026-03-05" }, auth);

describe("fees", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  it("requires an admin login", async () => {
    const res = await request(app).get("/api/fees/invoices");

    expect(res.status).toBe(401);
  });

  it("asks a super admin to pick a branch before changing fees", async () => {
    const res = await api.put("/settings", { late_fine: 10 }, bearer(superAdminToken()));

    expect(res.status).toBe(400);
  });

  it("generates invoices, takes a partial then a full payment and marks the invoice paid", async () => {
    const { invoiceId } = await seedBilledStudent();

    const partial = await payToday(invoiceId, 400);
    expect(partial.status).toBe(201);
    expect(partial.body.data.payment.receipt_no).toBe("MN-2026-00001");
    expect(partial.body.data.invoice).toMatchObject({ status: "partial", total: 1000, paid: 400, balance: 600 });

    const rest = await payToday(invoiceId, "600.00");
    expect(rest.body.data.payment.receipt_no).toBe("MN-2026-00002");
    expect(rest.body.data.invoice).toMatchObject({ status: "paid", balance: 0 });
  });

  it("does not take more than the balance", async () => {
    const { invoiceId } = await seedBilledStudent();

    const res = await payToday(invoiceId, 1000.01);

    expect(res.status).toBe(400);
    expect(await count("FeePayments")).toBe(0);
  });

  it("never overpays or reuses a receipt number when two payments arrive at once", async () => {
    const { invoiceId } = await seedBilledStudent();

    const results = await Promise.all([payToday(invoiceId, 600), payToday(invoiceId, 600), payToday(invoiceId, 400)]);

    const receipts = results.filter((r) => r.status === 201).map((r) => r.body.data.payment.receipt_no);
    expect(new Set(receipts).size).toBe(receipts.length);
    const [[{ paid }]] = await db.query("SELECT SUM(amount) AS paid FROM FeePayments");
    expect(Number(paid)).toBeLessThanOrEqual(1000);
    expect(results.filter((r) => r.status === 400)).toHaveLength(1);
  });

  it("does not bill a student twice for the same month", async () => {
    await seedBilledStudent();

    const res = await api.post("/invoices/generate", { year: YEAR, month: MONTH });

    expect(res.body.data).toEqual({ created: 0, already_invoiced: 1, without_fees: 0 });
    expect(await count("FeeInvoices")).toBe(1);
  });

  it("applies a student's discount and extra fees when generating", async () => {
    const { studentId } = await seedStudent();
    await api.post("/structures", { class_name: "Class 5", academic_year: YEAR, monthly_tuition: 1000 }).expect(201);
    const head = await api.post("/heads", { name_en: "Exam fee", default_amount: 300 }).expect(201);
    await api.post("/discounts", { student_id: studentId, kind: "percent", value: 50 }).expect(201);

    await api.post("/invoices/generate", { year: YEAR, month: MONTH, extras: [{ head_id: head.body.data.id }] }).expect(200);

    const { body } = await api.get(`/invoices?student_id=${studentId}`);
    expect(body.data[0]).toMatchObject({ total: 800, balance: 800, status: "unpaid" });
    const invoice = await api.get(`/invoices/${body.data[0].id}`);
    expect(invoice.body.data.items.map((i) => [i.kind, i.amount])).toEqual([
      ["tuition", 1000],
      ["extra", 300],
      ["discount", -500],
    ]);
  });

  it("adds the late fine once to overdue invoices", async () => {
    const { invoiceId } = await seedBilledStudent();

    const first = await api.post("/invoices/apply-late-fines", { year: YEAR, month: MONTH });
    const second = await api.post("/invoices/apply-late-fines", { year: YEAR, month: MONTH });

    expect(first.body.data).toEqual({ fined: 1 });
    expect(second.body.data).toEqual({ fined: 0 });
    expect((await api.get(`/invoices/${invoiceId}`)).body.data).toMatchObject({ total: 1050, balance: 1050 });
  });

  it("adds the late fine when a payment is dated after the due date", async () => {
    const { invoiceId } = await seedBilledStudent();

    const res = await api.post(`/invoices/${invoiceId}/payments`, { amount: 1050, method: "bkash", paid_on: "2026-03-15" });

    expect(res.status).toBe(201);
    expect(res.body.data.invoice).toMatchObject({ total: 1050, status: "paid" });
  });

  it("voids a payment, keeping it on record and reopening the balance", async () => {
    const { invoiceId } = await seedBilledStudent();
    const { body } = await payToday(invoiceId, 1000);

    const res = await api.post(`/payments/${body.data.payment.id}/void`, { reason: "Wrong student" });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: "unpaid", balance: 1000 });
    expect(await count("FeePayments", "voided_at IS NOT NULL AND void_reason = 'Wrong student'")).toBe(1);
    expect((await api.post(`/payments/${body.data.payment.id}/void`, { reason: "again" })).status).toBe(400);
  });

  it("returns a printable receipt with the student and branch", async () => {
    const { invoiceId } = await seedBilledStudent();
    const { body } = await payToday(invoiceId, 250);

    const res = await api.get(`/payments/${body.data.payment.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.payment).toMatchObject({ amount: 250, method: "cash", paid_on: "2026-03-05", receipt_no: "MN-2026-00001" });
    expect(res.body.data.invoice).toMatchObject({
      student_name: "Rahim Uddin",
      class_name: "Class 5",
      section: "Good",
      branch_name_en: "Main",
      balance: 750,
    });
  });

  it("numbers receipts separately per branch, even with the same prefix", async () => {
    const a = await seedBilledStudent(adminA, BRANCH_A);
    const b = await seedBilledStudent(adminB, BRANCH_B);

    const ra = await payToday(a.invoiceId, 10, adminA);
    const rb = await payToday(b.invoiceId, 10, adminB);

    expect(ra.body.data.payment.receipt_no).toBe("MN-2026-00001");
    expect(rb.body.data.payment.receipt_no).toBe("MN-2026-00001");
  });

  it("gives a student's ledger and the month's summary", async () => {
    const { studentId, invoiceId } = await seedBilledStudent();
    await payToday(invoiceId, 300);

    const ledger = await api.get(`/students/${studentId}/ledger`);
    const summary = await api.get(`/reports/summary?year=${YEAR}&month=${MONTH}`);

    expect(ledger.body.data.totals).toEqual({ total: 1000, paid: 300, balance: 700 });
    expect(ledger.body.data.payments).toHaveLength(1);
    expect(summary.body.data).toMatchObject({ invoices: 1, billed: 1000, collected: 300, outstanding: 700 });
  });

  it("tells the cashier which late fine a late payment will add", async () => {
    const { invoiceId } = await seedBilledStudent();

    const before = await api.get(`/invoices/${invoiceId}`);
    expect(before.body.data).toMatchObject({ due_date: "2026-03-10", balance: 1000, late_fine_pending: 50 });

    await api.post(`/invoices/${invoiceId}/payments`, { amount: 1050, method: "cash", paid_on: "2026-03-15" }).expect(201);
    const after = await api.get(`/invoices/${invoiceId}`);
    expect(after.body.data).toMatchObject({ status: "paid", balance: 0, late_fine_pending: 0 });
  });

  it("keeps fee history when someone tries to delete a billed student", async () => {
    const { studentId, invoiceId } = await seedBilledStudent();
    await payToday(invoiceId, 300);

    const res = await request(app).delete(`/api/students/${studentId}`).set(adminA).set("Accept-Language", "en");

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("This student has fee records, so they cannot be deleted.");
    expect(JSON.stringify(res.body)).not.toMatch(/foreign key|FeeInvoices/i);
    expect(await count("Students")).toBe(1);
    expect(await count("FeeInvoices")).toBe(1);
    expect(await count("FeePayments")).toBe(1);
  });

  it("keeps the student's attendance and results when the delete is refused", async () => {
    const { studentId } = await seedBilledStudent();
    const [[student]] = await db.query("SELECT ClassID FROM Students WHERE StudentID = ?", [studentId]);
    await db.query("INSERT INTO Attendance (StudentID, ClassID, ClassDate, Status, branch_id) VALUES (?, ?, '2026-03-02', 'Present', ?)", [studentId, student.ClassID, BRANCH_A]);

    await request(app).delete(`/api/students/${studentId}`).set(adminA).expect(409);

    expect(await count("Attendance")).toBe(1);
  });

  describe("branch isolation", () => {
    let b;

    beforeEach(async () => {
      b = await seedBilledStudent(adminB, BRANCH_B);
    });

    it("a branch admin cannot see another branch's invoices, ledger or summary", async () => {
      expect((await api.get("/invoices")).body.data).toEqual([]);
      expect((await api.get(`/invoices/${b.invoiceId}`)).status).toBe(404);
      expect((await api.get(`/students/${b.studentId}/ledger`)).status).toBe(404);
      expect((await api.get(`/reports/summary?year=${YEAR}&month=${MONTH}`)).body.data.invoices).toBe(0);
    });

    it("a branch admin cannot pay, void or read receipts of another branch", async () => {
      expect((await payToday(b.invoiceId, 10)).status).toBe(404);
      const { body } = await payToday(b.invoiceId, 10, adminB);
      const paymentId = body.data.payment.id;

      expect((await api.get(`/payments/${paymentId}`)).status).toBe(404);
      expect((await api.post(`/payments/${paymentId}/void`, { reason: "x" })).status).toBe(404);
      expect(await count("FeePayments", "voided_at IS NULL")).toBe(1);
    });

    it("a branch admin cannot change another branch's setup or discount its students", async () => {
      const [[structure]] = await db.query("SELECT id FROM FeeStructures WHERE branch_id = ?", [BRANCH_B]);

      expect((await api.put(`/structures/${structure.id}`, { monthly_tuition: 1 })).status).toBe(404);
      expect((await api.delete(`/structures/${structure.id}`)).status).toBe(404);
      expect((await api.post("/discounts", { student_id: b.studentId, kind: "percent", value: 100 })).status).toBe(404);
      expect((await api.get("/settings", adminB)).body.data.late_fine).toBe(50);
    });

    it("a branch admin generating invoices bills only their own branch", async () => {
      await seedStudent({ branchId: BRANCH_A });
      await api.post("/structures", { class_name: "Class 5", academic_year: YEAR, monthly_tuition: 700 }).expect(201);

      await api.post("/invoices/generate", { year: YEAR, month: MONTH }).expect(200);

      expect(await count("FeeInvoices", "branch_id = ?", [BRANCH_A])).toBe(1);
      expect(await count("FeeInvoices", "branch_id = ?", [BRANCH_B])).toBe(1);
    });

    it("a super admin can read every branch, or one branch with ?branch_id", async () => {
      const superAdmin = bearer(superAdminToken());
      await seedBilledStudent(adminA, BRANCH_A);

      expect((await api.get("/invoices", superAdmin)).body.data).toHaveLength(2);
      expect((await api.get(`/invoices?branch_id=${BRANCH_B}`, superAdmin)).body.data).toHaveLength(1);
    });
  });
});
