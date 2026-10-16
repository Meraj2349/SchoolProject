import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { ForbiddenError, ValidationError } from "../../../shared/errors/index.js";
import { makeContentController } from "./content.controller.js";

const MESSAGES = { created: "notice_added", updated: "notice_updated", deleted: "notice_deleted", visibility: "notice_visibility_updated" };

// A tiny app around the controller: real HTTP, no database, auth or multer.
function buildApp(useCases, { files, file, role = "branch_admin", branchId = 1 } = {}) {
  const controller = makeContentController({ useCases, messages: MESSAGES, files });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    Object.assign(req, { language: "en", role, branchId, adminId: 7 });
    if (file) req.file = file;
    next();
  });
  app.get("/items", controller.list);
  app.get("/items/visible", controller.listVisible);
  app.get("/items/:id", controller.getVisible);
  app.post("/items", controller.create);
  app.put("/items/:id", controller.update);
  app.put("/items/:id/visibility", controller.setVisibility);
  app.delete("/items/:id", controller.remove);
  return app;
}

const fail = (error) => async () => {
  throw error;
};

function fakeFiles() {
  const discarded = [];
  return { discarded, urlFor: (f) => `/uploads/x/${f.filename}`, discard: async (url) => discarded.push(url) };
}

describe("content controller", () => {
  it("lists for the requesting viewer", async () => {
    let seen;
    const app = buildApp({ list: async (args) => ((seen = args), [{ id: 1 }]) }, { role: "public", branchId: 2 });

    const res = await request(app).get("/items");

    expect(res.body).toEqual({ success: true, data: [{ id: 1 }] });
    expect(seen).toEqual({ viewer: { role: "public", branchId: 2 }, onlyVisible: false });
  });

  it("lists only shown items on the public list", async () => {
    let seen;
    const app = buildApp({ list: async (args) => ((seen = args), []) });

    await request(app).get("/items/visible");

    expect(seen.onlyVisible).toBe(true);
  });

  it("creates with 201, a translated message and the new id", async () => {
    let seen;
    const app = buildApp({ create: async (args) => ((seen = args), 5) });

    const res = await request(app).post("/items").send({ title: "A" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, message: "Notice added successfully.", data: { id: 5 } });
    expect(seen).toEqual({ admin: { role: "branch_admin", branchId: 1 }, input: { title: "A" } });
  });

  it("answers 403 when the admin may not change the item", async () => {
    const app = buildApp({ update: fail(new ForbiddenError("content_not_yours")) });

    const res = await request(app).put("/items/3").send({});

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("passes an uploaded image on as image_url, and discards it when saving fails", async () => {
    const files = fakeFiles();
    let seen;
    const app = buildApp(
      { create: async (args) => ((seen = args), fail(new ValidationError("notice_announcement_required_fields"))()) },
      { files, file: { filename: "new.png" } },
    );

    const res = await request(app).post("/items").send({});

    expect(res.status).toBe(400);
    expect(seen.input.image_url).toBe("/uploads/x/new.png");
    expect(files.discarded).toEqual(["/uploads/x/new.png"]);
  });

  it("never takes an image path from the request body", async () => {
    const files = fakeFiles();
    let seen;
    const app = buildApp({ update: async (args) => ((seen = args), { image_url: "/uploads/x/old.png" }) }, { files });

    await request(app).put("/items/1").send({ title: "A", image_url: "/uploads/routines/b.png" });

    expect(seen.input.image_url).toBeUndefined();
    expect(files.discarded).toEqual([]);
  });

  it("discards the old image after it is replaced", async () => {
    const files = fakeFiles();
    const app = buildApp({ update: async () => ({ image_url: "/uploads/x/old.png" }) }, { files, file: { filename: "new.png" } });

    expect((await request(app).put("/items/1").send({})).status).toBe(200);
    expect(files.discarded).toEqual(["/uploads/x/old.png"]);
  });

  it("keeps the image when the edit sends no new one", async () => {
    const files = fakeFiles();
    const app = buildApp({ update: async () => ({ image_url: "/uploads/x/old.png" }) }, { files });

    await request(app).put("/items/1").send({});

    expect(files.discarded).toEqual([]);
  });

  it("discards the image of a deleted item", async () => {
    const files = fakeFiles();
    const app = buildApp({ remove: async () => ({ image_url: "/uploads/x/gone.png" }) }, { files });

    const res = await request(app).delete("/items/1");

    expect(res.body).toEqual({ success: true, message: "Notice deleted successfully." });
    expect(files.discarded).toEqual(["/uploads/x/gone.png"]);
  });

  it("gets one shown item, or a translated 404", async () => {
    const { NotFoundError } = await import("../../../shared/errors/index.js");
    const app = buildApp({
      getVisible: async ({ id }) => {
        if (id !== "5") throw new NotFoundError("job_circular_not_found");
        return { id: 5 };
      },
    });

    expect((await request(app).get("/items/5")).body).toEqual({ success: true, data: { id: 5 } });
    const missing = await request(app).get("/items/6");
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ success: false, message: "Job circular not found." });
  });
});
