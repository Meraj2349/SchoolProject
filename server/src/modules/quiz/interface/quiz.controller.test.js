import { describe, expect, it, jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeQuizController } from "./quiz.controller.js";

// A tiny app around the controller: real HTTP, no database or auth.
function buildApp({ play = {}, bank = {}, results = {} } = {}) {
  const c = makeQuizController({ play, bank, results });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.language = "en";
    req.quizStudentId = 7;
    req.adminId = 3;
    req.branchId = 2;
    next();
  });
  app.post("/verify", c.verify);
  app.get("/meta", c.meta);
  app.post("/start", c.start);
  app.post("/finish", c.finish);
  app.get("/my-sessions", c.mySessions);
  app.get("/my-progress", c.myProgress);
  app.get("/admin/questions", c.listQuestions);
  app.get("/admin/questions/subjects", c.subjects);
  app.get("/admin/questions/:id", c.getQuestion);
  app.post("/admin/questions", c.createQuestion);
  app.put("/admin/questions/:id", c.updateQuestion);
  app.patch("/admin/questions/:id/active", c.setActive);
  app.get("/admin/sessions", c.sessions);
  app.get("/admin/leaderboard", c.leaderboard);
  return app;
}

const fail = (error) => async () => {
  throw error;
};

describe("quiz controller — student", () => {
  it("POST /verify returns the token and student", async () => {
    const verifyStudent = jest.fn(async () => ({ token: "t", student: { studentId: 7 } }));

    const res = await request(buildApp({ play: { verifyStudent } })).post("/verify").send({ firstName: "Rahim" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { token: "t", student: { studentId: 7 } } });
    expect(verifyStudent).toHaveBeenCalledWith({ firstName: "Rahim" });
  });

  it("POST /verify answers 404 with a translated message when no student matches", async () => {
    const res = await request(buildApp({ play: { verifyStudent: fail(new NotFoundError("quiz_student_not_found")) } }))
      .post("/verify")
      .send({});

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "No student matches these details. Please check them." });
  });

  it("GET /meta is for the student in the quiz token", async () => {
    const metaFor = jest.fn(async () => ({ classKey: "8" }));

    const res = await request(buildApp({ play: { metaFor } })).get("/meta");

    expect(res.body).toEqual({ success: true, data: { classKey: "8" } });
    expect(metaFor).toHaveBeenCalledWith(7);
  });

  it("POST /start passes the subject and count", async () => {
    const startQuiz = jest.fn(async () => ({ questions: [] }));

    await request(buildApp({ play: { startQuiz } })).post("/start").send({ subject: "Math", count: 5 });

    expect(startQuiz).toHaveBeenCalledWith({ studentId: 7, subject: "Math", count: 5 });
  });

  it("POST /start explains an empty class", async () => {
    const res = await request(buildApp({ play: { startQuiz: fail(new NotFoundError("quiz_no_questions_for_class")) } })).post("/start");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("There are no quiz questions for your class yet.");
  });

  it("POST /finish answers 201 with the result", async () => {
    const finishQuiz = jest.fn(async () => ({ sessionId: 1 }));

    const res = await request(buildApp({ play: { finishQuiz } }))
      .post("/finish")
      .send({ answers: [{ questionId: 1, userAnswer: "A" }], timeTakenSeconds: 30 });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, data: { sessionId: 1 } });
    expect(finishQuiz).toHaveBeenCalledWith({ studentId: 7, answers: [{ questionId: 1, userAnswer: "A" }], timeTakenSeconds: 30 });
  });

  it("GET /my-sessions and /my-progress are the student's own", async () => {
    const mySessions = jest.fn(async () => []);
    const myProgress = jest.fn(async () => ({ totals: {} }));
    const app = buildApp({ play: { mySessions, myProgress } });

    expect((await request(app).get("/my-sessions")).body).toEqual({ success: true, data: [] });
    expect((await request(app).get("/my-progress")).body).toEqual({ success: true, data: { totals: {} } });
    expect(mySessions).toHaveBeenCalledWith(7);
  });
});

describe("quiz controller — admin", () => {
  it("GET /admin/questions passes the filters", async () => {
    const listQuestions = jest.fn(async () => ({ items: [], total: 0 }));

    await request(buildApp({ bank: { listQuestions } })).get("/admin/questions?classKey=8&subject=Math&search=x&status=all&page=2&pageSize=10");

    expect(listQuestions).toHaveBeenCalledWith({ classKey: "8", subject: "Math", search: "x", status: "all", page: "2", pageSize: "10" });
  });

  it("GET /admin/questions/subjects is per class", async () => {
    const subjectsFor = jest.fn(async () => [{ subject: "Math", count: 2 }]);

    const res = await request(buildApp({ bank: { subjectsFor } })).get("/admin/questions/subjects?classKey=8");

    expect(res.body.data).toEqual([{ subject: "Math", count: 2 }]);
    expect(subjectsFor).toHaveBeenCalledWith("8");
  });

  it("POST /admin/questions creates with the admin's id and answers 201", async () => {
    const createQuestion = jest.fn(async () => ({ id: 5 }));

    const res = await request(buildApp({ bank: { createQuestion } })).post("/admin/questions").send({ prompt: "Q" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, message: "Question added.", data: { id: 5 } });
    expect(createQuestion).toHaveBeenCalledWith({ input: { prompt: "Q" }, adminId: 3 });
  });

  it("PUT /admin/questions/:id updates", async () => {
    const updateQuestion = jest.fn(async () => ({ id: 5 }));

    const res = await request(buildApp({ bank: { updateQuestion } })).put("/admin/questions/5").send({ answer: "C" });

    expect(res.body).toMatchObject({ success: true, message: "Question updated." });
    expect(updateQuestion).toHaveBeenCalledWith({ id: "5", input: { answer: "C" }, adminId: 3 });
  });

  it("PATCH /admin/questions/:id/active hides or shows", async () => {
    const setActive = jest.fn(async () => ({ id: 5, active: false }));

    const res = await request(buildApp({ bank: { setActive } })).patch("/admin/questions/5/active").send({ active: false });

    expect(res.body).toMatchObject({ success: true, message: "Question hidden from students." });
    expect(setActive).toHaveBeenCalledWith({ id: "5", active: false, adminId: 3 });
  });

  it("GET /admin/sessions and /admin/leaderboard are scoped to the admin's branch", async () => {
    const listSessions = jest.fn(async () => ({ items: [], total: 0 }));
    const leaderboard = jest.fn(async () => []);
    const app = buildApp({ results: { listSessions, leaderboard } });

    await request(app).get("/admin/sessions?classKey=8&page=1");
    await request(app).get("/admin/leaderboard?classKey=8&limit=10");

    expect(listSessions).toHaveBeenCalledWith(expect.objectContaining({ branchId: 2, classKey: "8", page: "1" }));
    expect(leaderboard).toHaveBeenCalledWith({ branchId: 2, classKey: "8", limit: "10" });
  });

  it("translates validation errors and hides unexpected ones", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    const app = buildApp({
      bank: { createQuestion: fail(new ValidationError("quiz_answer_invalid")), listQuestions: fail(new Error("ER_BAD_FIELD secret")) },
    });

    const invalid = await request(app).post("/admin/questions").send({});
    const broken = await request(app).get("/admin/questions?classKey=8");

    expect(invalid.status).toBe(400);
    expect(invalid.body).toEqual({ success: false, message: "The correct answer must be A, B, C or D." });
    expect(broken.status).toBe(500);
    expect(JSON.stringify(broken.body)).not.toContain("secret");
    log.mockRestore();
  });
});
