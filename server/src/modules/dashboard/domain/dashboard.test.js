import { describe, expect, it } from "@jest/globals";
import { attendanceToday, collectionRate, currentPeriod } from "./dashboard.js";

describe("attendanceToday", () => {
  it("counts late students as attending", () => {
    expect(attendanceToday({ Present: 6, Late: 2, Absent: 2 })).toEqual({
      present: 6,
      late: 2,
      absent: 2,
      recorded: 10,
      rate: 80,
    });
  });

  it("has no rate when nothing was recorded yet", () => {
    expect(attendanceToday({})).toEqual({ present: 0, late: 0, absent: 0, recorded: 0, rate: null });
  });

  it("rounds the rate to one decimal", () => {
    expect(attendanceToday({ Present: 2, Absent: 1 }).rate).toBe(66.7);
  });
});

describe("collectionRate", () => {
  it("is the share of the billed amount collected, in percent", () => {
    expect(collectionRate({ billed: 2000, collected: 500 })).toBe(25);
  });

  it("is null when nothing was billed", () => {
    expect(collectionRate({ billed: 0, collected: 0 })).toBeNull();
  });
});

describe("currentPeriod", () => {
  it("takes the year and month from a YYYY-MM-DD date", () => {
    expect(currentPeriod("2026-10-15")).toEqual({ year: 2026, month: 10 });
  });
});
