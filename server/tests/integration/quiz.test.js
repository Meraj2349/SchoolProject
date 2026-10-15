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
  quizStudentToken,
  resetDb,
  seedStudent,
  superAdminToken,
} from "./helpers.js";

afterAll(() => db.end());

const addQuestion = (classKey, subject, answer = "A", extra = {}) =>
  insert("QuizQuestions", {
    ClassKey: classKey,
    Subject: subject,
    Prompt: `${subject} for class ${classKey}`,
    OptionsJSON: JSON.stringify({ A: "1", B: "2", C: "3", D: "4" }),
    PromptBn: `শ্রেণি ${classKey} এর প্রশ্ন`,
    OptionsBnJSON: JSON.stringify({ A: "১", B: "২", C: "৩", D: "৪" }),
    CorrectAnswer: answer,
    ...extra,
  });

const identity = {
  branchId: BRANCH_A,
  firstName: "Rahim",
  lastName: "Uddin",
  className: "Class 8",
  section: "Good",
  rollNumber: "1",
};

describe("taking a quiz", () => {
  let token;
  let ids;

  beforeEach(async () => {
    await resetDb();
    const { studentId } = await seedStudent({ className: "Class 8", firstName: "Rahim" });
    token = bearer(quizStudentToken(studentId, BRANCH_A));
    ids = {
      math8: await addQuestion("8", "Math", "B"),
      science8: await addQuestion("8", "Science", "C"),
      math10: await addQuestion("10", "Math", "A"),
      hidden8: await addQuestion("8", "Math", "A", { Active: false }),
    };
  });

  it("verifies the student and gives a quiz token with their class", async () => {
    const res = await request(app).post("/api/quiz/verify").send(identity);

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.student).toMatchObject({ firstName: "Rahim", className: "Class 8", classKey: "8", branchId: BRANCH_A });
  });

  it("refuses unknown students with a clear message", async () => {
    const res = await request(app).post("/api/quiz/verify").send({ ...identity, rollNumber: "99" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: expect.any(String) });
  });

  it("lists only the subjects of the student's own class", async () => {
    const res = await request(app).get("/api/quiz/meta").set(token);

    expect(res.body.data).toEqual({
      className: "Class 8",
      classKey: "8",
      subjects: [
        { subject: "Math", count: 1 },
        { subject: "Science", count: 1 },
      ],
      total: 2,
    });
  });

  it("needs a quiz token to see subjects or start", async () => {
    expect((await request(app).get("/api/quiz/meta")).status).toBe(401);
    expect((await request(app).post("/api/quiz/start").send({})).status).toBe(401);
  });

  it("serves only the student's class, in both languages, without answers", async () => {
    const res = await request(app).post("/api/quiz/start").set(token).send({ count: 10 });

    expect(res.status).toBe(200);
    const served = res.body.data.questions;
    expect(served.map((q) => q.id).sort()).toEqual([ids.math8, ids.science8].sort());
    expect(served[0]).toMatchObject({ classKey: "8", promptBn: "শ্রেণি 8 এর প্রশ্ন", optionsBn: { B: "২" } });
    expect(JSON.stringify(served)).not.toMatch(/answer/i);
  });

  it("explains when the class has no questions", async () => {
    const { studentId } = await seedStudent({ className: "Class 6", roll: "2", firstName: "Nadia" });

    const res = await request(app)
      .post("/api/quiz/start")
      .set(bearer(quizStudentToken(studentId, BRANCH_A)))
      .set("Accept-Language", "en")
      .send({});

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("There are no quiz questions for your class yet.");
  });

  it("scores only own-class, visible questions and saves the session", async () => {
    const res = await request(app)
      .post("/api/quiz/finish")
      .set(token)
      .send({
        answers: [
          { questionId: ids.math8, userAnswer: "B" },
          { questionId: ids.math10, userAnswer: "A" },
          { questionId: ids.hidden8, userAnswer: "A" },
          { questionId: ids.math8, userAnswer: "B" },
          { questionId: 99999, userAnswer: "A" },
        ],
        timeTakenSeconds: 40,
        studentName: "Top Scorer",
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ totalQuestions: 1, correctAnswers: 1, scorePercentage: 100, grade: "A" });
    const [[session]] = await db.query("SELECT * FROM QuizSessions");
    expect(session).toMatchObject({
      StudentName: "Rahim Uddin",
      ClassName: "Class 8",
      Grade: "8",
      Subject: "Math",
      TimeTakenSeconds: 40,
      branch_id: BRANCH_A,
    });
    expect(new Date(session.CompletedAt) - new Date(session.StartedAt)).toBe(40000);
    expect(await count("QuizAttempts")).toBe(1);
  });

  it("rejects a submission with no answers to real questions of the class", async () => {
    const res = await request(app)
      .post("/api/quiz/finish")
      .set(token)
      .send({ answers: [{ questionId: ids.math10, userAnswer: "A" }] });

    expect(res.status).toBe(400);
    expect(await count("QuizSessions")).toBe(0);
  });

  it("shows the student their own history and progress", async () => {
    await request(app).post("/api/quiz/finish").set(token).send({ answers: [{ questionId: ids.math8, userAnswer: "B" }] });
    await request(app).post("/api/quiz/finish").set(token).send({ answers: [{ questionId: ids.science8, userAnswer: "A" }] });

    const sessions = await request(app).get("/api/quiz/my-sessions").set(token);
    const progress = await request(app).get("/api/quiz/my-progress").set(token);

    expect(sessions.body.data).toHaveLength(2);
    expect(progress.body.data.totals).toMatchObject({ sessions: 2, avgScore: 50 });
    expect(progress.body.data.bySubject.map((s) => s.subject).sort()).toEqual(["Math", "Science"]);
  });
});

describe("question bank (admin)", () => {
  const asAdmin = (req) => req.set(bearer(branchAdminToken(BRANCH_A)));
  const newQuestion = {
    classKey: "Class 6",
    subject: "Math",
    prompt: "What is \\frac{1}{2} of 10?",
    options: { A: "2", B: "5", C: "10", D: "20" },
    promptBn: "১০ এর অর্ধেক কত?",
    optionsBn: { A: "২", B: "৫", C: "১০", D: "২০" },
    answer: "B",
  };

  beforeEach(resetDb);

  it("needs an admin login", async () => {
    expect((await request(app).get("/api/quiz/admin/questions?classKey=6")).status).toBe(401);
    expect((await request(app).post("/api/quiz/admin/questions").send(newQuestion)).status).toBe(401);
    const { studentId } = await seedStudent();
    const asStudent = bearer(quizStudentToken(studentId, BRANCH_A));
    expect((await request(app).post("/api/quiz/admin/questions").set(asStudent).send(newQuestion)).status).toBe(401);
  });

  it("adds, edits, hides and lists questions, which students then get or not", async () => {
    const created = await asAdmin(request(app).post("/api/quiz/admin/questions")).send(newQuestion);
    expect(created.status).toBe(201);
    const id = created.body.data.id;
    expect(created.body.data).toMatchObject({ classKey: "6", prompt: newQuestion.prompt, optionsBn: newQuestion.optionsBn, active: true });
    const [[row]] = await db.query("SELECT CreatedBy FROM QuizQuestions WHERE QuestionID = ?", [id]);
    expect(row.CreatedBy).toBe(9002);

    const edited = await asAdmin(request(app).put(`/api/quiz/admin/questions/${id}`)).send({ answer: "c" });
    expect(edited.body.data).toMatchObject({ answer: "C", promptBn: newQuestion.promptBn });

    const list = await asAdmin(request(app).get("/api/quiz/admin/questions?classKey=6"));
    expect(list.body.data).toMatchObject({ total: 1, page: 1, items: [{ id, subject: "Math" }] });

    const { studentId } = await seedStudent({ className: "Class 6" });
    const student = bearer(quizStudentToken(studentId, BRANCH_A));
    expect((await request(app).post("/api/quiz/start").set(student).send({})).body.data.questions).toHaveLength(1);

    const hidden = await asAdmin(request(app).patch(`/api/quiz/admin/questions/${id}/active`)).send({ active: false });
    expect(hidden.body.data.active).toBe(false);
    expect((await request(app).post("/api/quiz/start").set(student).send({})).status).toBe(404);
    expect((await asAdmin(request(app).get("/api/quiz/admin/questions?classKey=6"))).body.data.total).toBe(0);
    expect((await asAdmin(request(app).get("/api/quiz/admin/questions?classKey=6&status=hidden"))).body.data.total).toBe(1);
  });

  it("searches English and Bangla text and counts subjects per class", async () => {
    await asAdmin(request(app).post("/api/quiz/admin/questions")).send(newQuestion);
    await asAdmin(request(app).post("/api/quiz/admin/questions")).send({ ...newQuestion, subject: "Science", prompt: "Plants need?", promptBn: "উদ্ভিদের কী দরকার?" });

    const english = await asAdmin(request(app).get("/api/quiz/admin/questions?classKey=6&search=plants"));
    const bangla = await asAdmin(request(app).get(`/api/quiz/admin/questions?classKey=6&search=${encodeURIComponent("অর্ধেক")}`));
    const percent = await asAdmin(request(app).get("/api/quiz/admin/questions?classKey=6&search=%25"));
    const subjects = await asAdmin(request(app).get("/api/quiz/admin/questions/subjects?classKey=6"));

    expect(english.body.data.items.map((q) => q.subject)).toEqual(["Science"]);
    expect(bangla.body.data.items.map((q) => q.subject)).toEqual(["Math"]);
    expect(percent.body.data.total).toBe(0);
    expect(subjects.body.data).toEqual([
      { subject: "Math", count: 1 },
      { subject: "Science", count: 1 },
    ]);
  });

  it("rejects invalid questions with a translated message", async () => {
    const res = await asAdmin(request(app).post("/api/quiz/admin/questions")).send({ ...newQuestion, answer: "E" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: expect.any(String) });
    expect(await count("QuizQuestions")).toBe(0);
  });

  it("answers 404 for an unknown question and falls back to sensible paging", async () => {
    expect((await asAdmin(request(app).put("/api/quiz/admin/questions/999")).send({ answer: "A" })).status).toBe(404);
    expect((await asAdmin(request(app).get("/api/quiz/admin/questions?classKey=6&page=abc&pageSize=-1"))).status).toBe(200);
  });
});

describe("quiz results (admin)", () => {
  beforeEach(async () => {
    await resetDb();
    const q = await addQuestion("8", "Math", "B");
    const a = await seedStudent({ branchId: BRANCH_A, className: "Class 8", firstName: "Rahim" });
    const b = await seedStudent({ branchId: BRANCH_B, className: "Class 8", firstName: "Nadia" });
    const finish = (studentId, branchId, userAnswer) =>
      request(app)
        .post("/api/quiz/finish")
        .set(bearer(quizStudentToken(studentId, branchId)))
        .send({ answers: [{ questionId: q, userAnswer }] });
    await finish(a.studentId, BRANCH_A, "B");
    await finish(b.studentId, BRANCH_B, "A");
  });

  it("shows a branch admin only their branch's sessions", async () => {
    const res = await request(app).get("/api/quiz/admin/sessions").set(bearer(branchAdminToken(BRANCH_A)));

    expect(res.body.data).toMatchObject({ total: 1, items: [{ StudentName: "Rahim Uddin" }] });
  });

  it("shows a super admin every branch, or one with ?branch_id", async () => {
    const all = await request(app).get("/api/quiz/admin/sessions").set(bearer(superAdminToken()));
    const north = await request(app).get(`/api/quiz/admin/sessions?branch_id=${BRANCH_B}`).set(bearer(superAdminToken()));

    expect(all.body.data.total).toBe(2);
    expect(north.body.data.items.map((s) => s.StudentName)).toEqual(["Nadia Uddin"]);
  });

  it("filters by class and ranks the leaderboard by average score", async () => {
    const other = await request(app).get("/api/quiz/admin/sessions?classKey=10").set(bearer(superAdminToken()));
    const board = await request(app).get("/api/quiz/admin/leaderboard?classKey=8").set(bearer(superAdminToken()));

    expect(other.body.data.total).toBe(0);
    expect(board.body.data.map((r) => [r.StudentName, Number(r.avgScore)])).toEqual([
      ["Rahim Uddin", 100],
      ["Nadia Uddin", 0],
    ]);
  });
});
