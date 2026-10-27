import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";
import request from "supertest";
import { fileURLToPath } from "url";
import app from "../../app.js";
import { BRANCH_A, bearer, branchAdminToken, count, db, insert, resetDb } from "./helpers.js";

// Branch scoping is covered by contentMatrix.test.js; this file covers what is
// special about circulars: posts, the PDF poster, the API shape and order.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "../../public");
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
const adminA = bearer(branchAdminToken(BRANCH_A));
const POST = { title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1, qualification_en: "Masters", qualification_bn: "স্নাতকোত্তর", salary_min: 10000, salary_max: 20000 };
const CIRCULAR = { title_en: "Urgent recruitment", title_bn: "জরুরি নিয়োগ বিজ্ঞপ্তি", circular_date: "2026-10-01", posts: [POST] };
const seed = (extra = {}) => insert("JobCirculars", { ...CIRCULAR, posts: JSON.stringify(CIRCULAR.posts), branch_id: BRANCH_A, ...extra });

afterAll(() => db.end());

describe("job circulars", () => {
  beforeEach(resetDb);

  it("saves the posts and a PDF poster from a form", async () => {
    const res = await request(app)
      .post("/api/job-circulars")
      .set(adminA)
      .field({ title_en: CIRCULAR.title_en, title_bn: CIRCULAR.title_bn, circular_date: "2026-10-01", deadline: "2026-10-31", posts: JSON.stringify([POST]) })
      .attach("poster", PDF, { filename: "circular.pdf", contentType: "application/pdf" })
      .expect(201);

    const row = await db.one(`SELECT posts, image_url, deadline, is_open FROM "JobCirculars" WHERE id = ?`, [res.body.data.id]);
    expect(row.posts).toEqual([POST]);
    expect(row.deadline).toBe("2026-10-31");
    expect(row.is_open).toBe(1);
    expect(row.image_url).toMatch(/^\/uploads\/job-circulars\/circular-.*\.pdf$/);
    expect(fs.existsSync(path.join(PUBLIC_DIR, row.image_url))).toBe(true);

    const served = await request(app).get(row.image_url).expect(200);
    expect(served.headers["content-type"]).toBe("application/pdf");
    expect(served.headers["x-content-type-options"]).toBe("nosniff");

    await request(app).delete(`/api/job-circulars/${res.body.data.id}`).set(adminA).expect(200);
    expect(fs.existsSync(path.join(PUBLIC_DIR, row.image_url))).toBe(false);
  });

  it("refuses other poster types and a circular without posts, in the reader's language", async () => {
    const wrongType = await request(app)
      .post("/api/job-circulars")
      .set({ ...adminA, "Accept-Language": "en" })
      .field({ ...CIRCULAR, posts: JSON.stringify([POST]) })
      .attach("poster", Buffer.from("<html>"), { filename: "circular.html", contentType: "text/html" });
    expect(wrongType.status).toBe(400);
    expect(wrongType.body.message).toBe("Only JPG, PNG, WebP or PDF files are allowed.");

    const noPosts = await request(app).post("/api/job-circulars").set({ ...adminA, "Accept-Language": "bn" }).send({ ...CIRCULAR, posts: [] });
    expect(noPosts.status).toBe(400);
    expect(noPosts.body.message).toBe("১ থেকে ২০টি পদ যোগ করুন।");
    expect(await count("JobCirculars")).toBe(0);
  });

  it("lists open circulars first, newest first, with posts as a list and whether they take applications", async () => {
    await seed({ title_en: "Old open", circular_date: "2025-01-01" });
    await seed({ title_en: "Closed", circular_date: "2026-09-01", is_open: false });
    await seed({ title_en: "New open", circular_date: "2026-09-15" });
    await seed({ title_en: "Past deadline", circular_date: "2026-01-01", deadline: "2026-01-31" });

    const res = await request(app).get(`/api/job-circulars?branch_id=${BRANCH_A}`).expect(200);

    expect(res.body.data.map((c) => c.title_en)).toEqual(["New open", "Past deadline", "Old open", "Closed"]);
    expect(res.body.data.map((c) => c.accepting)).toEqual([true, false, true, false]);
    expect(res.body.data[0].posts).toEqual([POST]);
  });

  it("shows one published circular on its own page, from any branch, and hides the rest", async () => {
    const shown = await seed();
    const hidden = await seed({ is_published: false });

    expect((await request(app).get(`/api/job-circulars/${shown}`).expect(200)).body.data).toMatchObject({ id: shown, accepting: true, posts: [POST] });
    expect((await request(app).get(`/api/job-circulars/${hidden}`)).status).toBe(404);
    expect((await request(app).get("/api/job-circulars/99999")).status).toBe(404);
    const bad = await request(app).get("/api/job-circulars/abc").set("Accept-Language", "en");
    expect(bad.status).toBe(404);
    expect(bad.body).toEqual({ success: false, message: "Job circular not found." });
  });
});
