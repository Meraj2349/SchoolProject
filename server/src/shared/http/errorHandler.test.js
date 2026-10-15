import { describe, expect, it, jest } from "@jest/globals";
import express from "express";
import multer from "multer";
import request from "supertest";
import { ValidationError } from "../errors/index.js";
import { errorHandler } from "./errorHandler.js";

// Errors that reach Express from middleware (e.g. multer) instead of a controller.
const appThrowing = (error) => {
  const app = express();
  app.use((req, _res, next) => {
    req.language = "en";
    next();
  });
  app.post("/", (_req, _res, next) => next(error));
  app.use(errorHandler);
  return app;
};

describe("errorHandler", () => {
  it("answers a too-large upload with a translated 400", async () => {
    const res = await request(appThrowing(new multer.MulterError("LIMIT_FILE_SIZE"))).post("/");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "The image is too large. The limit is 5 MB." });
  });

  it("answers other upload problems with a translated 400", async () => {
    const res = await request(appThrowing(new multer.MulterError("LIMIT_UNEXPECTED_FILE"))).post("/");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("The file could not be uploaded.");
  });

  it("passes domain errors through sendError", async () => {
    const res = await request(appThrowing(new ValidationError("image_type_not_allowed"))).post("/");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Only JPEG, PNG, GIF or WEBP images are allowed.");
  });

  it("hides anything else behind a generic 500", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    const res = await request(appThrowing(new Error("ENOENT /secret/path"))).post("/");
    log.mockRestore();

    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("secret");
  });
});
