import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { makeAuthMiddleware } from "../../../middlewares/auth.middleware.js";

// The login token holds the role and branch at login time. These tests check
// that every request uses the admin as stored *now* (findAdmin), so removing,
// demoting or moving an admin takes effect immediately.

const SECRET = "unit-test-secret";
beforeAll(() => {
  process.env.JWT_SECRET_KEY = SECRET;
});

const token = (payload) => `Bearer ${jwt.sign(payload, SECRET, { expiresIn: "1h" })}`;
const branchAdminLogin = token({ adminID: 5, role: "branch_admin", branch_id: 1 });
const superAdminLogin = token({ adminID: 9, role: "super_admin", branch_id: null });

function buildApp(findAdmin) {
  const { authMiddleware, optionalAuth } = makeAuthMiddleware({ findAdmin });
  const app = express();
  const who = (req, res) => res.json({ adminId: req.adminId ?? null, role: req.role, branchId: req.branchId });
  app.get("/private", authMiddleware, who);
  app.get("/public", optionalAuth, who);
  return app;
}

const stored = (admin) => jest.fn(async () => admin);

describe("authMiddleware", () => {
  it("uses the role and branch stored now, not the ones in the token", async () => {
    const findAdmin = stored({ id: 5, role: "branch_admin", branchId: 2 });

    const res = await request(buildApp(findAdmin)).get("/private").set("Authorization", branchAdminLogin);

    expect(res.body).toEqual({ adminId: 5, role: "branch_admin", branchId: 2 });
    expect(findAdmin).toHaveBeenCalledWith(5);
  });

  it("logs out (401) an admin who has been removed", async () => {
    const res = await request(buildApp(stored(null))).get("/private").set("Authorization", branchAdminLogin);

    expect(res.status).toBe(401);
  });

  it("logs out a branch admin who has no branch (e.g. their branch was deleted) instead of showing every branch", async () => {
    const res = await request(buildApp(stored({ id: 5, role: "branch_admin", branchId: null })))
      .get("/private")
      .set("Authorization", branchAdminLogin);

    expect(res.status).toBe(401);
  });

  it("treats a demoted super admin as a branch admin of their new branch", async () => {
    const res = await request(buildApp(stored({ id: 9, role: "branch_admin", branchId: 1 })))
      .get("/private?branch_id=2")
      .set("Authorization", superAdminLogin);

    expect(res.body).toEqual({ adminId: 9, role: "branch_admin", branchId: 1 });
  });

  it("lets a super admin pick a branch with ?branch_id", async () => {
    const res = await request(buildApp(stored({ id: 9, role: "super_admin", branchId: null })))
      .get("/private?branch_id=2")
      .set("Authorization", superAdminLogin);

    expect(res.body).toEqual({ adminId: 9, role: "super_admin", branchId: 2 });
  });

  it.each(["abc", "0", "-3", "1.5"])("ignores a malformed ?branch_id=%s instead of passing it on", async (value) => {
    const res = await request(buildApp(stored({ id: 9, role: "super_admin", branchId: null })))
      .get(`/public?branch_id=${value}`)
      .set("Authorization", superAdminLogin);

    expect(res.body.branchId).toBeNull();
  });

  it("never looks up a quiz student's token and refuses it", async () => {
    const findAdmin = stored({ id: 5, role: "super_admin", branchId: null });

    const res = await request(buildApp(findAdmin))
      .get("/private")
      .set("Authorization", token({ studentId: 5, branch_id: 1, userType: "quiz" }));

    expect(res.status).toBe(401);
    expect(findAdmin).not.toHaveBeenCalled();
  });

  it("answers 500 without details when the lookup fails", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    const findAdmin = jest.fn(async () => {
      throw new Error("ER_CON_COUNT_ERROR secret-host");
    });

    const res = await request(buildApp(findAdmin)).get("/private").set("Authorization", branchAdminLogin);

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("secret-host");
    log.mockRestore();
  });
});

describe("optionalAuth", () => {
  it("uses the stored branch for a logged-in admin", async () => {
    const res = await request(buildApp(stored({ id: 5, role: "branch_admin", branchId: 2 })))
      .get("/public?branch_id=1")
      .set("Authorization", branchAdminLogin);

    expect(res.body).toEqual({ adminId: 5, role: "branch_admin", branchId: 2 });
  });

  it("treats a branch admin without a branch as a public visitor", async () => {
    const res = await request(buildApp(stored({ id: 5, role: "branch_admin", branchId: null })))
      .get("/public?branch_id=1")
      .set("Authorization", branchAdminLogin);

    expect(res.body).toEqual({ adminId: null, role: "public", branchId: 1 });
  });

  it("treats a removed admin as a public visitor", async () => {
    const res = await request(buildApp(stored(null)))
      .get("/public?branch_id=1")
      .set("Authorization", branchAdminLogin);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ adminId: null, role: "public", branchId: 1 });
  });
});
