import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, db, insert, resetDb, seedStudent, superAdminToken } from "./helpers.js";

// The admin login page sends branch_id to say who is logging in:
// none (or "super") for a super admin, a branch id for that branch's admin.

async function seedAdmin({ email, role, branchId = null, password = "secret123" }) {
  return insert("Admin", {
    Username: email.split("@")[0],
    Email: email,
    Password: await bcrypt.hash(password, 4),
    role,
    branch_id: branchId,
  });
}

const login = (body, lang = "en") => request(app).post("/api/admin/login").set("Accept-Language", lang).send(body);

afterAll(() => db.end());

describe("admin login (POST /api/admin/login)", () => {
  let bossId;
  let karimId;

  beforeEach(async () => {
    await resetDb();
    bossId = await seedAdmin({ email: "boss@school.test", role: "super_admin" });
    karimId = await seedAdmin({ email: "karim@school.test", role: "branch_admin", branchId: BRANCH_A });
  });

  describe("super admin", () => {
    it.each([
      ["without a branch", undefined],
      ["with an empty branch", ""],
      ['with branch "super"', "super"],
    ])("logs in %s", async (_label, branch_id) => {
      const res = await login({ Email: "boss@school.test", Password: "secret123", branch_id });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ role: "super_admin", branch_id: null, branchName: null, message: "Login successful." });
      expect(jwt.decode(res.body.token)).toMatchObject({ adminID: bossId, role: "super_admin", branch_id: null });
    });

    it("gets a token that manages admin accounts", async () => {
      const { body } = await login({ Email: "boss@school.test", Password: "secret123" });

      expect((await request(app).get("/api/admins").set(bearer(body.token))).status).toBe(200);
    });

    it("cannot log in through a branch", async () => {
      expect((await login({ Email: "boss@school.test", Password: "secret123", branch_id: BRANCH_A })).status).toBe(401);
    });
  });

  describe("branch admin", () => {
    it("logs in to their own branch", async () => {
      const res = await login({ Email: "karim@school.test", Password: "secret123", branch_id: String(BRANCH_A) });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ role: "branch_admin", branch_id: BRANCH_A, branchName: "Main" });
      expect(jwt.decode(res.body.token)).toMatchObject({ adminID: karimId, role: "branch_admin", branch_id: BRANCH_A });
    });

    it("cannot log in to another branch", async () => {
      expect((await login({ Email: "karim@school.test", Password: "secret123", branch_id: BRANCH_B })).status).toBe(401);
    });

    it("cannot log in as a super admin", async () => {
      expect((await login({ Email: "karim@school.test", Password: "secret123" })).status).toBe(401);
    });

    it("gets a token that sees only their branch and cannot manage admins", async () => {
      await seedStudent({ branchId: BRANCH_A, firstName: "Nadia" });
      await seedStudent({ branchId: BRANCH_B, firstName: "Rafi" });
      const { body } = await login({ Email: "karim@school.test", Password: "secret123", branch_id: BRANCH_A });

      const students = await request(app).get("/api/students").set(bearer(body.token));
      expect(students.status).toBe(200);
      expect(students.body.data.map((s) => s.FirstName)).toEqual(["Nadia"]);
      expect((await request(app).get("/api/admins").set(bearer(body.token))).status).toBe(403);
    });
  });

  describe("refused logins", () => {
    it.each([
      ["a wrong password", { Email: "boss@school.test", Password: "wrong-pass" }],
      ["an unknown email", { Email: "nobody@school.test", Password: "secret123" }],
      ["no password", { Email: "boss@school.test" }],
      ["no email", { Password: "secret123" }],
      ["a branch that is not a number", { Email: "karim@school.test", Password: "secret123", branch_id: "abc" }],
    ])("refuses %s with the same message and no token", async (_label, body) => {
      const res = await login(body);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Invalid email or password." });
    });

    it("answers in Bangla when asked", async () => {
      const res = await login({ Email: "boss@school.test", Password: "wrong-pass" }, "bn");

      expect(res.body.error).toBe("ইমেইল বা পাসওয়ার্ড সঠিক নয়।");
    });
  });

  it("logs out", async () => {
    const res = await request(app).post("/api/admin/logout").set("Accept-Language", "en");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Admin logged out successfully.");
  });
});

describe("the duplicate /api/admin account routes are gone (use /api/admins)", () => {
  beforeEach(resetDb);

  it.each([
    ["put", "/api/admin/update/9002"],
    ["delete", "/api/admin/delete/9002"],
  ])("%s %s answers 404", async (method, path) => {
    const res = await request(app)[method](path).set(bearer(superAdminToken()));

    expect(res.status).toBe(404);
  });
});

describe("an admin's own email and password (PUT /api/admin/updateEmailPassword)", () => {
  beforeEach(resetDb);

  it("changes them, and the admin signs in with the new ones", async () => {
    const id = await seedAdmin({ email: "karim@school.test", role: "branch_admin", branchId: BRANCH_A });
    const token = bearer(branchAdminToken(BRANCH_A, id));

    const res = await request(app)
      .put("/api/admin/updateEmailPassword")
      .set(token)
      .send({ email: "karim.new@school.test", currentPassword: "secret123", newPassword: "new-secret-456" });

    expect(res.status).toBe(200);
    expect((await login({ Email: "karim.new@school.test", Password: "new-secret-456", branch_id: BRANCH_A })).status).toBe(200);
    expect((await login({ Email: "karim@school.test", Password: "secret123", branch_id: BRANCH_A })).status).toBe(401);
  });
});
