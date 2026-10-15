import { describe, expect, it } from "@jest/globals";
import { firstDayOf, isDate, lastDayOf } from "./dates.js";

describe("isDate", () => {
  it("accepts real calendar dates only", () => {
    expect(isDate("2028-02-29")).toBe(true);
    expect(isDate("2026-02-29")).toBe(false);
    expect(isDate("2026-1-5")).toBe(false);
    expect(isDate(undefined)).toBe(false);
  });
});

describe("firstDayOf / lastDayOf", () => {
  it("returns the month's bounds, including leap years", () => {
    expect(firstDayOf({ year: 2026, month: 3 })).toBe("2026-03-01");
    expect(lastDayOf({ year: 2026, month: 2 })).toBe("2026-02-28");
    expect(lastDayOf({ year: 2028, month: 2 })).toBe("2028-02-29");
    expect(lastDayOf({ year: 2026, month: 12 })).toBe("2026-12-31");
  });
});
