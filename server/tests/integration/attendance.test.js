import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { addDays, schoolToday } from "../../src/shared/schoolDate.js";
import {
  BRANCH_A,
  BRANCH_B,
  FIXTURE_ADMINS,
  bearer,
  branchAdminToken,
  count,
  db,
  resetDb,
  seedStudent,
  superAdminToken,
} from "./helpers.js";

const adminA = bearer(branchAdminToken(BRANCH_A));
const superAdmin = bearer(superAdminToken());
const TODAY = schoolToday();

const saveDay = (classId, date, entries, auth = adminA) =>
  request(app).put(`/api/attendance/class/${classId}/date/${date}`).set(auth).send({ entries });

const roster = (classId, date, auth = adminA) =>
  request(app).get(`/api/attendance/roster?classId=${classId}&date=${date}`).set(auth);

describe("attendance", () => {
  let rahim;
  let karim;
  let nadia; // branch B

  beforeEach(async () => {
    await resetDb();
    rahim = await seedStudent({ branchId: BRANCH_A, roll: "1", firstName: "Rahim" });
    karim = await seedStudent({ branchId: BRANCH_A, roll: "2", firstName: "Karim" });
    nadia = await seedStudent({ branchId: BRANCH_B, roll: "1", firstName: "Nadia" });
  });
  afterAll(() => db.end());

  const day = (rahimStatus, karimStatus) => [
    { studentId: rahim.studentId, status: rahimStatus },
    { studentId: karim.studentId, status: karimStatus },
  ];

  it("saves a class's whole day in one request and shows who took it", async () => {
    const res = await saveDay(rahim.classId, TODAY, day("Present", "Leave"));

    expect(res.status).toBe(200);
    expect(res.body.data.students.map((s) => s.status)).toEqual(["Present", "Leave"]);
    const [rows] = await db.query("SELECT Status, MarkedByType, MarkedBy, branch_id FROM Attendance ORDER BY StudentID");
    expect(rows).toEqual([
      { Status: "Present", MarkedByType: "admin", MarkedBy: FIXTURE_ADMINS[BRANCH_A], branch_id: BRANCH_A },
      { Status: "Leave", MarkedByType: "admin", MarkedBy: FIXTURE_ADMINS[BRANCH_A], branch_id: BRANCH_A },
    ]);

    const read = await roster(rahim.classId, TODAY);
    expect(read.status).toBe(200);
    expect(read.body.data.takenBy).toMatchObject({ type: "admin", name: "fixture-a" });
    expect(read.body.data.students.map((s) => [s.firstName, s.status])).toEqual([["Rahim", "Present"], ["Karim", "Leave"]]);
  });

  it("keeps one row per student and day however often the day is saved, even at the same moment", async () => {
    await saveDay(rahim.classId, TODAY, day("Present", "Present")).expect(200);

    const both = await Promise.all([
      saveDay(rahim.classId, TODAY, day("Absent", "Present")),
      saveDay(rahim.classId, TODAY, day("Absent", "Present")),
      request(app).post("/api/attendance/cell").set(adminA).send({ studentId: karim.studentId, classDate: TODAY, status: "Late" }),
    ]);

    expect(both.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(await count("Attendance")).toBe(2);
    expect(await count("Attendance", "StudentID = ? AND Status = 'Absent'", [rahim.studentId])).toBe(1);
  });

  it("saves a day the old bulk way over a day that already exists", async () => {
    await saveDay(rahim.classId, "2026-02-02", day("Present", "Present")).expect(200);

    const res = await request(app)
      .post("/api/attendance/bulk")
      .set(adminA)
      .send({ attendanceRecords: [{ studentID: rahim.studentId, classID: rahim.classId, classDate: "2026-02-02", status: "Absent" }] });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ recordsCreated: 1 });
    expect(await count("Attendance", "Status = 'Absent'")).toBe(1);
    expect(await count("Attendance")).toBe(2);
  });

  it("refuses a day that leaves a student out, or a day still to come", async () => {
    const partial = await saveDay(rahim.classId, TODAY, [{ studentId: rahim.studentId, status: "Present" }]);
    const future = await saveDay(rahim.classId, addDays(TODAY, 1), day("Present", "Present"));

    expect(partial.status).toBe(400);
    expect(partial.body.data).toEqual({ missing: [karim.studentId] });
    expect(future.status).toBe(400);
    expect(await count("Attendance")).toBe(0);
  });

  it("hides another branch's class from a branch admin, but not from a super admin", async () => {
    const read = await roster(nadia.classId, TODAY);
    const write = await saveDay(nadia.classId, TODAY, [{ studentId: nadia.studentId, status: "Present" }]);

    expect(read.status).toBe(404);
    expect(write.status).toBe(404);
    expect(await count("Attendance")).toBe(0);

    await saveDay(nadia.classId, TODAY, [{ studentId: nadia.studentId, status: "Present" }], superAdmin).expect(200);
    expect(await count("Attendance", "branch_id = ?", [BRANCH_B])).toBe(1);
  });

  it("keeps the exists check and a class's day summary inside the branch", async () => {
    await saveDay(nadia.classId, "2026-02-02", [{ studentId: nadia.studentId, status: "Absent" }], superAdmin).expect(200);

    const exists = await request(app)
      .get(`/api/attendance/exists?studentID=${nadia.studentId}&classDate=2026-02-02`)
      .set(adminA);
    const summary = await request(app).get(`/api/attendance/summary/class/${nadia.classId}/date/2026-02-02`).set(adminA);

    expect(exists.body.data).toEqual({ exists: false });
    expect(summary.body.data).toEqual([]);
    const own = await request(app)
      .get(`/api/attendance/summary/class/${nadia.classId}/date/2026-02-02?branch_id=${BRANCH_B}`)
      .set(superAdmin);
    expect(own.body.data).toEqual([{ Status: "Absent", Count: 1 }]);
  });

  it("counts late and leave days in the statistics and the grid", async () => {
    await saveDay(rahim.classId, "2026-02-02", day("Late", "Leave")).expect(200);
    await saveDay(rahim.classId, "2026-02-03", day("Present", "Absent")).expect(200);

    const stats = await request(app).get("/api/attendance/statistics").set(adminA);
    const grid = await request(app)
      .get("/api/attendance/grid?className=Class 5&section=Good&startDate=2026-02-01&endDate=2026-02-28")
      .set(adminA);

    expect(stats.body.data).toEqual({
      TotalRecords: 4, TotalPresent: 1, TotalAbsent: 1, TotalLate: 1, TotalLeave: 1, OverallAttendancePercentage: 66.67,
    });
    expect(grid.body.data.dates).toEqual(["2026-02-02", "2026-02-03"]);
    expect(grid.body.data.students[1].attendance).toEqual({ "2026-02-02": "Leave", "2026-02-03": "Absent" });
  });

  it("shows Leave to a parent looking a student up", async () => {
    await saveDay(rahim.classId, "2026-02-02", day("Leave", "Present")).expect(200);

    const res = await request(app).get(`/api/attendance/search/name/Rahim/roll/1/class/Class 5/section/Good?branch_id=${BRANCH_A}`);

    expect(res.status).toBe(200);
    expect(res.body.data.map((r) => r.Status)).toEqual(["Leave"]);
  });

  it("changes and deletes a record of the admin's branch", async () => {
    await saveDay(rahim.classId, "2026-02-02", day("Present", "Present")).expect(200);
    const [[record]] = await db.query("SELECT AttendanceID FROM Attendance WHERE StudentID = ?", [rahim.studentId]);

    await request(app).put(`/api/attendance/${record.AttendanceID}`).set(adminA).send({ status: "Leave" }).expect(200);
    expect(await count("Attendance", "Status = 'Leave'")).toBe(1);

    await request(app).delete(`/api/attendance/${record.AttendanceID}`).set(adminA).expect(200);
    expect(await count("Attendance")).toBe(1);
  });
});
