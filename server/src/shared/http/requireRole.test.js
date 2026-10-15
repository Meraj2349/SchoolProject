import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { requireRole } from "./requireRole.js";

// req.role is set by authMiddleware from the admin's current database row.
const appFor = (role) => {
  const app = express();
  app.use((req, _res, next) => {
    req.language = "en";
    req.role = role;
    next();
  });
  app.get("/", requireRole("super_admin"), (_req, res) => res.json({ ok: true }));
  return app;
};

describe("requireRole", () => {
  it("lets an allowed role through", async () => {
    expect((await request(appFor("super_admin")).get("/")).body).toEqual({ ok: true });
  });

  it.each(["branch_admin", undefined])("refuses %s with a translated 403", async (role) => {
    const res = await request(appFor(role)).get("/");

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ success: false, message: "Access forbidden." });
  });
});
