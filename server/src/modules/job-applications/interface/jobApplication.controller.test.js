import { afterAll, describe, expect, it } from "@jest/globals";
import express from "express";
import fs from "fs";
import os from "os";
import path from "path";
import request from "supertest";
import { ConflictError } from "../../../shared/errors/index.js";
import { makeJobApplicationController } from "./jobApplication.controller.js";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cv-download-"));
const cvPath = path.join(dir, "cv-1.pdf");
fs.writeFileSync(cvPath, "%PDF-1.4");
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

function buildApp(useCases, { file } = {}) {
  const controller = makeJobApplicationController({ useCases });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    Object.assign(req, { language: "en", role: "branch_admin", branchId: 1 });
    if (file) req.file = file;
    next();
  });
  app.post("/apply", controller.submit);
  app.get("/", controller.list);
  app.get("/counts", controller.counts);
  app.get("/:id/cv", controller.cv);
  app.put("/:id/status", controller.setStatus);
  return app;
}

describe("job application controller", () => {
  it("files an application with the uploaded CV and thanks the applicant", async () => {
    let seen;
    const file = { filename: "cv-1.pdf", path: "/incoming/cv-1.pdf" };
    const app = buildApp({ submit: async (args) => ((seen = args), { id: 9 }) }, { file });

    const res = await request(app).post("/apply").send({ circular_id: "3", full_name: "N" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, message: "Your application has been received. We will contact you if you are shortlisted.", data: { id: 9 } });
    expect(seen).toEqual({ input: { circular_id: "3", full_name: "N" }, upload: file });
  });

  it("translates a refusal", async () => {
    const app = buildApp({ submit: async () => Promise.reject(new ConflictError("job_application_duplicate")) });

    const res = await request(app).post("/apply").send({});

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ success: false, message: "You have already applied for this post with this mobile number." });
  });

  it("lists with the filters from the query", async () => {
    let seen;
    const app = buildApp({ list: async (args) => ((seen = args), [{ id: 1 }]) });

    const res = await request(app).get("/?circular_id=3&status=new");

    expect(res.body).toEqual({ success: true, data: [{ id: 1 }], count: 1 });
    expect(seen).toEqual({ admin: { role: "branch_admin", branchId: 1 }, circularId: "3", status: "new" });
  });

  it("sends the CV as a download that browsers will not run", async () => {
    const app = buildApp({ cv: async () => ({ path: cvPath, downloadName: "Nusrat-Jahan-CV.pdf" }) });

    const res = await request(app).get("/5/cv");

    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toBe('attachment; filename="Nusrat-Jahan-CV.pdf"');
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["cache-control"]).toBe("private, no-store");
    expect(res.body.toString()).toBe("%PDF-1.4");
  });

  it("changes a status", async () => {
    const app = buildApp({ setStatus: async ({ status }) => ({ id: 5, status }) });

    const res = await request(app).put("/5/status").send({ status: "hired" });

    expect(res.body).toEqual({ success: true, message: "Application status updated.", data: { id: 5, status: "hired" } });
  });

  it("says so when the CV file is missing on disk", async () => {
    const app = buildApp({ cv: async () => ({ path: path.join(dir, "gone.pdf"), downloadName: "x.pdf" }) });

    const res = await request(app).get("/5/cv");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "This application has no CV." });
  });
});
