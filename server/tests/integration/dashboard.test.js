import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, db, insert, resetDb, seedStudent, superAdminToken } from "./helpers.js";

const adminA = bearer(branchAdminToken(BRANCH_A));
const adminB = bearer(branchAdminToken(BRANCH_B));

// The dashboard works on "today" in the school's time zone.
const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());
const [YEAR, MONTH] = TODAY.split("-").map(Number);
const daysFromToday = (days) => {
  const date = new Date(`${TODAY}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const fees = (path, body, auth) => request(app).post(`/api/fees${path}`).set(auth).send(body);

// Two students in branch A billed 1000 each this month, one paid 400, attendance
// recorded for both today; a billed and paid student in branch B; some events.
async function seedSchool() {
  const rahim = await seedStudent({ branchId: BRANCH_A, roll: "1", firstName: "Rahim" });
  const karim = await seedStudent({ branchId: BRANCH_A, roll: "2", firstName: "Karim" });
  const other = await seedStudent({ branchId: BRANCH_B, roll: "1", firstName: "Nadia" });
  await insert("Teachers", { FirstName: "Nasima", LastName: "A", branch_id: BRANCH_A });

  for (const [student, status, branchId] of [[rahim, "Present", BRANCH_A], [karim, "Absent", BRANCH_A], [other, "Present", BRANCH_B]]) {
    await insert("Attendance", {
      StudentID: student.studentId, ClassID: student.classId, ClassDate: TODAY, Status: status, branch_id: branchId,
    });
  }

  for (const auth of [adminA, adminB]) {
    await request(app).put("/api/fees/settings").set(auth).send({ due_day: 28, late_fine: 0, receipt_prefix: "RC" }).expect(200);
    await fees("/structures", { class_name: "Class 5", academic_year: YEAR, monthly_tuition: 1000 }, auth).expect(201);
    await fees("/invoices/generate", { year: YEAR, month: MONTH }, auth).expect(200);
  }
  const pay = async (studentId, amount, auth) => {
    const { body } = await request(app).get(`/api/fees/invoices?student_id=${studentId}`).set(auth);
    await fees(`/invoices/${body.data[0].id}/payments`, { amount, method: "cash", paid_on: TODAY }, auth).expect(201);
  };
  await pay(rahim.studentId, 400, adminA);
  await pay(other.studentId, 1000, adminB);

  const event = (EventName, StartDate, branch_id = null) =>
    insert("Events", { EventName, EventType: "Other", StartDate, EndDate: StartDate, branch_id });
  await event("Sports Day (all branches)", daysFromToday(3));
  await event("Main campus fair", daysFromToday(1), BRANCH_A);
  await event("North campus fair", daysFromToday(1), BRANCH_B);
  await event("Last year's prize giving", daysFromToday(-30), BRANCH_A);
}

describe("GET /api/dashboard/summary", () => {
  beforeEach(async () => {
    await resetDb();
    await seedSchool();
  });
  afterAll(() => db.end());

  it("requires an admin login", async () => {
    expect((await request(app).get("/api/dashboard/summary")).status).toBe(401);
  });

  it("summarises only the branch admin's own branch", async () => {
    const res = await request(app).get("/api/dashboard/summary").set(adminA);

    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.date).toBe(TODAY);
    expect(data.counts).toEqual({ students: 2, teachers: 1, classes: 1 });
    expect(data.attendance).toMatchObject({ present: 1, absent: 1, recorded: 2, rate: 50 });
    expect(data.fees).toMatchObject({ year: YEAR, month: MONTH, billed: 2000, collected: 400, outstanding: 1600, collection_rate: 20 });
    expect(data.recent_payments).toHaveLength(1);
    expect(data.recent_payments[0]).toMatchObject({ amount: 400, student_name: "Rahim Uddin", method: "cash" });
    expect(data.upcoming_events.map((e) => e.EventName)).toEqual(["Main campus fair", "Sports Day (all branches)"]);
  });

  it("adds up every branch for a super admin", async () => {
    const res = await request(app).get("/api/dashboard/summary").set(bearer(superAdminToken()));

    expect(res.status).toBe(200);
    expect(res.body.data.counts.students).toBe(3);
    expect(res.body.data.fees).toMatchObject({ billed: 3000, collected: 1400 });
    expect(res.body.data.recent_payments).toHaveLength(2);
  });

  it("lets a super admin look at one branch", async () => {
    const res = await request(app).get(`/api/dashboard/summary?branch_id=${BRANCH_B}`).set(bearer(superAdminToken()));

    expect(res.body.data.counts.students).toBe(1);
    expect(res.body.data.fees).toMatchObject({ billed: 1000, collected: 1000, collection_rate: 100 });
  });

  it("leaves voided payments out of recent payments", async () => {
    const [[payment]] = await db.query("SELECT id FROM FeePayments WHERE branch_id = ?", [BRANCH_A]);
    await fees(`/payments/${payment.id}/void`, { reason: "Entered twice" }, adminA).expect(200);

    const res = await request(app).get("/api/dashboard/summary").set(adminA);

    expect(res.body.data.recent_payments).toEqual([]);
    expect(res.body.data.fees.collected).toBe(0);
  });
});
