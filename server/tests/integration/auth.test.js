import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../app.js";
import {
  BRANCH_A,
  bearer,
  branchAdminToken,
  count,
  db,
  insert,
  quizStudentToken,
  resetDb,
  seedStudent,
  superAdminToken,
} from "./helpers.js";

const newStudent = {
  FirstName: "Karim",
  LastName: "Ali",
  DateOfBirth: "2015-02-02",
  Gender: "Male",
  ClassName: "Class 5",
  Section: "Good",
  RollNumber: "9",
};

async function seedAdmin({ email = "admin@school.test", password = "secret123", role = "super_admin", branchId = null } = {}) {
  return insert("Admin", {
    Username: email.split("@")[0],
    Email: email,
    Password: await bcrypt.hash(password, 4),
    role,
    branch_id: branchId,
  });
}

describe("authentication & authorization", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  describe("tokens", () => {
    it("rejects a quiz student's token on admin endpoints", async () => {
      const { studentId } = await seedStudent();

      const res = await request(app)
        .post("/api/students")
        .set(bearer(quizStudentToken(studentId, BRANCH_A)))
        .send(newStudent);

      expect(res.status).toBe(401);
      expect(await count("Students")).toBe(1);
    });

    it("answers 401 (so the frontend logs out) for an expired admin token", async () => {
      const expired = jwt.sign(
        { adminID: 1, role: "super_admin", branch_id: null, exp: Math.floor(Date.now() / 1000) - 60 },
        process.env.JWT_SECRET_KEY,
      );

      const res = await request(app).post("/api/students").set(bearer(expired)).send(newStudent);

      expect(res.status).toBe(401);
    });

    it("treats a public request with a stale token as a normal public visitor", async () => {
      await seedStudent();

      const res = await request(app).get("/api/students").set(bearer("not-a-valid-token"));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("creating admins", () => {
    const superAdminSignup = {
      Username: "boss",
      Email: "boss@school.test",
      Password: "secret123",
      role: "super_admin",
    };

    it("lets the very first admin register without a token (initial setup)", async () => {
      const res = await request(app).post("/api/admin/createAdmin").send(superAdminSignup);

      expect(res.status).toBe(201);
      expect(await count("Admin", "role = 'super_admin'")).toBe(1);
    });

    it("refuses anonymous registration once an admin exists", async () => {
      await seedAdmin();

      const res = await request(app).post("/api/admin/createAdmin").send(superAdminSignup);

      expect(res.status).toBe(401);
      expect(await count("Admin")).toBe(1);
    });

    it("refuses a branch admin creating other admins", async () => {
      await seedAdmin();
      const branchAdmin = await seedAdmin({ email: "b@school.test", role: "branch_admin", branchId: BRANCH_A });

      const res = await request(app)
        .post("/api/admin/createAdmin")
        .set(bearer(branchAdminToken(BRANCH_A, branchAdmin)))
        .send(superAdminSignup);

      expect(res.status).toBe(403);
    });

    it("lets a super admin create a branch admin", async () => {
      await seedAdmin();

      const res = await request(app)
        .post("/api/admin/createAdmin")
        .set(bearer(superAdminToken()))
        .send({ Username: "b", Email: "b@school.test", Password: "secret123", branch_id: BRANCH_A });

      expect(res.status).toBe(201);
      expect(await count("Admin", "role = 'branch_admin' AND branch_id = ?", [BRANCH_A])).toBe(1);
    });
  });

  describe("managing admins", () => {
    it("refuses a branch admin changing another admin's credentials", async () => {
      const victim = await seedAdmin();
      const attacker = await seedAdmin({ email: "b@school.test", role: "branch_admin", branchId: BRANCH_A });

      const res = await request(app)
        .put(`/api/admin/update/${victim}`)
        .set(bearer(branchAdminToken(BRANCH_A, attacker)))
        .send({ Email: "attacker@evil.test", Password: "owned" });

      expect(res.status).toBe(403);
    });

    it("refuses a branch admin deleting another admin", async () => {
      const victim = await seedAdmin();
      const attacker = await seedAdmin({ email: "b@school.test", role: "branch_admin", branchId: BRANCH_A });

      const res = await request(app)
        .delete(`/api/admin/delete/${victim}`)
        .set(bearer(branchAdminToken(BRANCH_A, attacker)));

      expect(res.status).toBe(403);
      expect(await count("Admin")).toBe(2);
    });

    it("stores a password changed by a super admin hashed, so the admin can still log in", async () => {
      const bossId = await seedAdmin();
      const id = await seedAdmin({ email: "b@school.test", role: "branch_admin", branchId: BRANCH_A });

      await request(app)
        .put(`/api/admin/update/${id}`)
        .set(bearer(superAdminToken(bossId)))
        .send({ Password: "newpass123" })
        .expect(200);

      const login = await request(app)
        .post("/api/admin/login")
        .send({ Email: "b@school.test", Password: "newpass123", branch_id: BRANCH_A });
      expect(login.status).toBe(200);
      expect(login.body.token).toBeDefined();
    });

    it("keeps the email when only the password is changed", async () => {
      const bossId = await seedAdmin();
      const id = await seedAdmin({ email: "b@school.test", role: "branch_admin", branchId: BRANCH_A });

      await request(app)
        .put(`/api/admin/update/${id}`)
        .set(bearer(superAdminToken(bossId)))
        .send({ Password: "newpass123" });

      const [[row]] = await db.query("SELECT Email FROM Admin WHERE AdminID = ?", [id]);
      expect(row.Email).toBe("b@school.test");
    });
  });

  describe("content endpoints require an admin", () => {
    it.each([
      ["post", "/api/notices/add", { title: "Hacked", description: "x" }],
      ["put", "/api/notices/edit/1", { title: "Hacked", description: "x" }],
      ["delete", "/api/notices/delete/1", undefined],
      ["put", "/api/notices/toggle-visibility/1", { show: true }],
      ["put", "/api/notices/show/1", undefined],
      ["post", "/api/messages/add", { messages: "Hacked" }],
      ["put", "/api/messages/edit/1", { messages: "Hacked", show: true }],
      ["delete", "/api/messages/delete/1", undefined],
      ["put", "/api/messages/toggle-visibility/1", { show: true }],
      ["post", "/api/images", undefined],
      ["put", "/api/images/1", { description: "x" }],
      ["put", "/api/images/1/image", undefined],
      ["delete", "/api/images/1", undefined],
    ])("%s %s without a token → 401", async (method, url, body) => {
      const res = await request(app)[method](url).send(body);

      expect(res.status).toBe(401);
    });

    it("still lets visitors read notices and messages", async () => {
      expect((await request(app).get("/api/notices")).status).toBe(200);
      expect((await request(app).get("/api/messages")).status).toBe(200);
    });
  });
});
