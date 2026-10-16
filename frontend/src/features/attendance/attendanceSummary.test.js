import { describe, expect, it } from "vitest";
import { attendanceSummary, statusKey } from "./attendanceSummary";

describe("attendanceSummary", () => {
  it("counts the days; late students came, students on leave were not expected", () => {
    const records = ["Present", "present", "Absent", "Late", "Leave"].map((Status) => ({ Status }));
    expect(attendanceSummary(records)).toEqual({ total: 5, present: 2, absent: 1, rate: 75 });
  });

  it("rounds the rate to one decimal", () => {
    const records = ["Present", "Absent", "Absent"].map((Status) => ({ Status }));
    expect(attendanceSummary(records).rate).toBe(33.3);
  });

  it("has a zero rate when there are no records", () => {
    expect(attendanceSummary([])).toEqual({ total: 0, present: 0, absent: 0, rate: 0 });
  });
});

describe("statusKey", () => {
  it("normalises known statuses and leaves unknown ones out", () => {
    expect(statusKey(" Late ")).toBe("late");
    expect(statusKey("Leave")).toBe("leave");
    expect(statusKey("Holiday")).toBeNull();
    expect(statusKey(null)).toBeNull();
  });
});
