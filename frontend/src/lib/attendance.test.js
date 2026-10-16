import { describe, expect, it } from "vitest";
import { ATTENDANCE_STATUSES, attendanceTotals, formatSchoolTime, schoolDaysOf, statusCode } from "./attendance";

describe("attendance statuses", () => {
  it("are Present, Absent, Late and Leave", () => {
    expect(ATTENDANCE_STATUSES).toEqual(["Present", "Absent", "Late", "Leave"]);
  });

  it("have short codes that tell Late and Leave apart, in both languages", () => {
    expect(ATTENDANCE_STATUSES.map((s) => statusCode(s, "en"))).toEqual(["P", "A", "L", "Lv"]);
    expect(ATTENDANCE_STATUSES.map((s) => statusCode(s, "bn"))).toEqual(["উ", "অ", "দে", "ছু"]);
    expect(statusCode(null, "en")).toBe("–");
  });
});

describe("attendanceTotals", () => {
  it("counts each status; late students came, students on leave were not expected", () => {
    expect(attendanceTotals(["Present", "Present", "Late", "Absent", "Leave", null, undefined])).toEqual({
      present: 2, absent: 1, late: 1, leave: 1, marked: 5, rate: 75,
    });
  });

  it("rounds the rate to the decimals asked for", () => {
    expect(attendanceTotals(["Present", "Absent", "Absent"]).rate).toBe(33);
    expect(attendanceTotals(["Present", "Absent", "Absent"], { decimals: 1 }).rate).toBe(33.3);
  });

  it("has no rate when nobody was expected", () => {
    expect(attendanceTotals(["Leave"]).rate).toBeNull();
    expect(attendanceTotals([]).rate).toBeNull();
  });
});

describe("formatSchoolTime", () => {
  it("is the time in Bangladesh, 24-hour, in the page's language", () => {
    expect(formatSchoolTime("2026-10-15T03:15:00.000Z", "en")).toBe("09:15");
    expect(formatSchoolTime("2026-10-15T13:05:00.000Z", "bn")).toBe("১৯:০৫");
    expect(formatSchoolTime(null, "en")).toBe("");
  });
});

describe("schoolDaysOf", () => {
  const isWeekend = (day) => day.endsWith("6") || day.endsWith("7"); // pretend the 6th and 7th are Friday and Saturday

  it("is every weekday, plus a weekend day on which attendance was taken", () => {
    const students = [{ attendance: { "2026-10-07": "Present" } }, { attendance: {} }];
    expect(schoolDaysOf(["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08"], students, isWeekend)).toEqual([
      "2026-10-05",
      "2026-10-07",
      "2026-10-08",
    ]);
  });
});
