import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, count, db, insert, resetDb, seedStudent } from "./helpers.js";

const adminA = bearer(branchAdminToken(BRANCH_A));

// Class 5 / Good with an exam and a subject.
async function seedClassWithExam({ className = "Class 5", section = "Good", roll = "1", firstName = "Rahim" } = {}) {
  const { classId, studentId } = await seedStudent({ className, section, roll, firstName });
  const examId = await insert("Exams", {
    ExamType: "Monthly", ExamName: "Monthly 1", ClassID: classId, ExamDate: "2030-01-01", branch_id: BRANCH_A,
  });
  const subjectId = await insert("Subjects", { SubjectName: "Math", ClassID: classId, branch_id: BRANCH_A });
  return { classId, studentId, examId, subjectId };
}

// A result of 90 for Karim in branch B.
async function seedNorthResult() {
  const { classId, studentId } = await seedStudent({ branchId: BRANCH_B, firstName: "Karim" });
  const examId = await insert("Exams", { ExamType: "Monthly", ExamName: "North monthly", ClassID: classId, ExamDate: "2030-01-01", branch_id: BRANCH_B });
  const subjectId = await insert("Subjects", { SubjectName: "Math", ClassID: classId, branch_id: BRANCH_B });
  const resultId = await insert("Results", { StudentID: studentId, ExamID: examId, SubjectID: subjectId, ClassID: classId, MarksObtained: 90, branch_id: BRANCH_B });
  return { resultId };
}

const resultFor = (s, marks) => ({
  StudentID: s.studentId, ExamID: s.examId, SubjectID: s.subjectId, ClassID: s.classId, MarksObtained: marks,
});

describe("results API", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  describe("adding results", () => {
    it("rejects marks above 100", async () => {
      const s = await seedClassWithExam();

      const res = await request(app).post("/api/results").set(adminA).send(resultFor(s, 150));

      expect(res.status).toBe(400);
      expect(await count("Results")).toBe(0);
    });

    it("rejects an exam that belongs to a different class", async () => {
      const s = await seedClassWithExam();
      const other = await seedClassWithExam({ section: "General", roll: "2" });

      const res = await request(app)
        .post("/api/results")
        .set(adminA)
        .send({ ...resultFor(s, 70), ExamID: other.examId });

      expect(res.status).toBe(400);
      expect(await count("Results")).toBe(0);
    });

    it("rejects a subject that belongs to a different class", async () => {
      const s = await seedClassWithExam();
      const other = await seedClassWithExam({ section: "General", roll: "2" });

      const res = await request(app)
        .post("/api/results")
        .set(adminA)
        .send({ ...resultFor(s, 70), SubjectID: other.subjectId });

      expect(res.status).toBe(400);
      expect(await count("Results")).toBe(0);
    });
  });

  describe("public search", () => {
    it("does not mix Class 1 with Class 10, or roll 1 with roll 10", async () => {
      const c1 = await seedClassWithExam({ className: "Class 1", roll: "1", firstName: "Asha" });
      const c10 = await seedClassWithExam({ className: "Class 10", roll: "1", firstName: "Bina" });
      const c1roll10 = await seedClassWithExam({ className: "Class 1", roll: "10", firstName: "Chandni" });
      for (const s of [c1, c10, c1roll10]) await insert("Results", { ...resultFor(s, 75), branch_id: BRANCH_A });

      const res = await request(app)
        .get("/api/results/search")
        .query({ className: "Class 1", section: "Good", rollNumber: "1" });

      expect(res.status).toBe(200);
      expect(res.body.data.map((r) => r.FirstName)).toEqual(["Asha"]);
    });

    it("narrows the search to an exam by name", async () => {
      const s1 = await seedClassWithExam();
      await insert("Results", { ...resultFor(s1, 75), branch_id: BRANCH_A });
      const halfYearly = await insert("Exams", { ExamType: "Half-Yearly", ExamName: "Half-yearly 2030", ClassID: s1.classId, ExamDate: "2030-06-01", branch_id: BRANCH_A });
      await insert("Results", { ...resultFor({ ...s1, examId: halfYearly }, 60), branch_id: BRANCH_A });

      const res = await request(app).get("/api/results/search").query({ firstName: "Rahim", rollNumber: "1", className: "Class 5", section: "Good", examName: "Half-yearly" });

      expect(res.body.data).toEqual([expect.objectContaining({ ExamName: "Half-yearly 2030", MarksObtained: 60, TotalMarks: 100, SubjectName: "Math" })]);
    });

    it("shows a branch admin only their branch's results", async () => {
      const own = await seedClassWithExam();
      const north = await seedNorthResult();
      await insert("Results", { ...resultFor(own, 75), branch_id: BRANCH_A });

      const res = await request(app).get("/api/results/search").set(adminA);

      expect(res.body.data.map((r) => r.FirstName)).toEqual(["Rahim"]);
      expect(north.resultId).toBeDefined();
    });
  });

  describe("adding: the reasons are translated", () => {
    it("refuses a second result for the same student, exam and subject", async () => {
      const s = await seedClassWithExam();
      await insert("Results", { ...resultFor(s, 75), branch_id: BRANCH_A });

      const res = await request(app).post("/api/results").set(adminA).set("Accept-Language", "en").send(resultFor(s, 80));

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ success: false, message: "A result for this student, subject, and exam already exists." });
      expect(await count("Results")).toBe(1);
    });

    it.each([
      ["marks above 100", 150, "Marks must be a whole number from 0 to 100."],
      ["marks with a fraction", 77.5, "Marks must be a whole number from 0 to 100."],
    ])("refuses %s", async (_label, marks, message) => {
      const s = await seedClassWithExam();

      const res = await request(app).post("/api/results").set(adminA).set("Accept-Language", "en").send(resultFor(s, marks));

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, message });
    });

    it("refuses an exam of another class, in Bangla", async () => {
      const s = await seedClassWithExam();
      const other = await seedClassWithExam({ section: "General", roll: "2" });

      const res = await request(app).post("/api/results").set(adminA).set("Accept-Language", "bn").send({ ...resultFor(s, 70), ExamID: other.examId });

      expect(res.body).toEqual({ success: false, message: "এই পরীক্ষাটি এই শিক্ষার্থীর শ্রেণির নয়।" });
    });

    it("answers 201 with the new result's id", async () => {
      const s = await seedClassWithExam();

      const res = await request(app).post("/api/results").set(adminA).send(resultFor(s, 0));

      expect(res.status).toBe(201);
      const [[row]] = await db.query("SELECT ResultID, MarksObtained, branch_id FROM Results");
      expect(res.body).toMatchObject({ success: true, data: { resultId: row.ResultID } });
      expect(row).toMatchObject({ MarksObtained: 0, branch_id: BRANCH_A });
    });
  });

  describe("changing and deleting", () => {
    it("changes the marks", async () => {
      const s = await seedClassWithExam();
      const resultId = await insert("Results", { ...resultFor(s, 75), branch_id: BRANCH_A });

      const res = await request(app).put(`/api/results/${resultId}`).set(adminA).send({ MarksObtained: 81 });

      expect(res.status).toBe(200);
      expect(await count("Results", "MarksObtained = 81")).toBe(1);
    });

    it("refuses marks above 100 when changing", async () => {
      const s = await seedClassWithExam();
      const resultId = await insert("Results", { ...resultFor(s, 75), branch_id: BRANCH_A });

      const res = await request(app).put(`/api/results/${resultId}`).set(adminA).send({ MarksObtained: 101 });

      expect(res.status).toBe(400);
      expect(await count("Results", "MarksObtained = 75")).toBe(1);
    });

    it.each([
      ["put", { MarksObtained: 10 }],
      ["delete", undefined],
    ])("does not %s another branch's result, or a missing one", async (method, body) => {
      const north = await seedNorthResult();

      const other = await request(app)[method](`/api/results/${north.resultId}`).set(adminA).send(body);
      const missing = await request(app)[method]("/api/results/99999").set(adminA).send(body);

      expect([other.status, missing.status]).toEqual([404, 404]);
      expect(await count("Results", "MarksObtained = 90")).toBe(1);
    });

    it("deletes a result", async () => {
      const s = await seedClassWithExam();
      const resultId = await insert("Results", { ...resultFor(s, 75), branch_id: BRANCH_A });

      const res = await request(app).delete(`/api/results/${resultId}`).set(adminA);

      expect(res.status).toBe(200);
      expect(await count("Results")).toBe(0);
    });
  });
});
