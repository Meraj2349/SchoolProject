import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import bcrypt from "bcryptjs";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, bearer, branchAdminToken, db, insert, resetDb, seedStudent } from "./helpers.js";

// How text is compared and ordered. MySQL compared text ignoring case and
// accents (utf8mb4_0900_ai_ci) and read roll numbers by their leading digits;
// the API keeps doing so on PostgreSQL.
const adminA = bearer(branchAdminToken(BRANCH_A));
const TODAY = new Date().toISOString().slice(0, 10);

describe("text matching and ordering", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  it("lists a class's roster by roll number as a number: 1, 2, 10, then 12A", async () => {
    const { classId } = await seedStudent({ roll: "10", firstName: "Ten" });
    for (const [roll, firstName] of [["2", "Two"], ["12A", "TwelveA"], ["1", "One"]]) await seedStudent({ roll, firstName });

    const res = await request(app).get(`/api/attendance/roster?classId=${classId}&date=${TODAY}`).set(adminA);

    expect(res.status).toBe(200);
    expect(res.body.data.students.map((s) => s.roll)).toEqual(["1", "2", "10", "12A"]);
  });

  it("finds a student by part of the first name in any case", async () => {
    await seedStudent({ firstName: "Rahim" });

    const res = await request(app).get("/api/students/search/filter").set(adminA).query({ FirstName: "RAHI" });

    expect(res.status).toBe(200);
    expect(res.body.data.map((s) => s.FirstName)).toEqual(["Rahim"]);
  });

  it("finds a class by name in any case", async () => {
    await seedStudent({ className: "Class 5" });

    const res = await request(app).get("/api/students/class/class 5");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("finds a teacher by name in any case", async () => {
    await insert("Teachers", { FirstName: "Karim", LastName: "Hossain", branch_id: BRANCH_A });

    const res = await request(app).get("/api/teachers/search").set(adminA).query({ q: "karim hoss" });

    expect(res.status).toBe(200);
    expect(res.body.map((t) => t.FirstName)).toEqual(["Karim"]);
  });

  it("signs an admin in whatever the case of the email", async () => {
    await insert("Admin", {
      Username: "boss",
      Email: "boss@school.test",
      Password: await bcrypt.hash("secret123", 4),
      role: "super_admin",
      branch_id: null,
    });

    const res = await request(app).post("/api/admin/login").send({ Email: "Boss@School.TEST", Password: "secret123" });

    expect(res.status).toBe(200);
  });

  it("refuses a second class that differs only in case", async () => {
    await insert("Classes", { ClassName: "Class 7", Section: "Rose", branch_id: BRANCH_A });

    await expect(insert("Classes", { ClassName: "class 7", Section: "ROSE", branch_id: BRANCH_A })).rejects.toThrow();
  });
});
