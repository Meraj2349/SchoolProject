import { describe, expect, it, jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import { ForbiddenError } from "../../../shared/errors/index.js";
import { makeAttendanceController } from "./attendance.controller.js";

function buildApp({ useCases = {}, reads = {} } = {}) {
  const controller = makeAttendanceController({ useCases, reads });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    Object.assign(req, { language: "en", adminId: 4, role: "branch_admin", branchId: 1 });
    next();
  });
  app.get("/", controller.all);
  app.get("/count", controller.count);
  app.get("/exists", controller.exists);
  app.get("/roster", controller.roster);
  app.put("/class/:classId/date/:date", controller.saveDay);
  app.post("/cell", controller.markStudent);
  app.post("/bulk", controller.bulk);
  app.post("/", controller.create);
  app.delete("/:id", controller.remove);
  return app;
}

const ADMIN = { kind: "admin", id: 4, role: "branch_admin", branchId: 1 };

describe("attendance controller", () => {
  it("lists records with their count, inside the admin's branch", async () => {
    const all = jest.fn(async () => [{ AttendanceID: 1 }, { AttendanceID: 2 }]);

    const res = await request(buildApp({ reads: { all } })).get("/");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [{ AttendanceID: 1 }, { AttendanceID: 2 }], count: 2 });
    expect(all).toHaveBeenCalledWith({ branchId: 1 });
  });

  it("answers the count and the exists check in their old shapes", async () => {
    const reads = { count: async () => 7, exists: jest.fn(async () => true) };
    const app = buildApp({ reads });

    expect((await request(app).get("/count")).body.data).toEqual({ count: 7 });
    expect((await request(app).get("/exists?studentID=5&classDate=2026-03-01")).body.data).toEqual({ exists: true });
    expect(reads.exists).toHaveBeenCalledWith({ branchId: 1, studentId: "5", date: "2026-03-01" });
  });

  it("gives a class's roster for a day", async () => {
    const getRoster = jest.fn(async () => ({ date: "2026-03-01", students: [] }));

    const res = await request(buildApp({ useCases: { getRoster } })).get("/roster?classId=10&date=2026-03-01");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ date: "2026-03-01", students: [] });
    expect(getRoster).toHaveBeenCalledWith({ actor: ADMIN, classId: "10", date: "2026-03-01" });
  });

  it("saves a class's whole day in one request", async () => {
    const saveDay = jest.fn(async () => ({ date: "2026-03-01", kept: [] }));
    const entries = [{ studentId: 1, status: "Present" }];

    const res = await request(buildApp({ useCases: { saveDay } })).put("/class/10/date/2026-03-01").send({ entries });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Attendance saved.", data: { date: "2026-03-01", kept: [] } });
    expect(saveDay).toHaveBeenCalledWith({ actor: ADMIN, classId: "10", date: "2026-03-01", entries });
  });

  it("marks one cell of the grid", async () => {
    const markStudent = jest.fn(async () => ({ studentId: 5, attendanceId: 3 }));

    const res = await request(buildApp({ useCases: { markStudent } }))
      .post("/cell")
      .send({ studentId: 5, classDate: "2026-03-01", status: "Absent" });

    expect(res.status).toBe(200);
    expect(markStudent).toHaveBeenCalledWith({ actor: ADMIN, studentId: 5, date: "2026-03-01", status: "Absent" });
  });

  it("creates a record and answers with its id, as before", async () => {
    const recordForClass = jest.fn(async () => ({ attendanceId: 3 }));

    const res = await request(buildApp({ useCases: { recordForClass } }))
      .post("/")
      .send({ studentID: 5, classID: 10, classDate: "2026-03-01", status: "Present" });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ attendanceID: 3 });
    expect(recordForClass).toHaveBeenCalledWith({ actor: ADMIN, studentId: 5, classId: 10, date: "2026-03-01", status: "Present" });
  });

  it("saves many records and says how many", async () => {
    const recordMany = jest.fn(async () => 2);

    const res = await request(buildApp({ useCases: { recordMany } })).post("/bulk").send({ attendanceRecords: [{}, {}] });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ recordsCreated: 2 });
  });

  it("translates a refusal and never leaks an internal error", async () => {
    const app = buildApp({
      useCases: {
        saveDay: async () => Promise.reject(new ForbiddenError("attendance_day_locked")),
        markStudent: async () => Promise.reject(new Error("ER_SOMETHING: secret sql")),
      },
    });
    jest.spyOn(console, "error").mockImplementation(() => {});

    const locked = await request(app).put("/class/10/date/2026-03-01").send({ entries: [] });
    const broken = await request(app).post("/cell").send({});

    expect(locked.status).toBe(403);
    expect(locked.body.message).toMatch(/today's attendance only/);
    expect(broken.status).toBe(500);
    expect(JSON.stringify(broken.body)).not.toMatch(/secret/);
  });
});
