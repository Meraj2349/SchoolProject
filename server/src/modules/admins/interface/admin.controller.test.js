import { describe, expect, it, jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import { ConflictError, NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeAdminController } from "./admin.controller.js";

// A tiny app around the controller: real HTTP, no database or auth.
function buildApp(useCases, { adminId = 7 } = {}) {
  const controller = makeAdminController({ useCases });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.language = "en";
    req.adminId = adminId;
    next();
  });
  app.get("/guarded", controller.requireSuperAdmin, (_req, res) => res.json({ ok: true }));
  app.get("/admins", controller.list);
  app.post("/admins", controller.create);
  app.put("/admins/:id", controller.update);
  app.delete("/admins/:id", controller.remove);
  return app;
}

const fail = (error) => async () => {
  throw error;
};

describe("admin controller", () => {
  it("GET lists the admins, telling the use case who is asking", async () => {
    const listAdmins = jest.fn(async () => [{ id: 7, is_you: true }]);

    const res = await request(buildApp({ listAdmins })).get("/admins");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [{ id: 7, is_you: true }] });
    expect(listAdmins).toHaveBeenCalledWith({ currentAdminId: 7 });
  });

  it("POST creates an admin and answers 201", async () => {
    const createAdmin = jest.fn(async () => ({ id: 3, username: "karim" }));

    const res = await request(buildApp({ createAdmin })).post("/admins").send({ Username: "karim" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, message: "Admin created successfully.", data: { id: 3, username: "karim" } });
    expect(createAdmin).toHaveBeenCalledWith({ Username: "karim" });
  });

  it("PUT updates the admin named in the URL", async () => {
    const updateAdmin = jest.fn(async () => ({ id: 3 }));

    const res = await request(buildApp({ updateAdmin })).put("/admins/3").send({ branch_id: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: "Admin updated.", data: { id: 3 } });
    expect(updateAdmin).toHaveBeenCalledWith({ id: "3", input: { branch_id: 2 }, currentAdminId: 7 });
  });

  it("DELETE removes the admin", async () => {
    const deleteAdmin = jest.fn(async () => ({ id: 3 }));

    const res = await request(buildApp({ deleteAdmin })).delete("/admins/3");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, message: "Admin removed." });
    expect(deleteAdmin).toHaveBeenCalledWith({ id: "3", currentAdminId: 7 });
  });

  it.each([
    [new ValidationError("admin_email_invalid"), 400, "Please enter a valid email address."],
    [new NotFoundError("admin_not_found"), 404, "Admin not found."],
    [new ConflictError("admin_last_super_admin"), 409, "There must always be at least one super admin."],
  ])("translates %s into %i", async (error, status, message) => {
    const res = await request(buildApp({ updateAdmin: fail(error) })).put("/admins/3").send({});

    expect(res.status).toBe(status);
    expect(res.body).toEqual({ success: false, message });
  });

  it("does not leak unexpected errors", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});

    const res = await request(buildApp({ listAdmins: fail(new Error("ER_NO_SUCH_TABLE Admin")) })).get("/admins");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: "Could not load the admins." });
    log.mockRestore();
  });

  describe("requireSuperAdmin (checks the database, not the login token)", () => {
    const guarded = (currentAdmin) => request(buildApp({ currentAdmin })).get("/guarded");

    it("lets a current super admin through", async () => {
      const currentAdmin = jest.fn(async () => ({ id: 7, role: "super_admin" }));

      const res = await guarded(currentAdmin);

      expect(res.body).toEqual({ ok: true });
      expect(currentAdmin).toHaveBeenCalledWith(7);
    });

    it("refuses an admin who is no longer a super admin with 403", async () => {
      const res = await guarded(async () => ({ id: 7, role: "branch_admin" }));

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ success: false, message: "Access forbidden." });
    });

    it("answers 401 for a removed admin, so the browser logs them out", async () => {
      const res = await guarded(async () => null);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ success: false, message: "Unauthorized access." });
    });

    it("hides database errors", async () => {
      const log = jest.spyOn(console, "error").mockImplementation(() => {});

      const res = await guarded(fail(new Error("ER_CON_COUNT_ERROR")));

      expect(res.status).toBe(500);
      expect(JSON.stringify(res.body)).not.toContain("ER_");
      log.mockRestore();
    });
  });
});
