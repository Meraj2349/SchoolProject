import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { schoolToday } from "../../src/shared/schoolDate.js";
import {
  BRANCH_A,
  BRANCH_B,
  FIXTURE_ADMINS,
  bearer,
  branchAdminToken,
  db,
  insert,
  resetDb,
  seedStudent,
  superAdminToken,
} from "./helpers.js";

const adminA = bearer(branchAdminToken(BRANCH_A));
const superAdmin = bearer(superAdminToken());
const DAY = "2026-03-02";
const ZERO = { present: 0, absent: 0, late: 0, leave: 0 };

const overview = (auth, query = `date=${DAY}`) => request(app).get(`/api/attendance/overview?${query}`).set(auth);
const branchIds = (res) => res.body.data.branches.map((b) => b.id);

describe("attendance overview", () => {
  let emptyBranch;
  let teacherId;
  let class5;
  let kg;
  let mina;
  let northClass;

  beforeEach(async () => {
    await resetDb();
    emptyBranch = await insert("Branches", { name_en: "Dulla Branch", name_bn: "দুল্যা শাখা" });
    teacherId = await insert("Teachers", {
      FirstName: "Nasima", LastName: "Akter", branch_id: BRANCH_A, AppEnabled: 1, AppPhone: "01711000001", AppPasswordHash: "x",
    });
    const rahim = await seedStudent({ branchId: BRANCH_A, className: "Class 5", roll: "1", firstName: "Rahim" });
    const karim = await seedStudent({ branchId: BRANCH_A, className: "Class 5", roll: "2", firstName: "Karim" });
    class5 = rahim.classId;
    mina = await seedStudent({ branchId: BRANCH_A, className: "KG", roll: "1", firstName: "Mina" });
    kg = mina.classId;
    northClass = (await seedStudent({ branchId: BRANCH_B, className: "Class 5", roll: "1", firstName: "Nadia" })).classId;
    await db.query("UPDATE Classes SET TeacherID = ? WHERE ClassID = ?", [teacherId, class5]);

    const mark = (studentId, status, type, by, at, date = DAY) =>
      insert("Attendance", {
        StudentID: studentId, ClassID: class5, ClassDate: date, Status: status, branch_id: BRANCH_A,
        MarkedByType: type, MarkedBy: by, MarkedAt: new Date(at),
      });
    await mark(rahim.studentId, "Present", "teacher", teacherId, "2026-03-02T02:00:00Z");
    await mark(karim.studentId, "Late", "admin", FIXTURE_ADMINS[BRANCH_A], "2026-03-02T03:00:00Z");
    await mark(karim.studentId, "Absent", "admin", FIXTURE_ADMINS[BRANCH_A], "2026-03-01T03:00:00Z", "2026-03-01");
  });
  afterAll(() => db.end());

  it("shows a super admin every branch's classes, counts and who took each day last", async () => {
    const res = await overview(superAdmin);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.date).toBe(DAY);
    expect(branchIds(res)).toEqual([BRANCH_A, BRANCH_B, emptyBranch]);
    const [main, north, dulla] = res.body.data.branches;
    expect(main).toMatchObject({ id: BRANCH_A, nameBn: "প্রধান", nameEn: "Main" });
    expect(main.totals).toEqual({ classes: 2, taken: 1, notTaken: 1, students: 3, ...ZERO, present: 1, late: 1 });
    // Class names in school order: KG before Class 5.
    expect(main.classes).toEqual([
      { id: kg, name: "KG", section: "Good", students: 1, classTeacher: null, taken: false, takenBy: null, counts: ZERO },
      {
        id: class5,
        name: "Class 5",
        section: "Good",
        students: 2,
        classTeacher: { id: teacherId, name: "Nasima Akter", appAccess: true },
        taken: true,
        takenBy: { type: "admin", name: "fixture-a", at: expect.any(String) },
        counts: { ...ZERO, present: 1, late: 1 },
      },
    ]);
    expect(new Date(main.classes[1].takenBy.at).toISOString()).toBe("2026-03-02T03:00:00.000Z");
    expect(north.classes.map((c) => [c.id, c.takenBy, c.counts])).toEqual([[northClass, null, ZERO]]);
    expect(dulla).toEqual({
      id: emptyBranch,
      nameBn: "দুল্যা শাখা",
      nameEn: "Dulla Branch",
      totals: { classes: 0, taken: 0, notTaken: 0, students: 0, ...ZERO },
      classes: [],
    });
  });

  it("counts a day saved before anyone was recorded as taking it (older data) as taken", async () => {
    await insert("Attendance", { StudentID: mina.studentId, ClassID: kg, ClassDate: DAY, Status: "Present", branch_id: BRANCH_A });

    const res = await overview(adminA);

    const kgDay = res.body.data.branches[0].classes.find((c) => c.id === kg);
    expect(kgDay).toMatchObject({ taken: true, takenBy: null, counts: { ...ZERO, present: 1 } });
    expect(res.body.data.branches[0].totals).toMatchObject({ taken: 2, notTaken: 0 });
  });

  it("shows a super admin only the branch they picked", async () => {
    const res = await overview(superAdmin, `date=${DAY}&branch_id=${BRANCH_B}`);

    expect(branchIds(res)).toEqual([BRANCH_B]);
  });

  it("keeps a branch admin to their own branch, whatever branch they ask for", async () => {
    const res = await overview(adminA, `date=${DAY}&branch_id=${BRANCH_B}&branchId=${BRANCH_B}`);

    expect(res.status).toBe(200);
    expect(branchIds(res)).toEqual([BRANCH_A]);
  });

  it("reads today by default, refuses a date that is not a day, and needs an admin", async () => {
    const today = await overview(adminA, "");
    const bad = await overview(adminA, "date=2026-02-30");
    const visitor = await request(app).get(`/api/attendance/overview?date=${DAY}`);

    expect(today.body.data.date).toBe(schoolToday());
    expect(today.body.data.branches[0].totals.taken).toBe(0);
    expect(bad.status).toBe(400);
    expect(visitor.status).toBe(401);
  });
});
