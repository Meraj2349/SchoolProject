import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, bearer, count, db, insert, quizStudentToken, resetDb, seedStudent } from "./helpers.js";

const question = (correct) =>
  insert("QuizQuestions", {
    Prompt: "2 + 2 = ?",
    OptionsJSON: JSON.stringify({ A: "3", B: "4", C: "5", D: "6" }),
    CorrectAnswer: correct,
    Subject: "Math",
    Grade: "Class 5",
  });

describe("quiz scoring", () => {
  let token;
  let q1;
  let q2;

  beforeEach(async () => {
    await resetDb();
    const { studentId } = await seedStudent();
    token = bearer(quizStudentToken(studentId, BRANCH_A));
    q1 = await question("B");
    q2 = await question("C");
  });
  afterAll(() => db.end());

  const finish = (answers) => request(app).post("/api/quiz/finish").set(token).send({ answers });

  it("scores the submitted answers", async () => {
    const res = await finish([
      { questionId: q1, userAnswer: "B" },
      { questionId: q2, userAnswer: "A" },
    ]);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ totalQuestions: 2, correctAnswers: 1, scorePercentage: 50 });
  });

  it("does not count answers to questions that do not exist", async () => {
    const res = await finish([
      { questionId: q1, userAnswer: "B" },
      { questionId: 99999, userAnswer: "" },
    ]);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ totalQuestions: 1, correctAnswers: 1 });
  });

  it("counts each question only once", async () => {
    const res = await finish([
      { questionId: q1, userAnswer: "B" },
      { questionId: q1, userAnswer: "B" },
      { questionId: q1, userAnswer: "B" },
      { questionId: q2, userAnswer: "A" },
    ]);

    expect(res.body).toMatchObject({ totalQuestions: 2, correctAnswers: 1, scorePercentage: 50 });
  });

  it("saves the session under the verified student's name, not a name sent by the client", async () => {
    await request(app)
      .post("/api/quiz/finish")
      .set(token)
      .send({ answers: [{ questionId: q1, userAnswer: "B" }], studentName: "Top Scorer" })
      .expect(201);

    const [rows] = await db.query("SELECT StudentName FROM QuizSessions");
    expect(rows.map((r) => r.StudentName)).not.toContain("Top Scorer");
    expect(await count("QuizSessions", "StudentName = 'Rahim Uddin'")).toBeGreaterThan(0);
  });

  it("rejects a submission with no real questions", async () => {
    const res = await finish([{ questionId: 99999, userAnswer: "A" }]);

    expect(res.status).toBe(400);
    expect(await count("QuizSessions")).toBe(0);
  });
});
