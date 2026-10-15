import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, count, db, insert, resetDb, seedStudent, superAdminToken } from "./helpers.js";

// The super admin creates sub schools (branches) and may delete one only when
// nothing belongs to it any more.

afterAll(() => db.end());

const asSuper = (req) => req.set(bearer(superAdminToken())).set("Accept-Language", "en");

describe("creating and deleting branches", () => {
  beforeEach(resetDb);

  it("lets only a super admin create a branch", async () => {
    const asBranchAdmin = await request(app).post("/api/branches").set(bearer(branchAdminToken(BRANCH_A))).send({ name_en: "South" });
    const created = await asSuper(request(app).post("/api/branches")).send({ name_en: "South", name_bn: "দক্ষিণ" });

    expect(asBranchAdmin.status).toBe(403);
    expect(created.status).toBe(201);
    expect(await count("Branches", "name_en = 'South'")).toBe(1);
  });

  it("refuses to delete a branch that still has students, admins, fees, applications or website content, and says what", async () => {
    const { studentId } = await seedStudent({ branchId: BRANCH_B });
    await insert("FeeInvoices", { branch_id: BRANCH_B, student_id: studentId, year: 2026, month: 10, class_name: "Class 5", due_date: "2026-10-10", status: "unpaid" });
    await insert("Applications", {
      applicant_name: "N", date_of_birth: "2016-01-01", gender: "male", applying_for_class: "Class 1",
      parent_name: "P", parent_contact: "0170", branch_id: BRANCH_B,
    });
    await insert("Notices", { Title: "T", Description: "D", branch_id: BRANCH_B });
    await insert("Images", { ImagePath: "https://cdn.test/x.png", PublicID: "p", ImageType: "event", branch_id: BRANCH_B });
    await insert("Notices", { Title: "Whole school", Description: "D", branch_id: null });

    const res = await asSuper(request(app).delete(`/api/branches/${BRANCH_B}`));

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message: expect.stringMatching(/still/i),
      data: { students: 1, teachers: 0, classes: 1, admins: 1, invoices: 1, payments: 0, applications: 1, websiteItems: 2 },
    });
    expect(await count("Branches", "id = ?", [BRANCH_B])).toBe(1);
  });

  it("refuses with 409 when only fee settings still point at the branch", async () => {
    const id = await insert("Branches", { name_en: "Set up", name_bn: "প্রস্তুত" });
    await insert("FeeSettings", { branch_id: id });

    const res = await asSuper(request(app).delete(`/api/branches/${id}`));

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(await count("Branches", "id = ?", [id])).toBe(1);
  });

  it("deletes an empty branch", async () => {
    const id = await insert("Branches", { name_en: "Empty", name_bn: "খালি" });

    const res = await asSuper(request(app).delete(`/api/branches/${id}`));

    expect(res.status).toBe(200);
    expect(await count("Branches", "id = ?", [id])).toBe(0);
  });
});

describe("branch overview with numbers", () => {
  beforeEach(async () => {
    await resetDb();
    const { studentId } = await seedStudent({ branchId: BRANCH_A });
    // This month in the school's time zone, as the server counts it.
    const [y, m] = new Intl.DateTimeFormat("en-CA", { timeZone: process.env.SCHOOL_TIME_ZONE || "Asia/Dhaka" })
      .format(new Date())
      .split("-")
      .map(Number);
    const today = { y, m };
    const invoice = await insert("FeeInvoices", {
      branch_id: BRANCH_A, student_id: studentId, year: today.y, month: today.m, class_name: "Class 5", due_date: "2030-01-10", status: "partial",
    });
    await insert("FeeInvoiceItems", { invoice_id: invoice, kind: "tuition", label: "Tuition", amount: 1500 });
    await insert("FeePayments", {
      branch_id: BRANCH_A, invoice_id: invoice, amount: 500, method: "cash", paid_on: "2026-10-01", receipt_no: "RCT-1", received_by: 9001,
    });
  });

  it("shows a super admin each branch's students, admins and this month's fees", async () => {
    const res = await asSuper(request(app).get("/api/branches/admin/overview"));

    expect(res.status).toBe(200);
    const main = res.body.data.find((b) => b.id === BRANCH_A);
    const north = res.body.data.find((b) => b.id === BRANCH_B);
    expect(main).toMatchObject({ studentCount: 1, adminCount: 1, feesBilled: 1500, feesCollected: 500 });
    expect(north).toMatchObject({ studentCount: 0, adminCount: 1, feesBilled: 0, feesCollected: 0 });
  });

  it("keeps fee numbers away from branch admins and the public", async () => {
    expect((await request(app).get("/api/branches/admin/overview").set(bearer(branchAdminToken(BRANCH_A)))).status).toBe(403);
    expect((await request(app).get("/api/branches/admin/overview")).status).toBe(401);
    const publicStats = await request(app).get("/api/branches/stats/overview");
    expect(JSON.stringify(publicStats.body)).not.toMatch(/fees/i);
  });
});
