import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import { db, resetDb } from "./helpers.js";

describe("app", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  it("can be imported without starting a server and serves the API", async () => {
    const res = await request(app).get("/api/branches");

    expect(res.status).toBe(200);
    expect(res.body.data.map((b) => b.name_en).sort()).toEqual(["Main", "North"]);
  });

  it("keeps serving when several queries run at once (connection pool)", async () => {
    const responses = await Promise.all(
      Array.from({ length: 15 }, () => request(app).get("/api/branches")),
    );

    expect(responses.every((r) => r.status === 200)).toBe(true);
  });
});
