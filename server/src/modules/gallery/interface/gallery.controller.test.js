import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { ForbiddenError, ValidationError } from "../../../shared/errors/index.js";
import { makeGalleryController } from "./gallery.controller.js";

// A tiny app around the controller: real HTTP, no database, Cloudinary or multer.
function buildApp(useCases, { file, removed = [] } = {}) {
  const controller = makeGalleryController({ useCases, removeFile: async (path) => removed.push(path) });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    Object.assign(req, { language: "en", role: "branch_admin", branchId: 1 });
    if (file) req.file = file;
    next();
  });
  app.get("/images", controller.list);
  app.get("/images/student/:studentId", controller.byStudent);
  app.post("/images", controller.upload);
  app.put("/images/:id", controller.update);
  app.delete("/images/:id", controller.remove);
  return app;
}

describe("gallery controller", () => {
  it("lists for the viewer with the requested filter", async () => {
    let seen;
    const app = buildApp({ list: async (args) => ((seen = args), [{ ImageID: 1 }]) });

    const res = await request(app).get("/images/student/7");

    expect(res.body).toEqual({ success: true, data: [{ ImageID: 1 }] });
    expect(seen).toEqual({ viewer: { role: "branch_admin", branchId: 1 }, filter: { studentId: "7" } });
  });

  it("uploads with 201 and removes the temp file", async () => {
    const removed = [];
    const app = buildApp({ upload: async () => ({ ImageID: 3 }) }, { file: { path: "/tmp/up-1" }, removed });

    const res = await request(app).post("/images").send({ imageType: "event" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, data: { ImageID: 3 } });
    expect(removed).toEqual(["/tmp/up-1"]);
  });

  it("removes the temp file when the upload is refused", async () => {
    const removed = [];
    const app = buildApp(
      { upload: async () => Promise.reject(new ValidationError("branch_mismatch")) },
      { file: { path: "/tmp/up-2" }, removed },
    );

    const res = await request(app).post("/images").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "That record belongs to another branch." });
    expect(removed).toEqual(["/tmp/up-2"]);
  });

  it("answers 403 for an image the admin may not change, without internals", async () => {
    const app = buildApp({ remove: async () => Promise.reject(new ForbiddenError("content_not_yours")) });

    const res = await request(app).delete("/images/4");

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("hides unexpected errors", async () => {
    const app = buildApp({ update: async () => Promise.reject(new Error("ER_BAD_FIELD secret")) });
    const log = console.error;
    console.error = () => {};

    const res = await request(app).put("/images/4").send({});

    console.error = log;
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("secret");
  });
});
