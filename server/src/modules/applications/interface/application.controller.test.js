import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeApplicationController } from "./application.controller.js";

function buildApp(useCases, { role = "branch_admin", branchId = 1 } = {}) {
  const controller = makeApplicationController({ useCases });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    Object.assign(req, { language: "en", role, branchId });
    next();
  });
  app.post("/applications", controller.submit);
  app.get("/applications", controller.list);
  app.get("/applications/:id", controller.get);
  app.put("/applications/:id/status", controller.setStatus);
  app.delete("/applications/:id", controller.remove);
  return app;
}

describe("application controller", () => {
  it("accepts a submission with 201 and the new id", async () => {
    const app = buildApp({ submit: async () => ({ id: 8 }) });

    const res = await request(app).post("/applications").send({ applicant_name: "A" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ success: true, data: { id: 8 } });
  });

  it("explains a refused submission", async () => {
    const app = buildApp({ submit: async () => Promise.reject(new ValidationError("application_branch_required")) });

    const res = await request(app).post("/applications").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Choose the branch (campus) you are applying to." });
  });

  it("lists the admin's applications with a count", async () => {
    let seen;
    const app = buildApp({ list: async (args) => ((seen = args), [{ id: 1 }, { id: 2 }]) });

    const res = await request(app).get("/applications");

    expect(res.body).toEqual({ success: true, data: [{ id: 1 }, { id: 2 }], count: 2 });
    expect(seen).toEqual({ admin: { role: "branch_admin", branchId: 1 } });
  });

  it("passes the status on and answers 404 for an application out of reach", async () => {
    let seen;
    const ok = buildApp({ setStatus: async (args) => ((seen = args), { id: 3, status: "accepted" }) });
    const missing = buildApp({ setStatus: async () => Promise.reject(new NotFoundError("application_not_found")) });

    expect((await request(ok).put("/applications/3/status").send({ status: "accepted" })).status).toBe(200);
    expect(seen).toEqual({ admin: { role: "branch_admin", branchId: 1 }, id: "3", status: "accepted" });
    expect((await request(missing).put("/applications/9/status").send({ status: "accepted" })).status).toBe(404);
  });
});
