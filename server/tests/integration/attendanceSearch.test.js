import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, db, insert, resetDb, seedStudent } from "./helpers.js";

describe("public attendance search", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  it("shows only the student with that exact roll number, not rolls 10, 11, 21…", async () => {
    for (const roll of ["1", "10", "21"]) {
      const { classId, studentId } = await seedStudent({ roll, firstName: "Rahim" });
      await insert("Attendance", {
        StudentID: studentId, ClassID: classId, ClassDate: "2026-01-05", Status: "Present", branch_id: BRANCH_A,
      });
    }

    const res = await request(app).get("/api/attendance/search/name/Rahim/roll/1/class/Class 5/section/Good");

    expect(res.status).toBe(200);
    expect(res.body.data.map((r) => r.RollNumber)).toEqual(["1"]);
  });
});
