import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";
import request from "supertest";
import { fileURLToPath } from "url";
import app from "../../app.js";
import { BRANCH_A, bearer, branchAdminToken, count, db, insert, resetDb } from "./helpers.js";

// Branch scoping of achievements is covered by contentMatrix.test.js; this
// file covers what is special about them: board results, images and order.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../../public");
const PNG = Buffer.from(
  "89504e470d0a1a0a0000000d4948445200000001000000010806000000" +
    "1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082",
  "hex",
);
const adminA = bearer(branchAdminToken(BRANCH_A));
const SSC = { title_en: "SSC 2025", title_bn: "এসএসসি ২০২৫", category: "board_result", year: 2025, exam_name: "SSC", examinees: 120, passed: 118, gpa5: 42 };

describe("achievements", () => {
  beforeEach(resetDb);
  afterAll(() => db.end());

  it("saves a board result with its numbers", async () => {
    await request(app).post("/api/achievements").set(adminA).send(SSC).expect(201);

    const [[row]] = await db.query("SELECT exam_name, examinees, passed, gpa5, branch_id FROM Achievements");
    expect(row).toEqual({ exam_name: "SSC", examinees: 120, passed: 118, gpa5: 42, branch_id: BRANCH_A });
  });

  it("refuses a board result whose numbers do not add up", async () => {
    const res = await request(app).post("/api/achievements").set(adminA).send({ ...SSC, passed: 130 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(await count("Achievements")).toBe(0);
  });

  it("stores an uploaded photo, sent as a form", async () => {
    const res = await request(app)
      .post("/api/achievements")
      .set(adminA)
      .field({ title_en: "Science fair", title_bn: "বিজ্ঞান মেলা", category: "competition", year: "2025", is_featured: "true" })
      .attach("image", PNG, "fair.png");

    expect(res.status).toBe(201);
    const [[row]] = await db.query("SELECT image_url, is_featured FROM Achievements");
    expect(row.image_url).toMatch(/^\/uploads\/achievements\/.+\.png$/);
    expect(row.is_featured).toBe(1);
    expect(fs.existsSync(path.join(PUBLIC_DIR, row.image_url))).toBe(true);

    await request(app).delete(`/api/achievements/${res.body.data.id}`).set(adminA).expect(200);
    expect(fs.existsSync(path.join(PUBLIC_DIR, row.image_url))).toBe(false);
  });

  it("lists featured achievements first, then the newest years", async () => {
    const old = await insert("Achievements", { title_en: "Old", title_bn: "পুরনো", category: "award", year: 2019 });
    const recent = await insert("Achievements", { title_en: "Recent", title_bn: "নতুন", category: "award", year: 2025 });
    const featured = await insert("Achievements", { title_en: "Star", title_bn: "তারকা", category: "award", year: 2018, is_featured: true });

    const res = await request(app).get("/api/achievements");

    expect(res.body.data.map((a) => a.id)).toEqual([featured, recent, old]);
  });
});
