import { describe, expect, it } from "vitest";
import { attendanceSummary, statusKey } from "./attendanceSummary";

describe("attendanceSummary", () => {
  it("counts present and absent separately from late and excused", () => {
    const records = ["Present", "present", "Absent", "Late", "Excused"].map((Status) => ({ Status }));
    expect(attendanceSummary(records)).toEqual({ total: 5, present: 2, absent: 1, rate: 40 });
  });

  it("has a zero rate when there are no records", () => {
    expect(attendanceSummary([])).toEqual({ total: 0, present: 0, absent: 0, rate: 0 });
  });
});

describe("statusKey", () => {
  it("normalises known statuses and leaves unknown ones out", () => {
    expect(statusKey(" Late ")).toBe("late");
    expect(statusKey("Holiday")).toBeNull();
    expect(statusKey(null)).toBeNull();
  });
});
