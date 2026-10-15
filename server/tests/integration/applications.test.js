import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { BRANCH_A, bearer, branchAdminToken, count, db, insert, resetDb } from "./helpers.js";

const adminA = bearer(branchAdminToken(BRANCH_A));

const seedApplication = () =>
  insert("Applications", {
    applicant_name: "Nusrat Jahan",
    date_of_birth: "2016-03-03",
    gender: "female",
    applying_for_class: "Class 3",
    parent_name: "Jahan",
    parent_contact: "01700000000",
  });

const setStatus = (id, status) =>
  request(app).put(`/api/applications/${id}/status`).set(adminA).send({ status });

describe("admission applications", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  it("creates the student once, even if the application is accepted again", async () => {
    const id = await seedApplication();

    await setStatus(id, "accepted").expect(200);
    await setStatus(id, "reviewed").expect(200);
    await setStatus(id, "accepted").expect(200);

    expect(await count("Students")).toBe(1);
  });

  it("enrols the student in the accepting admin's branch, in a standard section", async () => {
    const id = await seedApplication();

    await setStatus(id, "accepted").expect(200);

    const [[student]] = await db.query(
      `SELECT s.FirstName, s.LastName, s.branch_id, c.ClassName, c.Section, c.branch_id AS classBranch
         FROM Students s JOIN Classes c ON c.ClassID = s.ClassID`,
    );
    expect(student).toMatchObject({
      FirstName: "Nusrat",
      LastName: "Jahan",
      branch_id: BRANCH_A,
      ClassName: "Class 3",
      Section: "General",
      classBranch: BRANCH_A,
    });
  });
});
