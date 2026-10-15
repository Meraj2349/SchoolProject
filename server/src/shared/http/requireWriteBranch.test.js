import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { requireWriteBranch } from "./requireWriteBranch.js";

// req.branchId comes from authMiddleware: a branch admin's own branch, or the
// branch a super admin picked (?branch_id); null means "All branches".
const appWith = (branchId) => {
  const app = express();
  app.use((req, _res, next) => {
    req.language = "en";
    req.branchId = branchId;
    next();
  });
  app.post("/", requireWriteBranch, (req, res) => res.json({ branchId: req.branchId }));
  return app;
};

describe("requireWriteBranch", () => {
  it("lets a request with a branch through", async () => {
    expect((await request(appWith(2)).post("/")).body).toEqual({ branchId: 2 });
  });

  it("asks to choose a branch when there is none", async () => {
    const res = await request(appWith(null)).post("/");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Choose a branch first." });
  });
});
