import { describe, expect, it } from "@jest/globals";
import express from "express";
import request from "supertest";
import { ConflictError, NotFoundError } from "../../../shared/errors/index.js";
import { makeResultController } from "./result.controller.js";

function buildApp(useCases, { branchId = 1 } = {}) {
  const controller = makeResultController({ useCases });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.language = "en";
    req.branchId = branchId;
    next();
  });
  app.get("/results/search", controller.search);
  app.post("/results", controller.create);
  app.put("/results/:id", controller.update);
  app.delete("/results/:id", controller.remove);
  return app;
}

const fail = (error) => async () => {
  throw error;
};

describe("result controller", () => {
  it("GET /results/search passes the query and the branch, and gives the rows", async () => {
    let asked;
    const app = buildApp({ search: async (args) => ((asked = args), [{ ResultID: 1 }]) }, { branchId: null });

    const res = await request(app).get("/results/search").query({ firstName: "Rahim" });

    expect(asked).toEqual({ branchId: null, query: { firstName: "Rahim" } });
    expect(res.body).toEqual({ success: true, data: [{ ResultID: 1 }] });
  });

  it("POST /results answers 201 with the new id", async () => {
    const res = await request(buildApp({ addResult: async () => 21 })).post("/results").send({});

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, message: "Result added successfully.", data: { resultId: 21 } });
  });

  it("PUT /results/:id changes the marks", async () => {
    let asked;
    const res = await request(buildApp({ changeMarks: async (args) => (asked = args) })).put("/results/20").send({ MarksObtained: 81 });

    expect(asked).toEqual({ branchId: 1, id: "20", input: { MarksObtained: 81 } });
    expect(res.body).toEqual({ success: true, message: "Result updated successfully." });
  });

  it("DELETE /results/:id answers 200", async () => {
    const res = await request(buildApp({ removeResult: async () => {} })).delete("/results/20");

    expect(res.body).toEqual({ success: true, message: "Result deleted successfully." });
  });

  it.each([
    [new ConflictError("result_duplicate"), 409, "A result for this student, subject, and exam already exists."],
    [new NotFoundError("result_not_found"), 404, "Result not found."],
  ])("translates %p", async (error, status, message) => {
    const res = await request(buildApp({ addResult: fail(error) })).post("/results").send({});

    expect(res.status).toBe(status);
    expect(res.body).toEqual({ success: false, message });
  });

  it("never sends an unexpected error's text", async () => {
    const res = await request(buildApp({ search: fail(new Error("ER_PARSE_ERROR near SELECT")) })).get("/results/search");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: "Failed to fetch results." });
  });
});
