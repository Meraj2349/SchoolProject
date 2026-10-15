import { describe, expect, it } from "vitest";
import { isExpiredSession } from "./httpClient";

const error = (status, headers = {}) => ({ response: { status }, config: { headers } });

describe("isExpiredSession", () => {
  it("is true when a request sent with a token is rejected with 401", () => {
    expect(isExpiredSession(error(401, { Authorization: "Bearer abc" }))).toBe(true);
  });

  it("is false for a wrong password on the login form (no token sent)", () => {
    expect(isExpiredSession(error(401))).toBe(false);
  });

  it("is false for other errors", () => {
    expect(isExpiredSession(error(403, { Authorization: "Bearer abc" }))).toBe(false);
    expect(isExpiredSession({ message: "Network Error" })).toBe(false);
  });
});
