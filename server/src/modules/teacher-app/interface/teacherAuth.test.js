import { describe, expect, it, jest } from "@jest/globals";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { makeTeacherAuth } from "./teacherAuth.js";

const SECRET = "unit-test-secret";
const sign = (claims, options = { expiresIn: "1h" }) => jwt.sign(claims, SECRET, options);

function buildApp(authenticate) {
  const app = express();
  app.use((req, _res, next) => ((req.language = "en"), next()));
  app.get("/me", makeTeacherAuth({ authenticate, secret: () => SECRET }), (req, res) => res.json(req.teacher));
  return app;
}

const call = (app, token) => request(app).get("/me").set("Authorization", `Bearer ${token}`);

describe("teacherAuth", () => {
  it("lets in a teacher whose access is still on, as they are stored now", async () => {
    const authenticate = jest.fn(async () => ({ id: 7, branchId: 1 }));

    const res = await call(buildApp(authenticate), sign({ teacherId: 7, branch_id: 1, tokenVersion: 3, userType: "teacher" }));

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 7, branchId: 1 });
    expect(authenticate).toHaveBeenCalledWith({ teacherId: 7, tokenVersion: 3 });
  });

  it.each([
    ["an admin token", sign({ adminID: 1, role: "super_admin" })],
    ["a quiz token", sign({ studentId: 5, userType: "quiz" })],
    ["an expired token", sign({ teacherId: 7, tokenVersion: 0, userType: "teacher" }, { expiresIn: -10 })],
    ["a token signed with another secret", jwt.sign({ teacherId: 7, tokenVersion: 0, userType: "teacher" }, "other")],
    ["no token at all", ""],
  ])("refuses %s", async (_name, token) => {
    const authenticate = jest.fn(async () => ({ id: 7 }));

    const res = await call(buildApp(authenticate), token);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "You have been signed out. Please sign in again." });
    expect(authenticate).not.toHaveBeenCalled();
  });

  it("refuses a token that was signed out or whose access is off", async () => {
    const res = await call(buildApp(async () => null), sign({ teacherId: 7, tokenVersion: 0, userType: "teacher" }));

    expect(res.status).toBe(401);
  });
});
