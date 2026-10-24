import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, bearer, branchAdminToken, count, db, insert, resetDb, seedStudent } from "./helpers.js";

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

    it("accepts a score of 0 when adding by student details", async () => {
      await seedClassWithExam();

      const res = await request(app).post("/api/results/add-by-details").set(adminA).send({
        rollNumber: "1", className: "Class 5", sectionName: "Good",
        examName: "Monthly 1", subjectName: "Math", marksObtained: 0,
      });

      expect(res.status).toBe(201);
      expect(await count("Results", `"MarksObtained" = 0`)).toBe(1);
    });

    it("reports success for a batch that was saved", async () => {
      const s = await seedClassWithExam();

      const res = await request(app).post("/api/results/batch").set(adminA).send({ results: [resultFor(s, 88)] });

      expect(res.status).toBe(201);
      expect(await count("Results")).toBe(1);
    });

    it.each([
      ["exam", "examId"],
      ["subject", "subjectId"],
    ])("refuses a batch row with another class's %s", async (_label, key) => {
      const s = await seedClassWithExam();
      const other = await seedClassWithExam({ section: "Better", roll: "2", firstName: "Karim" });

      const res = await request(app).post("/api/results/batch").set(adminA).send({ results: [resultFor({ ...s, [key]: other[key] }, 70)] });

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
  });

  it("filters the advanced search by section", async () => {
    const good = await seedClassWithExam({ section: "Good", roll: "1" });
    const general = await seedClassWithExam({ section: "General", roll: "2" });
    for (const s of [good, general]) await insert("Results", { ...resultFor(s, 75), branch_id: BRANCH_A });

    const res = await request(app)
      .get("/api/results/search/advanced")
      .set(adminA)
      .query({ sectionName: "General", limit: "10", offset: "0" });

    expect(res.status).toBe(200);
    expect(res.body.data.map((r) => r.Section)).toEqual(["General"]);
  });
});
