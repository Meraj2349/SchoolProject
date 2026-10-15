import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeFeeController } from "./fee.controller.js";

// A tiny app around the controller: real HTTP, fake use cases, no auth or DB.
// The auth middleware normally sets req.branchId and req.adminId.
function buildApp({ setup = {}, billing = {} } = {}) {
  const controller = makeFeeController({ setup, billing });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.language = "en";
    req.branchId = 1;
    req.adminId = 5;
    next();
  });
  app.get("/settings", controller.getSettings);
  app.put("/settings", controller.updateSettings);
  app.get("/structures", controller.listStructures);
  app.post("/structures", controller.createStructure);
  app.put("/structures/:id", controller.updateStructure);
  app.delete("/structures/:id", controller.deleteStructure);
  app.post("/heads", controller.createHead);
  app.get("/discounts", controller.listDiscounts);
  app.post("/invoices/generate", controller.generateInvoices);
  app.post("/invoices/apply-late-fines", controller.applyLateFines);
  app.get("/invoices", controller.listInvoices);
  app.get("/invoices/:id", controller.getInvoice);
  app.post("/invoices/:id/payments", controller.recordPayment);
  app.get("/payments/:id", controller.getReceipt);
  app.post("/payments/:id/void", controller.voidPayment);
  app.get("/students/:id/ledger", controller.studentLedger);
  app.get("/reports/summary", controller.monthlySummary);
  return app;
}

const fail = (error) => async () => {
  throw error;
};

describe("fee controller", () => {
  it("GET /settings returns the branch's settings", async () => {
    let branchId;
    const app = buildApp({ setup: { getSettings: async (b) => ((branchId = b), { due_day: 10 }) } });

    const res = await request(app).get("/settings");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: { due_day: 10 } });
    expect(branchId).toBe(1);
  });

  it("PUT /settings returns a translated success message", async () => {
    const app = buildApp({ setup: { updateSettings: async ({ input }) => input } });

    const res = await request(app).put("/settings").send({ late_fine: 50 });

    expect(res.body).toEqual({ success: true, message: "Fee settings saved.", data: { late_fine: 50 } });
  });

  it("returns 400 with a translated message for a validation error", async () => {
    const app = buildApp({ setup: { createStructure: fail(new ValidationError("fee_structure_exists")) } });

    const res = await request(app).post("/structures").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: "Tuition for this class and year already exists." });
  });

  it("POST /structures returns 201 with the created row", async () => {
    const app = buildApp({ setup: { createStructure: async ({ branchId, input }) => ({ id: 3, branchId, ...input }) } });

    const res = await request(app).post("/structures").send({ class_name: "Class 5" });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ id: 3, branchId: 1, class_name: "Class 5" });
  });

  it("passes the route id and query filters to the use cases", async () => {
    let args;
    const app = buildApp({ setup: { updateStructure: async (a) => (args = a) } });

    await request(app).put("/structures/4").send({ monthly_tuition: 1 });

    expect(args).toEqual({ branchId: 1, id: "4", input: { monthly_tuition: 1 } });
  });

  it("GET /structures and /discounts pass their query filters", async () => {
    const calls = [];
    const app = buildApp({
      setup: {
        listStructures: async (a) => (calls.push(a), []),
        listDiscounts: async (a) => (calls.push(a), []),
      },
    });

    await request(app).get("/structures?academic_year=2026");
    await request(app).get("/discounts?student_id=7");

    expect(calls).toEqual([
      { branchId: 1, academicYear: "2026" },
      { branchId: 1, studentId: "7" },
    ]);
  });

  it("DELETE /structures/:id returns 404 when missing", async () => {
    const app = buildApp({ setup: { deleteStructure: fail(new NotFoundError("fee_structure_not_found")) } });

    const res = await request(app).delete("/structures/9");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Class tuition not found.");
  });

  it("POST /invoices/generate passes the admin and returns the counts", async () => {
    let args;
    const app = buildApp({ billing: { generateMonthlyInvoices: async (a) => ((args = a), { created: 2 }) } });

    const res = await request(app).post("/invoices/generate").send({ year: 2026, month: 3 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, message: "Invoices generated.", data: { created: 2 } });
    expect(args).toEqual({ branchId: 1, adminId: 5, input: { year: 2026, month: 3 } });
  });

  it("GET /invoices passes the query string as filters", async () => {
    let args;
    const app = buildApp({ billing: { listInvoices: async (a) => ((args = a), []) } });

    await request(app).get("/invoices?status=unpaid&month=3");

    expect(args).toEqual({ branchId: 1, filters: { status: "unpaid", month: "3" } });
  });

  it("POST /invoices/:id/payments returns 201 with the receipt", async () => {
    let args;
    const app = buildApp({ billing: { recordPayment: async (a) => ((args = a), { payment: { id: 1 } }) } });

    const res = await request(app).post("/invoices/4/payments").send({ amount: 100, method: "cash" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, message: "Payment recorded.", data: { payment: { id: 1 } } });
    expect(args).toEqual({ branchId: 1, adminId: 5, invoiceId: "4", input: { amount: 100, method: "cash" } });
  });

  it("POST /payments/:id/void voids with the reason", async () => {
    let args;
    const app = buildApp({ billing: { voidPayment: async (a) => ((args = a), { id: 4 }) } });

    const res = await request(app).post("/payments/2/void").send({ reason: "Typo" });

    expect(res.body.message).toBe("Payment voided.");
    expect(args).toEqual({ branchId: 1, adminId: 5, paymentId: "2", input: { reason: "Typo" } });
  });

  it("GET /reports/summary passes the period from the query", async () => {
    let args;
    const app = buildApp({ billing: { monthlySummary: async (a) => ((args = a), {}) } });

    await request(app).get("/reports/summary?year=2026&month=3");

    expect(args).toEqual({ branchId: 1, input: { year: "2026", month: "3" } });
  });

  it("returns 500 without leaking internals on an unexpected error", async () => {
    const app = buildApp({ billing: { getReceipt: fail(new Error("ER_LOCK_DEADLOCK at 10.0.0.5")) } });

    const res = await request(app).get("/payments/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: "Internal server error." });
  });
});
