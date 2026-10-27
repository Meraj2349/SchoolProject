import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, count, db, insert, resetDb, seedStudent, superAdminToken } from "./helpers.js";

// The exams API the admin Exams page and the public result page use.

const adminA = bearer(branchAdminToken(BRANCH_A));
const superAdmin = bearer(superAdminToken());

const newExam = (overrides = {}) => ({
  ExamType: "Monthly",
  ExamName: "October test",
  ClassName: "Class 5",
  SectionName: "Good",
  ExamDate: "2030-10-01",
  ...overrides,
});

async function seedExam({ branchId = BRANCH_A, name = "Annual 2025", date = "2025-11-20", firstName = "Rahim" } = {}) {
  const { classId, studentId } = await seedStudent({ branchId, firstName });
  const examId = await insert("Exams", { ExamType: "Annual", ExamName: name, ClassID: classId, ExamDate: date, branch_id: branchId });
  return { classId, studentId, examId };
}

// Dates come back as "YYYY-MM-DD" strings on both engines.
const examRow = (examId) => db.one(`SELECT "ExamName", "ClassID", "ExamDate" FROM "Exams" WHERE "ExamID" = ?`, [examId]);

describe("exams API", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  describe("listing", () => {
    it("lists the branch's exams with their class, newest first", async () => {
      const older = await seedExam({ name: "Monthly 1", date: "2026-01-10" });
      await insert("Exams", { ExamType: "Annual", ExamName: "Annual 2026", ClassID: older.classId, ExamDate: "2026-12-01", branch_id: BRANCH_A });
      await seedExam({ branchId: BRANCH_B, name: "North exam", firstName: "Karim" });

      const res = await request(app).get("/api/exams").set(adminA);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.map((exam) => exam.ExamName)).toEqual(["Annual 2026", "Monthly 1"]);
      expect(res.body.data[0]).toMatchObject({ ExamType: "Annual", ClassID: older.classId, ClassName: "Class 5", Section: "Good" });
    });

    it("gives the public result page every exam name once", async () => {
      await seedExam({ name: "Annual 2025" });
      await seedExam({ branchId: BRANCH_B, name: "Annual 2025", firstName: "Karim" });
      await seedExam({ branchId: BRANCH_B, name: "Half-yearly 2025", firstName: "Nadia" });

      const res = await request(app).get("/api/exams/public/names");

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(["Annual 2025", "Half-yearly 2025"]);
    });
  });

  describe("creating", () => {
    it("schedules an exam for a class and section of the branch", async () => {
      const { classId } = await seedStudent();

      const res = await request(app).post("/api/exams/by-class").set(adminA).send(newExam());

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ success: true, data: { ExamName: "October test", ClassID: classId } });
      expect(await count("Exams", `"ExamName" = 'October test' AND "ClassID" = ? AND branch_id = ?`, [classId, BRANCH_A])).toBe(1);
    });

    it.each([
      ["a past date", newExam({ ExamDate: "2020-01-01" }), "A new exam cannot be scheduled for a past date."],
      ["an unknown type", newExam({ ExamType: "Weekly" }), "Choose the exam type: Monthly, Quarterly, Half-Yearly, Annual or Final."],
      ["a date that is not a date", newExam({ ExamDate: "next week" }), "Enter the exam date as YYYY-MM-DD."],
      ["no name", newExam({ ExamName: "  " }), "Exam type, name, class, section and date are required."],
    ])("refuses %s with a translated reason", async (_label, body, message) => {
      await seedStudent();

      const res = await request(app).post("/api/exams/by-class").set(adminA).set("Accept-Language", "en").send(body);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, message });
      expect(await count("Exams")).toBe(0);
    });

    it("refuses a class the branch does not have", async () => {
      await seedStudent({ branchId: BRANCH_B });

      const res = await request(app).post("/api/exams/by-class").set(adminA).set("Accept-Language", "bn").send(newExam());

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, message: "এই শাখায় এই শ্রেণি ও সেকশন নেই।" });
    });
  });

  describe("changing", () => {
    it("renames an exam whose date has passed", async () => {
      const { examId } = await seedExam({ date: "2025-11-20" });

      const res = await request(app)
        .put(`/api/exams/${examId}`)
        .set(adminA)
        .send(newExam({ ExamType: "Annual", ExamName: "Annual exam 2025", ExamDate: "2025-11-20" }));

      expect(res.status).toBe(200);
      expect(await examRow(examId)).toMatchObject({ ExamName: "Annual exam 2025", ExamDate: "2025-11-20" });
    });

    it("keeps the exam in its own branch when a super admin on all branches edits it", async () => {
      await seedStudent({ branchId: BRANCH_A, firstName: "Karim" }); // the same class name and section in branch A
      const north = await seedExam({ branchId: BRANCH_B });

      const res = await request(app).put(`/api/exams/${north.examId}`).set(superAdmin).send(newExam({ ExamName: "Renamed" }));

      expect(res.status).toBe(200);
      expect(await examRow(north.examId)).toMatchObject({ ExamName: "Renamed", ClassID: north.classId });
    });

    it("does not change another branch's exam", async () => {
      const north = await seedExam({ branchId: BRANCH_B });

      const res = await request(app).put(`/api/exams/${north.examId}`).set(adminA).send(newExam({ ExamName: "Hacked" }));

      expect(res.status).toBe(404);
      expect((await examRow(north.examId)).ExamName).toBe("Annual 2025");
    });
  });

  describe("deleting", () => {
    it("deletes an exam with its results", async () => {
      const { examId, studentId, classId } = await seedExam();
      const subjectId = await insert("Subjects", { SubjectName: "Math", ClassID: classId, branch_id: BRANCH_A });
      await insert("Results", { StudentID: studentId, ExamID: examId, SubjectID: subjectId, ClassID: classId, MarksObtained: 70, branch_id: BRANCH_A });

      const res = await request(app).delete(`/api/exams/${examId}`).set(adminA);

      expect(res.status).toBe(200);
      expect(await count("Exams")).toBe(0);
      expect(await count("Results")).toBe(0);
    });

    it("does not delete another branch's exam or its results", async () => {
      const north = await seedExam({ branchId: BRANCH_B });
      const subjectId = await insert("Subjects", { SubjectName: "Math", ClassID: north.classId, branch_id: BRANCH_B });
      await insert("Results", { StudentID: north.studentId, ExamID: north.examId, SubjectID: subjectId, ClassID: north.classId, MarksObtained: 70, branch_id: BRANCH_B });

      const res = await request(app).delete(`/api/exams/${north.examId}`).set(adminA);

      expect(res.status).toBe(404);
      expect(await count("Exams")).toBe(1);
      expect(await count("Results")).toBe(1);
    });
  });
});
