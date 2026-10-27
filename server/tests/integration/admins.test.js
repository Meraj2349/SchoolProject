import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import bcrypt from "bcryptjs";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, clearAdmins, count, db, insert, resetDb, seedStudent, superAdminToken } from "./helpers.js";

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
    await clearAdmins();
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
      const branchAdmin = await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });

      const res = await request(app)[method](url).set(bearer(branchAdminToken(BRANCH_A, branchAdmin))).send({});

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
    const row = await db.one(`SELECT "Password" FROM "Admin" WHERE "AdminID" = ?`, [res.body.data.id]);
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
    expect(await count("Admin", `"AdminID" = ?`, [id])).toBe(0);
    expect((await login("karim@school.test", BRANCH_A)).status).toBe(401);
  });

  it("keeps at least one super admin and does not let you remove yourself", async () => {
    const otherBoss = await seedAdmin({ email: "boss2@school.test", role: "super_admin" });
    await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });

    const self = await asBoss(request(app).delete(`/api/admins/${bossId}`));
    expect(self.status).toBe(409);

    expect((await asBoss(request(app).delete(`/api/admins/${otherBoss}`))).status).toBe(200);

    expect(await count("Admin", "role = 'super_admin'")).toBe(1);
  });

  it("keeps a super admin even when two remove each other at the same moment", async () => {
    const otherBoss = await seedAdmin({ email: "boss2@school.test", role: "super_admin" });

    await Promise.all([
      request(app).delete(`/api/admins/${otherBoss}`).set(bearer(superAdminToken(bossId))),
      request(app).delete(`/api/admins/${bossId}`).set(bearer(superAdminToken(otherBoss))),
    ]);

    expect(await count("Admin", "role = 'super_admin'")).toBe(1);
  });

  describe("a change takes effect at once, not when the old login expires", () => {
    it("a demoted super admin cannot use their old login to make themselves super admin again", async () => {
      const exBoss = await seedAdmin({ email: "ex@school.test", role: "super_admin" });
      await asBoss(request(app).put(`/api/admins/${exBoss}`)).send({ role: "branch_admin", branch_id: BRANCH_A });

      const res = await request(app)
        .put(`/api/admins/${exBoss}`)
        .set(bearer(superAdminToken(exBoss)))
        .send({ role: "super_admin" });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ success: false, message: expect.any(String) });
      expect(await count("Admin", "role = 'super_admin'")).toBe(1);
    });

    it("a removed super admin's old login is refused", async () => {
      const exBoss = await seedAdmin({ email: "ex@school.test", role: "super_admin" });
      await asBoss(request(app).delete(`/api/admins/${exBoss}`));

      const res = await request(app).delete(`/api/admins/${bossId}`).set(bearer(superAdminToken(exBoss)));

      expect(res.status).toBe(401);
      expect(await count("Admin", `"AdminID" = ?`, [bossId])).toBe(1);
    });

    it("a removed branch admin is logged out of their branch at once", async () => {
      const karim = await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });
      const asKarim = bearer(branchAdminToken(BRANCH_A, karim));
      expect((await request(app).get("/api/fees/settings").set(asKarim)).status).toBe(200);

      await asBoss(request(app).delete(`/api/admins/${karim}`));

      expect((await request(app).get("/api/fees/settings").set(asKarim)).status).toBe(401);
      const write = await request(app)
        .post("/api/students")
        .set(asKarim)
        .send({ FirstName: "X", LastName: "Y", DateOfBirth: "2015-01-01", Gender: "Male", ClassName: "Class 5", Section: "Good", RollNumber: "7" });
      expect(write.status).toBe(401);
      expect(await count("Students")).toBe(0);
    });

    it("a branch admin moved to another branch only sees the new branch, with the same login", async () => {
      await seedStudent({ branchId: BRANCH_A, firstName: "Rahim" });
      await seedStudent({ branchId: BRANCH_B, firstName: "Nadia" });
      const karim = await seedAdmin({ email: "karim@school.test", branchId: BRANCH_A });
      const asKarim = bearer(branchAdminToken(BRANCH_A, karim)); // token still says branch A

      await asBoss(request(app).put(`/api/admins/${karim}`)).send({ branch_id: BRANCH_B });
      const res = await request(app).get("/api/students").set(asKarim);

      expect(res.status).toBe(200);
      expect(res.body.data.map((s) => s.FirstName)).toEqual(["Nadia"]);
    });

    it("a demoted super admin's old login cannot change, remove or create admins", async () => {
      const exBoss = await seedAdmin({ email: "ex@school.test", role: "super_admin" });
      await asBoss(request(app).put(`/api/admins/${exBoss}`)).send({ role: "branch_admin", branch_id: BRANCH_A });
      const asExBoss = bearer(superAdminToken(exBoss));

      expect((await request(app).delete(`/api/admins/${bossId}`).set(asExBoss)).status).toBe(403);
      expect((await request(app).put(`/api/admins/${bossId}`).set(asExBoss).send({ Password: "takeover1" })).status).toBe(403);
      expect(
        (
          await request(app)
            .post("/api/admin/createAdmin")
            .set(asExBoss)
            .send({ Username: "x", Email: "x@school.test", Password: "secret123", role: "super_admin" })
        ).status,
      ).toBe(403);
    });
  });

  it("answers 404 for an unknown admin", async () => {
    expect((await asBoss(request(app).put("/api/admins/999")).send({ Username: "x" })).status).toBe(404);
  });
});

describe("the old /api/admin routes use the same rules", () => {
  beforeEach(async () => {
    await resetDb();
    await clearAdmins();
  });

  it("registration checks the password length", async () => {
    const res = await request(app)
      .post("/api/admin/createAdmin")
      .send({ Username: "boss", Email: "boss@school.test", Password: "short", role: "super_admin" });

    expect(res.status).toBe(400);
    expect(await count("Admin")).toBe(0);
  });
});
