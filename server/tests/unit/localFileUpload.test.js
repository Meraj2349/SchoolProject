import { afterAll, describe, expect, it } from "@jest/globals";
import express from "express";
import fs from "fs";
import os from "os";
import path from "path";
import request from "supertest";
import { makeLocalFileUpload } from "../../config/localFileUpload.js";
import { errorHandler } from "../../src/shared/http/errorHandler.js";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "upload-test-"));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

function appWith(options) {
  const upload = makeLocalFileUpload({ dir, prefix: "cv", ...options });
  const app = express();
  app.use((req, _res, next) => ((req.language = "en"), next()));
  app.post("/", upload.single("file"), (req, res) => res.json({ name: req.file?.filename ?? null }));
  app.use(errorHandler);
  return app;
}

const PDF = Buffer.from("%PDF-1.4\n%test\n");

describe("makeLocalFileUpload", () => {
  it("keeps an allowed file under a generated name with its extension", async () => {
    const res = await request(appWith({ types: ["pdf"] })).post("/").attach("file", PDF, { filename: "My CV.PDF", contentType: "application/pdf" });

    expect(res.status).toBe(200);
    expect(res.body.name).toMatch(/^cv-\d+-\d+\.pdf$/);
    expect(fs.existsSync(path.join(dir, res.body.name))).toBe(true);
  });

  it("refuses other types with the upload's own message", async () => {
    const res = await request(appWith({ types: ["pdf"], typeError: "cv_type_not_allowed" }))
      .post("/")
      .attach("file", Buffer.from("MZ"), { filename: "virus.exe", contentType: "application/octet-stream" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "The CV must be a PDF, JPG or PNG file." });
  });

  it("refuses a file whose name and type disagree", async () => {
    const res = await request(appWith({ types: ["pdf"] })).post("/").attach("file", PDF, { filename: "cv.pdf", contentType: "text/html" });

    expect(res.status).toBe(400);
  });

  it("refuses a file over the size limit with a file-size message", async () => {
    const res = await request(appWith({ types: ["pdf"], maxBytes: 10, sizeError: "file_too_large" })).post("/").attach("file", PDF, { filename: "cv.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("The file is too large. The limit is 5 MB.");
  });

  it("defaults to images with the image messages", async () => {
    const res = await request(appWith({})).post("/").attach("file", PDF, { filename: "cv.pdf", contentType: "application/pdf" });

    expect(res.body.message).toMatch(/image/i);
  });
});
