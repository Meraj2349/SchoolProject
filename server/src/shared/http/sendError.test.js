import { describe, expect, it, jest } from "@jest/globals";
import { ConflictError, NotFoundError, ValidationError } from "../errors/index.js";
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
  ])("answers %s with %i and the translated message", (error, status) => {
    const res = fakeRes();

    sendError(res, error, "en");

    expect(res.statusCode).toBe(status);
    expect(res.body.success).toBe(false);
    expect(res.body.message).not.toBe(error.code);
  });

  it("hides unknown errors behind the fallback message", () => {
    const res = fakeRes();
    const log = jest.spyOn(console, "error").mockImplementation(() => {});

    sendError(res, new Error("ER_ACCESS_DENIED secret detail"), "en");

    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain("secret");
    log.mockRestore();
  });
});
