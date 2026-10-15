import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, db, resetDb, seedStudent } from "./helpers.js";

describe("students API", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  describe("GET /students/check-roll", () => {
    it("is reachable and reports a taken roll number", async () => {
      await seedStudent({ className: "Class 5", section: "Good", roll: "7" });

      const res = await request(app)
        .get("/api/students/check-roll")
        .set(bearer(branchAdminToken(BRANCH_A)))
        .query({ rollNumber: "7", className: "Class 5", section: "Good" });

      expect(res.status).toBe(200);
      expect(res.body.data.exists).toBe(true);
    });

    it("only checks the admin's own branch", async () => {
      await seedStudent({ branchId: BRANCH_B, className: "Class 5", section: "Good", roll: "7" });

      const res = await request(app)
        .get("/api/students/check-roll")
        .set(bearer(branchAdminToken(BRANCH_A)))
        .query({ rollNumber: "7", className: "Class 5", section: "Good" });

      expect(res.status).toBe(200);
      expect(res.body.data.exists).toBe(false);
    });
  });

  it("GET /students/class/:className returns the students of that class", async () => {
    await seedStudent({ className: "Class 5", roll: "1" });
    await seedStudent({ className: "Class 6", roll: "1" });

    const res = await request(app).get("/api/students/class/Class 5");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].ClassName).toBe("Class 5");
  });

  it("GET /students/:id answers 404 for an unknown student", async () => {
    const res = await request(app).get("/api/students/999");

    expect(res.status).toBe(404);
  });
});
