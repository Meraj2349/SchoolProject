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

const adminA = bearer(branchAdminToken(BRANCH_A));

// A student in branch B with attendance, an exam, a subject and a result.
async function seedBranchBRecords() {
  const { classId, studentId } = await seedStudent({ branchId: BRANCH_B });
  const examId = await insert("Exams", {
    ExamType: "Monthly", ExamName: "Monthly 1", ClassID: classId, ExamDate: "2030-01-01", branch_id: BRANCH_B,
  });
  const subjectId = await insert("Subjects", { SubjectName: "Math", ClassID: classId, branch_id: BRANCH_B });
  const resultId = await insert("Results", {
    StudentID: studentId, ExamID: examId, SubjectID: subjectId, ClassID: classId, MarksObtained: 80, branch_id: BRANCH_B,
  });
  const attendanceId = await insert("Attendance", {
    StudentID: studentId, ClassID: classId, ClassDate: "2026-01-05", Status: "Present", branch_id: BRANCH_B,
  });
  const routineId = await insert("Routines", {
    RoutineTitle: "Term 1", ClassID: classId, RoutineDate: "2026-01-01", branch_id: BRANCH_B,
  });
  return { classId, studentId, examId, subjectId, resultId, attendanceId, routineId };
}

describe("a branch admin cannot touch another branch's data", () => {
  let b;

  beforeEach(async () => {
    await resetDb();
    b = await seedBranchBRecords();
  });
  afterAll(() => db.end());

  describe("students", () => {
    it("cannot delete another branch's student — and their attendance and results survive", async () => {
      const res = await request(app).delete(`/api/students/${b.studentId}`).set(adminA);

      expect(res.status).toBe(404);
      expect(await count("Students")).toBe(1);
      expect(await count("Attendance")).toBe(1);
      expect(await count("Results")).toBe(1);
    });

    it("cannot update another branch's student", async () => {
      const res = await request(app).put(`/api/students/${b.studentId}`).set(adminA).send({
        FirstName: "Changed", LastName: "X", DateOfBirth: "2015-01-01", Gender: "Male",
        ClassName: "Class 5", Section: "Good", RollNumber: "1",
      });

      expect(res.status).toBe(404);
      const row = await db.one(`SELECT "FirstName" FROM "Students" WHERE "StudentID" = ?`, [b.studentId]);
      expect(row.FirstName).toBe("Rahim");
    });
  });

  describe("results", () => {
    it("cannot delete another branch's result", async () => {
      const res = await request(app).delete(`/api/results/${b.resultId}`).set(adminA);

      expect(res.status).toBe(404);
      expect(await count("Results")).toBe(1);
    });

    it("cannot delete another branch's exam, or the results in it", async () => {
      const res = await request(app).delete(`/api/exams/${b.examId}`).set(adminA);

      expect(res.status).toBe(404);
      expect(await count("Results")).toBe(1);
    });
  });

  describe("attendance", () => {
    it("cannot change another branch's attendance record", async () => {
      const res = await request(app).put(`/api/attendance/${b.attendanceId}`).set(adminA).send({ status: "Absent" });

      expect(res.status).toBe(404);
      const row = await db.one(`SELECT "Status" FROM "Attendance" WHERE "AttendanceID" = ?`, [b.attendanceId]);
      expect(row.Status).toBe("Present");
    });

    it("cannot delete another branch's attendance record", async () => {
      const res = await request(app).delete(`/api/attendance/${b.attendanceId}`).set(adminA);

      expect(res.status).toBe(404);
      expect(await count("Attendance")).toBe(1);
    });

    it("records a super admin's attendance entry under the student's own branch", async () => {
      await request(app)
        .post("/api/attendance/cell")
        .set(bearer(superAdminToken()))
        .send({ studentId: b.studentId, classDate: "2026-01-06", status: "Absent" })
        .expect(200);

      expect(await count("Attendance", `"ClassDate" = '2026-01-06' AND branch_id = ?`, [BRANCH_B])).toBe(1);
    });
  });

  describe("routines", () => {
    it("cannot edit another branch's routine", async () => {
      const res = await request(app).put(`/api/routines/${b.routineId}`).set(adminA).send({ RoutineTitle: "Hacked" });

      expect(res.status).toBe(404);
      const row = await db.one(`SELECT "RoutineTitle" FROM "Routines" WHERE "RoutineID" = ?`, [b.routineId]);
      expect(row.RoutineTitle).toBe("Term 1");
    });

    it("cannot delete another branch's routine", async () => {
      const res = await request(app).delete(`/api/routines/${b.routineId}`).set(adminA);

      expect(res.status).toBe(404);
      expect(await count("Routines", `"IsActive" = TRUE`)).toBe(1);
    });
  });

  describe("teachers", () => {
    it("cannot edit another branch's teacher", async () => {
      const teacherId = await insert("Teachers", { FirstName: "Nasima", LastName: "B", branch_id: BRANCH_B });

      const res = await request(app)
        .put(`/api/teachers/updateTeacher/${teacherId}`)
        .set(adminA)
        .send({ FirstName: "Hacked" });

      expect(res.status).toBe(404);
    });

    it("cannot move a teacher to another branch or write arbitrary columns", async () => {
      const teacherId = await insert("Teachers", { FirstName: "Nasima", LastName: "A", branch_id: BRANCH_A });

      const res = await request(app)
        .put(`/api/teachers/updateTeacher/${teacherId}`)
        .set(adminA)
        .send({ FirstName: "Nasrin", branch_id: BRANCH_B, "TeacherID = 999, LastName": "x" });

      expect(res.status).toBe(200);
      const row = await db.one(`SELECT * FROM "Teachers" WHERE "TeacherID" = ?`, [teacherId]);
      expect(row).toMatchObject({ FirstName: "Nasrin", LastName: "A", branch_id: BRANCH_A });
    });
  });

  describe("events", () => {
    it("cannot edit or delete a school-wide event (only a super admin can)", async () => {
      const eventId = await insert("Events", {
        EventName: "Sports Day", EventType: "Sports", StartDate: "2026-02-01", EndDate: "2026-02-01",
      });

      const edit = await request(app).put(`/api/events/${eventId}`).set(adminA).send({ EventName: "Hacked" });
      const del = await request(app).delete(`/api/events/${eventId}`).set(adminA);

      expect(edit.status).toBe(404);
      expect(del.status).toBe(404);
      expect(await count("Events", `"EventName" = 'Sports Day'`)).toBe(1);
    });

    it("can still edit its own branch's event", async () => {
      const eventId = await insert("Events", {
        EventName: "Branch fair", EventType: "Other", StartDate: "2026-02-01", EndDate: "2026-02-01", branch_id: BRANCH_A,
      });

      const res = await request(app).put(`/api/events/${eventId}`).set(adminA).send({ EventName: "Science fair" });

      expect(res.status).toBe(200);
    });
  });
});
