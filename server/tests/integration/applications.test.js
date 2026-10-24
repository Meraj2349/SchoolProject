import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, count, db, insert, resetDb, superAdminToken } from "./helpers.js";

const adminA = bearer(branchAdminToken(BRANCH_A));
const superAll = bearer(superAdminToken());

const FORM = {
  applicant_name: "Nusrat Jahan",
  date_of_birth: "2016-03-03",
  gender: "female",
  applying_for_class: "Class 3",
  parent_name: "Jahan",
  parent_contact: "01700000000",
};

const seedApplication = (branchId = BRANCH_A) => insert("Applications", { ...FORM, branch_id: branchId });

const setStatus = (id, status, headers = adminA) =>
  request(app).put(`/api/applications/${id}/status`).set(headers).send({ status });

const enrolled = async () => {
  const { rows: rows } = await db.query(
    `SELECT s."FirstName", s."LastName", s.branch_id, c."ClassName", c."Section", c.branch_id AS "classBranch"
       FROM "Students" s JOIN "Classes" c ON c."ClassID" = s."ClassID"`,
  );
  return rows;
};

describe("admission applications", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  describe("applying online", () => {
    it("files the application under the chosen branch", async () => {
      const res = await request(app).post("/api/applications").send({ ...FORM, branch_id: BRANCH_B });

      expect(res.status).toBe(201);
      const row = await db.one(`SELECT branch_id, status FROM "Applications"`);
      expect(row).toEqual({ branch_id: BRANCH_B, status: "pending" });
    });

    it.each([
      ["no branch", {}],
      ["a branch that does not exist", { branch_id: 999 }],
    ])("refuses an application with %s", async (_label, branch) => {
      const res = await request(app).post("/api/applications").send({ ...FORM, ...branch });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(await count("Applications")).toBe(0);
    });

    it("needs the child's and parent's details", async () => {
      const res = await request(app).post("/api/applications").send({ branch_id: BRANCH_A, applicant_name: "X" });

      expect(res.status).toBe(400);
      expect(await count("Applications")).toBe(0);
    });
  });

  describe("per branch", () => {
    it("shows a branch admin only their branch's applications", async () => {
      const own = await seedApplication(BRANCH_A);
      await seedApplication(BRANCH_B);

      const res = await request(app).get("/api/applications").set(adminA).query({ branch_id: BRANCH_B });

      expect(res.body.data.map((a) => a.id)).toEqual([own]);
    });

    it("shows the super admin every application on All branches", async () => {
      await seedApplication(BRANCH_A);
      await seedApplication(BRANCH_B);

      expect((await request(app).get("/api/applications").set(superAll)).body.data).toHaveLength(2);
    });

    it.each([
      ["open", (id) => request(app).get(`/api/applications/${id}`).set(adminA)],
      ["accept", (id) => setStatus(id, "accepted")],
      ["delete", (id) => request(app).delete(`/api/applications/${id}`).set(adminA)],
    ])("hides another branch's application from a branch admin (%s)", async (_label, send) => {
      const id = await seedApplication(BRANCH_B);

      expect((await send(id)).status).toBe(404);
      expect(await count("Applications", "status = 'pending'")).toBe(1);
      expect(await count("Students")).toBe(0);
    });
  });

  describe("accepting", () => {
    it("creates the student once, even if the application is accepted again", async () => {
      const id = await seedApplication();

      await setStatus(id, "accepted").expect(200);
      await setStatus(id, "reviewed").expect(200);
      await setStatus(id, "accepted").expect(200);

      expect(await count("Students")).toBe(1);
    });

    it("enrols the student in the application's branch, in a standard section", async () => {
      const id = await seedApplication(BRANCH_B);

      await setStatus(id, "accepted", superAll).expect(200);

      expect(await enrolled()).toEqual([
        { FirstName: "Nusrat", LastName: "Jahan", branch_id: BRANCH_B, ClassName: "Class 3", Section: "General", classBranch: BRANCH_B },
      ]);
    });

    it("uses the application's branch even when the super admin is looking at another branch", async () => {
      const id = await seedApplication(BRANCH_B);

      await request(app).put(`/api/applications/${id}/status`).set(superAll).query({ branch_id: BRANCH_A }).send({ status: "accepted" }).expect(200);

      expect((await enrolled())[0].branch_id).toBe(BRANCH_B);
    });

    it("asks the super admin to choose a branch for an old application that has none", async () => {
      const id = await seedApplication(null);

      const refused = await setStatus(id, "accepted", superAll);
      expect(refused.status).toBe(400);
      expect(await count("Students")).toBe(0);

      await request(app).put(`/api/applications/${id}/status`).set(superAll).query({ branch_id: BRANCH_B }).send({ status: "accepted" }).expect(200);
      expect((await enrolled())[0].branch_id).toBe(BRANCH_B);
    });

    it("refuses an unknown status", async () => {
      const id = await seedApplication();

      expect((await setStatus(id, "maybe")).status).toBe(400);
    });
  });
});
