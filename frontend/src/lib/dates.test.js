import { describe, expect, it } from "vitest";
import { localDateString } from "./dates";

describe("localDateString", () => {
  it("formats the local calendar date as YYYY-MM-DD", () => {
    expect(localDateString(new Date(2026, 0, 5, 12, 0))).toBe("2026-01-05");
  });

  it("keeps the local day just after midnight (toISOString would give the UTC day)", () => {
    // 00:30 local on 15 Oct is still 14 Oct in UTC for any timezone ahead of UTC.
    expect(localDateString(new Date(2026, 9, 15, 0, 30))).toBe("2026-10-15");
  });
});
