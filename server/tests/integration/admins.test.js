import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import bcrypt from "bcryptjs";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, count, db, insert, resetDb, superAdminToken } from "./helpers.js";

async function seedAdmin({ email, role = "branch_admin", branchId = null, password = "secret123" }) {
  return insert("Admin", {
    Username: email.split("@")[0],
    Email: email,
    Password: await bcrypt.hash(password, 4),
    role,
    branch_id: branchId,
  });
}

afterAll(() => db.end());

const login = (Email, branch_id, Password = "secret123") =>
  request(app).post("/api/admin/login").send({ Email, Password, branch_id });

describe("managing admins (/api/admins)", () => {
  let bossId;
  let asBoss;

  beforeEach(async () => {
    await resetDb();
    bossId = await seedAdmin({ email: "boss@school.test", role: "super_admin" });
    asBoss = (req) => req.set(bearer(superAdminToken(bossId)));
  });

  describe("who may use it", () => {
    it("needs a login", async () => {
      expect((await request(app).get("/api/admins")).status).toBe(401);
    });

    it.each([
      ["get", "/api/admins"],
      ["post", "/api/admins"],
      ["put", "/api/admins/1"],
      ["delete", "/api/admins/1"],
    ])("refuses a branch admin: %s %s", async (method, url) => {
      const res = await request(app)[method](url).set(bearer(branchAdminToken(BRANCH_A))).send({});

      expect(res.status).toBe(403);
    });
  });

  it("lists every admin with their branch name and no password", async () => {
    await seedAdmin({ email: "north@school.test", branchId: BRANCH_B });

    const res = await asBoss(request(app).get("/api/admins"));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([
      expect.objectContaining({ id: bossId, role: "super_admin", branch_id: null, branch_name: null, is_you: true }),
      expect.objectContaining({ email: "north@school.test", branch_id: BRANCH_B, branch_name: "North", is_you: false }),
    ]);
    expect(JSON.stringify(res.body)).not.toMatch(/password|\$2[aby]\$/i);
  });

  it("creates a branch admin who can then log in to that branch only", async () => {
    const res = await asBoss(request(app).post("/api/admins")).send({
      Username: "Karim",
      Email: "karim@school.test",
      Password: "secret123",
      role: "branch_admin",
      branch_id: BRANCH_A,
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ username: "Karim", branch_id: BRANCH_A, branch_name: "Main" });
    const [[row]] = await db.query("SELECT Password FROM Admin WHERE AdminID = ?", [res.body.data.id]);
    expect(row.Password).not.toBe("secret123");
    expect((await login("karim@school.test", BRANCH_A)).status).toBe(200);
    expect((await login("karim@school.test", BRANCH_B)).status).toBe(401);
  });

  it("refuses a branch that does not exist", async () => {
    const res = await asBoss(request(app).post("/api/admins")).send({
      Username: "x",
      Email: "x@school.test",
      Password: "secret123",
      branch_id: 99,
    });

    expect(res.status).toBe(404);
    expect(await count("Admin")).toBe(1);
  });

  it("refuses a duplicate login for the same branch", async () => {
    await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });

    const res = await asBoss(request(app).post("/api/admins")).send({
      Username: "Karim 2",
      Email: "Karim@School.test",
      Password: "secret123",
      branch_id: BRANCH_A,
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ success: false, message: expect.any(String) });
  });

  it("allows the same email for a different branch, since login asks for the branch", async () => {
    await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });

    const res = await asBoss(request(app).post("/api/admins")).send({
      Username: "Karim North",
      Email: "karim@school.test",
      Password: "secret123",
      branch_id: BRANCH_B,
    });

    expect(res.status).toBe(201);
  });

  it("moves an admin to another branch: the new branch works, the old one no longer does", async () => {
    const id = await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });

    const res = await asBoss(request(app).put(`/api/admins/${id}`)).send({ branch_id: BRANCH_B, Password: "" });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ branch_id: BRANCH_B, branch_name: "North" });
    expect((await login("karim@school.test", BRANCH_B)).status).toBe(200);
    expect((await login("karim@school.test", BRANCH_A)).status).toBe(401);
  });

  it("resets a password", async () => {
    const id = await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });

    await asBoss(request(app).put(`/api/admins/${id}`)).send({ Password: "brandnew99" });

    expect((await login("karim@school.test", BRANCH_A, "brandnew99")).status).toBe(200);
    expect((await login("karim@school.test", BRANCH_A, "secret123")).status).toBe(401);
  });

  it("removes an admin, who can no longer log in", async () => {
    const id = await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });

    const res = await asBoss(request(app).delete(`/api/admins/${id}`));

    expect(res.status).toBe(200);
    expect(await count("Admin", "AdminID = ?", [id])).toBe(0);
    expect((await login("karim@school.test", BRANCH_A)).status).toBe(401);
  });

  it("keeps at least one super admin and does not let you remove yourself", async () => {
    const otherBoss = await seedAdmin({ email: "boss2@school.test", role: "super_admin" });
    await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });

    const self = await asBoss(request(app).delete(`/api/admins/${bossId}`));
    expect(self.status).toBe(409);

    expect((await asBoss(request(app).delete(`/api/admins/${otherBoss}`))).status).toBe(200);

    // A stale session of the removed super admin cannot remove the last one.
    const last = await request(app).delete(`/api/admins/${bossId}`).set(bearer(superAdminToken(otherBoss)));
    expect(last.status).toBe(409);
    expect(await count("Admin", "role = 'super_admin'")).toBe(1);
  });

  it("answers 404 for an unknown admin", async () => {
    expect((await asBoss(request(app).put("/api/admins/999")).send({ Username: "x" })).status).toBe(404);
  });
});

describe("the old /api/admin routes use the same rules", () => {
  beforeEach(resetDb);

  it("registration checks the password length", async () => {
    const res = await request(app)
      .post("/api/admin/createAdmin")
      .send({ Username: "boss", Email: "boss@school.test", Password: "short", role: "super_admin" });

    expect(res.status).toBe(400);
    expect(await count("Admin")).toBe(0);
  });
});
