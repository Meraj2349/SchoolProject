import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeExamController } from "./exam.controller.js";

// A tiny app around the controller: real HTTP, fake use cases, no auth or DB.
function buildApp(useCases, { branchId = 1 } = {}) {
  const controller = makeExamController({ useCases });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.language = "en";
    req.branchId = branchId;
    next();
  });
  app.get("/exams/public/names", controller.names);
  app.get("/exams", controller.list);
  app.post("/exams/by-class", controller.create);
  app.put("/exams/:id", controller.update);
  app.delete("/exams/:id", controller.remove);
  return app;
}

const EXAM = { id: 7, branchId: 1, classId: 51, className: "Class 5", section: "Good", type: "Annual", name: "Annual 2025", date: "2025-11-20" };
// The shape the Exams and Results pages read.
const EXAM_JSON = { ExamID: 7, ExamType: "Annual", ExamName: "Annual 2025", ClassID: 51, ClassName: "Class 5", Section: "Good", ExamDate: "2025-11-20" };

const fail = (error) => async () => {
  throw error;
};

describe("exam controller", () => {
  it("GET /exams lists the admin's branch's exams", async () => {
    let asked;
    const app = buildApp({ listExams: async (args) => ((asked = args), [EXAM]) }, { branchId: 2 });

    const res = await request(app).get("/exams");

    expect(asked).toEqual({ branchId: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [EXAM_JSON], count: 1 });
  });

  it("GET /exams/public/names gives the names", async () => {
    const res = await request(buildApp({ examNames: async () => ["Annual 2025"] })).get("/exams/public/names");

    expect(res.body).toEqual({ success: true, data: ["Annual 2025"] });
  });

  it("POST /exams/by-class answers 201 with the new exam", async () => {
    let asked;
    const app = buildApp({ createExam: async (args) => ((asked = args), EXAM) });

    const res = await request(app).post("/exams/by-class").send({ ExamName: "Annual 2025" });

    expect(asked).toEqual({ branchId: 1, input: { ExamName: "Annual 2025" } });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, message: "Exam created successfully.", data: EXAM_JSON });
  });

  it("PUT /exams/:id answers 200", async () => {
    let asked;
    const app = buildApp({ updateExam: async (args) => (asked = args) });

    const res = await request(app).put("/exams/7").send({ ExamName: "Renamed" });

    expect(asked).toEqual({ branchId: 1, id: "7", input: { ExamName: "Renamed" } });
    expect(res.body).toEqual({ success: true, message: "Exam updated successfully." });
  });

  it("DELETE /exams/:id answers 200 with the deleted exam", async () => {
    const res = await request(buildApp({ deleteExam: async () => EXAM })).delete("/exams/7");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Exam deleted successfully.", data: EXAM_JSON });
  });

  it.each([
    ["a validation error", new ValidationError("exam_date_past"), 400, "A new exam cannot be scheduled for a past date."],
    ["a missing exam", new NotFoundError("exam_not_found"), 404, "Exam not found."],
  ])("translates %s", async (_label, error, status, message) => {
    const res = await request(buildApp({ updateExam: fail(error) })).put("/exams/7").send({});

    expect(res.status).toBe(status);
    expect(res.body).toEqual({ success: false, message });
  });

  it("never sends an unexpected error's text", async () => {
    const res = await request(buildApp({ listExams: fail(new Error("ER_BAD_FIELD_ERROR: secret column")) })).get("/exams");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: "Failed to fetch exams." });
  });
});
