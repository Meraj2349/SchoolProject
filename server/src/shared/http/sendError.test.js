import { describe, expect, it, jest } from "@jest/globals";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "../errors/index.js";
import { sendError } from "./sendError.js";

function fakeRes() {
  const res = { statusCode: null, body: null };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (body) => ((res.body = body), res);
  return res;
}

describe("sendError", () => {
  it.each([
    [new ValidationError("branch_no_fields"), 400],
    [new NotFoundError("branch_not_found"), 404],
    [new ConflictError("admin_last_super_admin"), 409],
    [new ForbiddenError("content_not_yours"), 403],
  ])("answers %s with %i and the translated message", (error, status) => {
    const res = fakeRes();

    sendError(res, error, "en");

    expect(res.statusCode).toBe(status);
    expect(res.body.success).toBe(false);
    expect(res.body.message).not.toBe(error.code);
  });

  it("passes on an error's details, e.g. what still uses a branch", () => {
    const res = fakeRes();

    sendError(res, new ConflictError("branch_in_use", "branch_in_use", { details: { students: 3 } }), "en");

    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({ success: false, message: expect.any(String), data: { students: 3 } });
  });

  it("hides unknown errors behind the fallback message", () => {
    const res = fakeRes();
    const log = jest.spyOn(console, "error").mockImplementation(() => {});

    sendError(res, new Error("ER_ACCESS_DENIED secret detail"), "en");

    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("secret");
    log.mockRestore();
  });

  it("never logs the SQL of a failed query, which can hold people's details", () => {
    const res = fakeRes();
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    const error = Object.assign(new Error("Data too long for column 'post_title_en'"), {
      code: "ER_DATA_TOO_LONG",
      sql: "INSERT INTO JobApplications SET full_name = 'Nusrat Jahan', phone = '01712345678'",
      sqlMessage: "Data too long",
    });

    sendError(res, error, "en");

    const logged = log.mock.calls.flat().map((part) => (typeof part === "string" ? part : JSON.stringify(part) + String(part?.stack ?? ""))).join(" ");
    expect(logged).toContain("ER_DATA_TOO_LONG");
    expect(logged).not.toContain("01712345678");
    expect(logged).not.toContain("Nusrat");
    log.mockRestore();
  });
});
