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
  insert,
  resetDb,
  seedStudent,
  superAdminToken,
} from "./helpers.js";

// Each sub school (branch) owns its rows. A branch admin works only in their
// branch; the super admin works in any branch but must pick one before
// creating branch-owned rows (otherwise rows would land in the wrong branch).

afterAll(() => db.end());

const adminA = bearer(branchAdminToken(BRANCH_A));
const adminB = bearer(branchAdminToken(BRANCH_B));
const superAll = bearer(superAdminToken()); // "All branches"
const asSuper = (req, branchId) => req.set(superAll).query({ branch_id: branchId });

// Rows a create request must produce, for a branch with a "Class 5 / Good" class.
const creates = (ctx) => [
  {
    name: "student",
    table: "Students",
    send: (r) =>
      r.post("/api/students").send({
        FirstName: "Nadia", LastName: "Akter", DateOfBirth: "2015-02-02", Gender: "Female",
        ClassName: "Class 5", Section: "Good", RollNumber: "9",
      }),
  },
  {
    name: "teacher",
    table: "Teachers",
    send: (r) =>
      r.post("/api/teachers/addTeacher").send({
        FirstName: "Karim", LastName: "Mia", Subject: "Math", ContactNumber: "01700000000",
        Email: "karim@school.test", JoiningDate: "2024-01-01", Address: "Tangail",
      }),
  },
  {
    name: "subject",
    table: "Subjects",
    send: (r) => r.post("/api/subjects/add").send({ subjectName: "Science", classId: ctx.classId }),
  },
  {
    name: "attendance",
    table: "Attendance",
    send: (r) =>
      r.post("/api/attendance").send({ studentID: ctx.studentId, classID: ctx.classId, classDate: "2026-02-01", status: "Present" }),
  },
  {
    name: "exam",
    table: "Exams",
    send: (r) =>
      r.post("/api/exams/by-class").send({
        examType: "Monthly", examName: "Monthly 2", className: "Class 5", sectionName: "Good", examDate: "2030-02-01",
      }),
  },
  {
    name: "result",
    table: "Results",
    send: (r) =>
      r.post("/api/results").send({
        StudentID: ctx.studentId, ExamID: ctx.examId, SubjectID: ctx.subjectId, ClassID: ctx.classId, MarksObtained: 75,
      }),
  },
];

// A class with a student, an exam and a subject in `branchId`.
async function seedBranch(branchId, firstName) {
  const { classId, studentId } = await seedStudent({ branchId, firstName });
  const examId = await insert("Exams", {
    ExamType: "Monthly", ExamName: "Monthly 1", ClassID: classId, ExamDate: "2030-01-01", branch_id: branchId,
  });
  const subjectId = await insert("Subjects", { SubjectName: "Math", ClassID: classId, branch_id: branchId });
  return { classId, studentId, examId, subjectId };
}

describe("branch ownership of new rows", () => {
  let a;
  let b;

  beforeEach(async () => {
    await resetDb();
    a = await seedBranch(BRANCH_A, "Rahim");
    b = await seedBranch(BRANCH_B, "Sabbir");
  });

  describe.each(["student", "teacher", "subject", "attendance", "exam", "result"])("%s", (name) => {
    const pick = (ctx) => creates(ctx).find((c) => c.name === name);

    it("is created in the branch of the branch admin who adds it", async () => {
      const create = pick(b);
      const before = await count(create.table, "branch_id = ?", [BRANCH_B]);

      const res = await create.send(request(app)).set(adminB);

      expect(res.status).toBeLessThan(300);
      expect(await count(create.table, "branch_id = ?", [BRANCH_B])).toBe(before + 1);
    });

    it("is created in the branch a super admin has chosen", async () => {
      const create = pick(b);
      const before = await count(create.table, "branch_id = ?", [BRANCH_B]);

      const res = await asSuper(create.send(request(app)), BRANCH_B);

      expect(res.status).toBeLessThan(300);
      expect(await count(create.table, "branch_id = ?", [BRANCH_B])).toBe(before + 1);
    });

    it("needs a chosen branch when a super admin is on All branches", async () => {
      const create = pick(b);
      const before = await count(create.table);

      const res = await create.send(request(app)).set(superAll).set("Accept-Language", "en");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, message: "Choose a branch first." });
      expect(await count(create.table)).toBe(before);
    });
  });

  it("a branch admin cannot record attendance for another branch's student", async () => {
    const one = await request(app)
      .post("/api/attendance")
      .set(adminA)
      .send({ studentID: b.studentId, classID: b.classId, classDate: "2026-02-01", status: "Present" });
    const bulk = await request(app)
      .post("/api/attendance/bulk")
      .set(adminA)
      .send({ attendanceRecords: [{ studentID: b.studentId, classID: b.classId, classDate: "2026-02-02", status: "Absent" }] });

    // Another branch's student, even when filed under the admin's own class.
    const ownClass = await request(app)
      .post("/api/attendance")
      .set(adminA)
      .send({ studentID: b.studentId, classID: a.classId, classDate: "2026-02-03", status: "Present" });

    expect(one.status).toBeGreaterThanOrEqual(400);
    expect(bulk.status).toBeGreaterThanOrEqual(400);
    expect(ownClass.status).toBe(400);
    expect(await count("Attendance", "StudentID = ?", [b.studentId])).toBe(0);
  });

  it("a branch admin cannot add a subject to another branch's class", async () => {
    const res = await request(app).post("/api/subjects/add").set(adminA).send({ subjectName: "Art", classId: b.classId });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(await count("Subjects", "SubjectName = 'Art'")).toBe(0);
  });

  it("a branch admin cannot give their class another branch's teacher", async () => {
    const teacherB = await insert("Teachers", { FirstName: "T", LastName: "B", Subject: "Math", branch_id: BRANCH_B });

    const res = await request(app)
      .put(`/api/classes/edit/${a.classId}`)
      .set(adminA)
      .send({ className: "Class 5", section: "Good", teacherId: teacherB });

    expect(res.status).toBeGreaterThanOrEqual(400);
    const [[row]] = await db.query("SELECT TeacherID FROM Classes WHERE ClassID = ?", [a.classId]);
    expect(row.TeacherID).toBeNull();
  });
});

describe("reads stay inside the branch", () => {
  beforeEach(resetDb);

  it("a branch admin sees their own and school-wide events, not another branch's", async () => {
    await insert("Events", { EventName: "A sports day", EventType: "Sports", StartDate: "2030-01-01", EndDate: "2030-01-01", branch_id: BRANCH_A });
    await insert("Events", { EventName: "B sports day", EventType: "Sports", StartDate: "2030-01-01", EndDate: "2030-01-01", branch_id: BRANCH_B });
    await insert("Events", { EventName: "Whole school day", EventType: "Sports", StartDate: "2030-01-01", EndDate: "2030-01-01", branch_id: null });

    const res = await request(app).get("/api/events").set(adminA);

    const titles = JSON.stringify(res.body);
    expect(titles).toContain("A sports day");
    expect(titles).toContain("Whole school day");
    expect(titles).not.toContain("B sports day");
  });

  it("a branch admin whose branch no longer exists is logged out, not shown every branch", async () => {
    const orphan = await insert("Admin", { Username: "o", Email: "o@x.test", Password: "x", role: "branch_admin", branch_id: null });

    const res = await request(app).get("/api/dashboard/summary").set(bearer(branchAdminToken(BRANCH_A, orphan)));

    expect(res.status).toBe(401);
  });
});
