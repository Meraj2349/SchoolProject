import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeBranchController } from "./branch.controller.js";

// Builds a tiny app around the controller so we test real HTTP behaviour
// without the database, Cloudinary, auth or multer.
function buildApp(useCases, { file, removedFiles = [] } = {}) {
  const controller = makeBranchController({
    useCases,
    removeFile: async (path) => removedFiles.push(path),
  });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.language = "en";
    if (file) req.file = file;
    next();
  });
  app.get("/branches", controller.list);
  app.get("/branches/stats", controller.stats);
  app.get("/branches/:id", controller.getById);
  app.post("/branches", controller.create);
  app.put("/branches/:id", controller.update);
  app.delete("/branches/:id", controller.remove);
  return app;
}

const fail = (error) => async () => {
  throw error;
};

describe("branch controller", () => {
  it("GET /branches returns 200 with the list", async () => {
    const app = buildApp({ listBranches: async () => [{ id: 1 }] });

    const res = await request(app).get("/branches");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [{ id: 1 }] });
  });

  it("GET /branches/stats returns 200 with the stats", async () => {
    const app = buildApp({ getBranchStats: async () => [{ id: 1 }] });

    const res = await request(app).get("/branches/stats");

    expect(res.body).toEqual({ success: true, data: [{ id: 1 }] });
  });

  it("GET /branches/:id returns 404 with a translated message when missing", async () => {
    const app = buildApp({ getBranch: fail(new NotFoundError("branch_not_found")) });

    const res = await request(app).get("/branches/9");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ success: false, message: "Branch not found." });
  });

  it("POST /branches returns 201 with the created branch", async () => {
    const app = buildApp({
      createBranch: async ({ input }) => ({ id: 2, ...input }),
    });

    const res = await request(app).post("/branches").send({ name_en: "North" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: "Branch created successfully.",
      data: { id: 2, name_en: "North" },
    });
  });

  it("POST /branches returns 400 on a validation error", async () => {
    const app = buildApp({ createBranch: fail(new ValidationError("branch_name_required")) });

    const res = await request(app).post("/branches").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/branch name/);
  });

  it("passes the uploaded file to the use case and always removes the temp file", async () => {
    const removedFiles = [];
    let received;
    const app = buildApp(
      {
        createBranch: async (args) => {
          received = args.image;
          throw new ValidationError("branch_name_required");
        },
      },
      { file: { path: "/tmp/upload.png" }, removedFiles },
    );

    await request(app).post("/branches").send({});

    expect(received).toEqual({ path: "/tmp/upload.png" });
    expect(removedFiles).toEqual(["/tmp/upload.png"]);
  });

  it("PUT /branches/:id returns 200 after updating", async () => {
    let args;
    const app = buildApp({ updateBranch: async (a) => (args = a) });

    const res = await request(app).put("/branches/1").send({ name_en: "New" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Branch updated successfully." });
    expect(args).toMatchObject({ id: "1", input: { name_en: "New" }, image: null });
  });

  it("DELETE /branches/:id returns the deleted branch", async () => {
    const app = buildApp({ deleteBranch: async () => ({ id: 1 }) });

    const res = await request(app).delete("/branches/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Branch deleted successfully.",
      data: { id: 1 },
    });
  });

  it("returns 500 without leaking internals on an unexpected error", async () => {
    const app = buildApp({ listBranches: fail(new Error("ECONNREFUSED 10.0.0.5")) });

    const res = await request(app).get("/branches");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: "Failed to fetch branches." });
  });
});
