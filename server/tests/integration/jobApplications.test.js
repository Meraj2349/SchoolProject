import { afterAll, beforeEach, describe, expect, it } from "@jest/globals";
import fs from "fs";
import path from "path";
import request from "supertest";
import app from "../../app.js";
import { JOB_APPLICATION_CV_ROOT } from "../../src/modules/job-applications/index.js";
import { BRANCH_A, BRANCH_B, bearer, branchAdminToken, count, db, insert, resetDb, superAdminToken } from "./helpers.js";

const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
const adminA = bearer(branchAdminToken(BRANCH_A));
const adminB = bearer(branchAdminToken(BRANCH_B));
const superAdmin = bearer(superAdminToken());
const POSTS = [
  { title_en: "Accountant", title_bn: "অ্যাকাউন্টেন্ট", vacancies: 1 },
  { title_en: "Assistant Teacher (Bangla)", title_bn: "সহকারি শিক্ষক (বাংলা)", vacancies: 1 },
];
const FORM = { post_index: "1", full_name: "Nusrat Jahan", phone: "01712-345678", education: "MA (Bangla)", address: "Natiapara, Delduar, Tangail" };

const circular = (extra = {}) =>
  insert("JobCirculars", { title_en: "Recruitment", title_bn: "নিয়োগ", circular_date: "2026-10-01", posts: JSON.stringify(POSTS), branch_id: BRANCH_A, ...extra });

// Each test applies from its own address, so the per-address limit is only met where a test means to.
let address = 0;
const visitor = () => ({ "X-Forwarded-For": `203.0.113.${(address += 1)}`, "Accept-Language": "en" });
const apply = (fields, { cv = null, from = visitor() } = {}) => {
  const req = request(app).post("/api/job-applications").set(from).field(fields);
  return cv ? req.attach("cv", cv.buffer ?? PDF, { filename: cv.filename ?? "cv.pdf", contentType: cv.contentType ?? "application/pdf" }) : req;
};
const filesIn = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir) : []);

afterAll(() => db.end());

describe("job applications", () => {
  beforeEach(async () => {
    await resetDb();
    fs.rmSync(JOB_APPLICATION_CV_ROOT, { recursive: true, force: true });
  });

  it("files an application to an open circular, with its CV kept privately", async () => {
    const id = await circular();

    const res = await apply({ ...FORM, circular_id: id }, { cv: {} });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Your application has been received. We will contact you if you are shortlisted.");
    const [[row]] = await db.query("SELECT * FROM JobApplications");
    expect(row).toMatchObject({ circular_id: id, post_index: 1, post_title_bn: "সহকারি শিক্ষক (বাংলা)", phone: "01712345678", status: "new", branch_id: BRANCH_A });
    expect(filesIn(path.join(JOB_APPLICATION_CV_ROOT, String(id)))).toEqual([row.cv_file]);
    expect(filesIn(path.join(JOB_APPLICATION_CV_ROOT, "incoming"))).toEqual([]);
    // Not under public/: there is no URL that serves it.
    expect((await request(app).get(`/uploads/job-applications/${id}/${row.cv_file}`)).status).toBe(404);
    expect((await request(app).get(`/private_uploads/job-applications/${id}/${row.cv_file}`)).status).toBe(404);
  });

  it("refuses closed, hidden and past-deadline circulars, and keeps no file", async () => {
    const closed = await circular({ is_open: false });
    const hidden = await circular({ is_published: false });
    const late = await circular({ deadline: "2020-01-31", circular_date: "2020-01-01" });

    const res = await apply({ ...FORM, circular_id: closed }, { cv: {} });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("This circular is no longer taking applications.");
    expect((await apply({ ...FORM, circular_id: hidden })).status).toBe(404);
    expect((await apply({ ...FORM, circular_id: late })).status).toBe(409);
    expect(await count("JobApplications")).toBe(0);
    expect(filesIn(path.join(JOB_APPLICATION_CV_ROOT, "incoming"))).toEqual([]);
  });

  it("refuses a second application for the same post from the same number", async () => {
    const id = await circular();
    await apply({ ...FORM, circular_id: id }).expect(201);

    const again = await apply({ ...FORM, circular_id: id, phone: "+8801712345678" }, { cv: {} });

    expect(again.status).toBe(409);
    expect(again.body.message).toBe("You have already applied for this post with this mobile number.");
    expect(await count("JobApplications")).toBe(1);
    expect(filesIn(path.join(JOB_APPLICATION_CV_ROOT, String(id)))).toEqual([]);
    await apply({ ...FORM, circular_id: id, post_index: "0" }).expect(201); // another post is fine
  });

  it("refuses a CV of another type or over 5 MB, in the applicant's language", async () => {
    const id = await circular();

    const exe = await apply({ ...FORM, circular_id: id }, { cv: { buffer: Buffer.from("MZ"), filename: "cv.exe", contentType: "application/octet-stream" } });
    expect(exe.status).toBe(400);
    expect(exe.body.message).toBe("The CV must be a PDF, JPG or PNG file.");

    const big = await apply({ ...FORM, circular_id: id }, { cv: { buffer: Buffer.alloc(5 * 1024 * 1024 + 1, 0x41) } });
    expect(big.status).toBe(400);
    expect(big.body.message).toBe("The file is too large. The limit is 5 MB.");
    expect(await count("JobApplications")).toBe(0);
    expect(filesIn(path.join(JOB_APPLICATION_CV_ROOT, "incoming"))).toEqual([]);
  });

  it("lets each branch's admins see and download only their own applications", async () => {
    const id = await circular();
    await apply({ ...FORM, circular_id: id }, { cv: {} }).expect(201);
    const [[{ id: applicationId }]] = await db.query("SELECT id FROM JobApplications");

    expect((await request(app).get("/api/job-applications").set(adminA)).body.data).toHaveLength(1);
    expect((await request(app).get("/api/job-applications").set(adminB)).body.data).toHaveLength(0);
    expect((await request(app).get("/api/job-applications/counts").set(adminA)).body.data).toEqual({ [id]: 1 });

    expect((await request(app).get(`/api/job-applications/${applicationId}/cv`)).status).toBe(401);
    expect((await request(app).get(`/api/job-applications/${applicationId}/cv`).set(adminB)).status).toBe(404);
    const download = await request(app).get(`/api/job-applications/${applicationId}/cv`).set(superAdmin).buffer(true);
    expect(download.status).toBe(200);
    expect(download.headers["content-disposition"]).toBe('attachment; filename="Nusrat-Jahan-CV.pdf"');
    expect(download.headers["x-content-type-options"]).toBe("nosniff");

    await request(app).put(`/api/job-applications/${applicationId}/status`).set(adminB).send({ status: "hired" }).expect(404);
    await request(app).put(`/api/job-applications/${applicationId}/status`).set(adminA).send({ status: "shortlisted" }).expect(200);
    const [[row]] = await db.query("SELECT status FROM JobApplications");
    expect(row.status).toBe("shortlisted");
  });

  it("deletes an application with its CV, and a circular with all its applications and CVs", async () => {
    const id = await circular();
    await apply({ ...FORM, circular_id: id }, { cv: {} }).expect(201);
    await apply({ ...FORM, circular_id: id, post_index: "0" }, { cv: {} }).expect(201);
    const [[first]] = await db.query("SELECT id, cv_file FROM JobApplications ORDER BY id LIMIT 1");

    await request(app).delete(`/api/job-applications/${first.id}`).set(adminA).expect(200);
    expect(filesIn(path.join(JOB_APPLICATION_CV_ROOT, String(id)))).toHaveLength(1);

    await request(app).delete(`/api/job-circulars/${id}`).set(adminA).expect(200);
    expect(await count("JobApplications")).toBe(0);
    expect(fs.existsSync(path.join(JOB_APPLICATION_CV_ROOT, String(id)))).toBe(false);
  });

  it("ignores a bot that fills in the hidden field, and slows down one address", async () => {
    const id = await circular();
    const bot = await apply({ ...FORM, circular_id: id, website: "http://spam.example" });
    expect(bot.status).toBe(201);
    expect(await count("JobApplications")).toBe(0);

    const from = visitor();
    for (let i = 0; i < 5; i += 1) await apply({ ...FORM, circular_id: id, phone: `0171234500${i}` }, { from });
    const sixth = await apply({ ...FORM, circular_id: id, phone: "01712345099" }, { from });
    expect(sixth.status).toBe(429);
    expect(sixth.body.message).toBe("Too many attempts. Please try again later.");
  });
});
