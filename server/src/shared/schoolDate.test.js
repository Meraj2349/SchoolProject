import { describe, expect, it } from "@jest/globals";
import { addDays, isDay, schoolToday } from "./schoolDate.js";

describe("schoolToday", () => {
  it("is the date in Bangladesh, which turns over at local midnight (18:00 UTC)", () => {
    expect(schoolToday(new Date("2026-03-01T17:59:59Z"))).toBe("2026-03-01");
    expect(schoolToday(new Date("2026-03-01T18:00:00Z"))).toBe("2026-03-02");
  });
});

describe("isDay", () => {
  it.each(["2026-02-28", "2024-02-29"])("accepts the real date %s", (day) => expect(isDay(day)).toBe(true));

  it.each(["2026-02-30", "2026-2-1", "", null, "2026-02-01T00:00:00Z", 20260201])("refuses %p", (day) =>
    expect(isDay(day)).toBe(false),
  );
});

describe("addDays", () => {
  it("moves across month and year ends", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});
