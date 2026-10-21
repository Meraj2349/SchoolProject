import { describe, expect, it } from "@jest/globals";
import { ForbiddenError, ValidationError } from "../../../shared/errors/index.js";
import {
  STATUSES,
  adminTakenAt,
  attendanceRate,
  buildGrid,
  buildOverview,
  parseDay,
  parseStatus,
  teacherTakenAt,
  toDayEntries,
} from "./attendance.js";

const expectError = (fn, Type, code) => {
  let error;
  try {
    fn();
  } catch (caught) {
    error = caught;
  }
  expect(error).toBeInstanceOf(Type);
  expect(error.code).toBe(code);
  return error;
};

// 10:00 in Dhaka on 2026-03-10.
const NOW = new Date("2026-03-10T04:00:00Z");

describe("statuses", () => {
  it("are Present, Absent, Late and Leave", () => {
    expect(STATUSES).toEqual(["Present", "Absent", "Late", "Leave"]);
  });

  it.each([["present", "Present"], ["ABSENT", "Absent"], [" Late ", "Late"], ["leave", "Leave"]])(
    "reads %p as %p",
    (input, status) => expect(parseStatus(input)).toBe(status),
  );

  it.each(["Excused", "", null, 3])("refuses %p", (input) => {
    expectError(() => parseStatus(input), ValidationError, "attendance_status_invalid");
  });
});

describe("parseDay", () => {
  it("accepts a real date and refuses anything else", () => {
    expect(parseDay("2026-03-10")).toBe("2026-03-10");
    expectError(() => parseDay("2026-02-30"), ValidationError, "attendance_date_invalid");
    expectError(() => parseDay(undefined), ValidationError, "attendance_date_invalid");
  });
});

describe("toDayEntries", () => {
  const roster = [11, 12, 13];

  it("gives every student of the class exactly one status, in student order", () => {
    expect(
      toDayEntries(
        [
          { studentId: 13, status: "absent" },
          { studentId: "11", status: "Present" },
          { studentId: 12, status: "Leave" },
        ],
        roster,
      ),
    ).toEqual([
      { studentId: 11, status: "Present" },
      { studentId: 12, status: "Leave" },
      { studentId: 13, status: "Absent" },
    ]);
  });

  it("names the students left out of a whole day", () => {
    const error = expectError(
      () => toDayEntries([{ studentId: 11, status: "Present" }], roster),
      ValidationError,
      "attendance_entries_incomplete",
    );
    expect(error.details).toEqual({ missing: [12, 13] });
  });

  it("accepts some students only when asked to (one cell of the grid)", () => {
    expect(toDayEntries([{ studentId: 12, status: "Late" }], roster, { complete: false })).toEqual([
      { studentId: 12, status: "Late" },
    ]);
  });

  it("refuses a student who is not in the class", () => {
    expectError(
      () => toDayEntries([{ studentId: 99, status: "Present" }], roster, { complete: false }),
      ValidationError,
      "attendance_student_not_in_class",
    );
  });

  it("refuses the same student twice", () => {
    expectError(
      () => toDayEntries([{ studentId: 11, status: "Present" }, { studentId: 11, status: "Absent" }], roster, { complete: false }),
      ValidationError,
      "attendance_entries_duplicate",
    );
  });

  it.each([[undefined], [[]], ["x"]])("refuses %p as the entries", (entries) => {
    expectError(() => toDayEntries(entries, roster), ValidationError, "attendance_entries_required");
  });

  it.each([[{ studentId: "abc", status: "Present" }], [{ studentId: 0, status: "Present" }], [null]])(
    "refuses the malformed entry %p",
    (entry) => {
      expectError(() => toDayEntries([entry], roster, { complete: false }), ValidationError, "attendance_entries_invalid");
    },
  );
});

describe("teacherTakenAt: a class teacher may mark today only", () => {
  it("accepts today, taken now", () => {
    expect(teacherTakenAt({ date: "2026-03-10", now: NOW })).toEqual(NOW);
  });

  it("keeps when the phone took today's attendance", () => {
    const takenAt = "2026-03-10T03:15:00Z";
    expect(teacherTakenAt({ date: "2026-03-10", takenAt, now: NOW })).toEqual(new Date(takenAt));
  });

  it("never dates a save later than now, whatever the phone's clock says", () => {
    expect(teacherTakenAt({ date: "2026-03-10", takenAt: "2026-03-10T09:00:00Z", now: NOW })).toEqual(NOW);
  });

  it("uses now for today when the phone's clock is a day behind", () => {
    expect(teacherTakenAt({ date: "2026-03-10", takenAt: "2026-03-09T05:00:00Z", now: NOW })).toEqual(NOW);
  });

  it("locks an earlier day", () => {
    expectError(() => teacherTakenAt({ date: "2026-03-09", now: NOW }), ForbiddenError, "attendance_day_locked");
  });

  it("locks a later day", () => {
    expectError(() => teacherTakenAt({ date: "2026-03-11", now: NOW }), ForbiddenError, "attendance_day_locked");
  });

  it("lets an offline phone sync yesterday's attendance it took yesterday, within 48 hours", () => {
    const takenAt = "2026-03-09T04:30:00Z"; // 10:30 in Dhaka on 2026-03-09
    expect(teacherTakenAt({ date: "2026-03-09", takenAt, now: NOW })).toEqual(new Date(takenAt));
  });

  it("locks an offline save synced more than 48 hours after it was taken", () => {
    expectError(
      () => teacherTakenAt({ date: "2026-03-07", takenAt: "2026-03-07T03:59:00Z", now: NOW }),
      ForbiddenError,
      "attendance_day_locked",
    );
  });

  it("locks a past day that was not taken on that day", () => {
    expectError(
      () => teacherTakenAt({ date: "2026-03-08", takenAt: "2026-03-09T04:00:00Z", now: NOW }),
      ForbiddenError,
      "attendance_day_locked",
    );
  });

  it("refuses a taken-at time that is not a time", () => {
    expectError(() => teacherTakenAt({ date: "2026-03-10", takenAt: "soon", now: NOW }), ValidationError, "attendance_taken_at_invalid");
  });
});

describe("adminTakenAt: an admin may correct any past day", () => {
  it("accepts today and earlier days, taken now", () => {
    expect(adminTakenAt({ date: "2026-03-10", now: NOW })).toEqual(NOW);
    expect(adminTakenAt({ date: "2025-01-01", now: NOW })).toEqual(NOW);
  });

  it("refuses a day that has not come yet", () => {
    expectError(() => adminTakenAt({ date: "2026-03-11", now: NOW }), ValidationError, "attendance_date_future");
  });
});

describe("attendanceRate", () => {
  it("counts late students as attending and leaves out students on leave", () => {
    expect(attendanceRate({ Present: 6, Late: 2, Absent: 2, Leave: 5 })).toBe(80);
  });

  it("is null when nobody was expected", () => {
    expect(attendanceRate({ Leave: 3 })).toBeNull();
  });

  it("rounds to two decimals", () => {
    expect(attendanceRate({ Present: 2, Absent: 1 })).toBe(66.67);
  });
});

describe("buildGrid", () => {
  const main = { BranchID: 1, BranchNameBn: "প্রধান", BranchNameEn: "Main" };
  const north = { BranchID: 2, BranchNameBn: "উত্তর", BranchNameEn: "North" };
  const MAIN = { id: 1, nameBn: "প্রধান", nameEn: "Main" };
  const NORTH = { id: 2, nameBn: "উত্তর", nameEn: "North" };

  it("lists every student (by roll, numerically) with their branch and status per day, and the days that have any record", () => {
    const rows = [
      { StudentID: 2, FirstName: "Karim", LastName: "K", RollNumber: "10", ClassDate: "2026-03-02", Status: "Leave", ...main },
      { StudentID: 1, FirstName: "Rahim", LastName: "R", RollNumber: "2", ClassDate: "2026-03-01", Status: "Present", ...main },
      { StudentID: 1, FirstName: "Rahim", LastName: "R", RollNumber: "2", ClassDate: "2026-03-02", Status: "Absent", ...main },
      { StudentID: 3, FirstName: "Nadia", LastName: "N", RollNumber: "3", ClassDate: null, Status: null, ...main },
    ];

    expect(buildGrid(rows)).toEqual({
      students: [
        { StudentID: 1, FirstName: "Rahim", LastName: "R", RollNumber: "2", branch: MAIN, attendance: { "2026-03-01": "Present", "2026-03-02": "Absent" } },
        { StudentID: 3, FirstName: "Nadia", LastName: "N", RollNumber: "3", branch: MAIN, attendance: {} },
        { StudentID: 2, FirstName: "Karim", LastName: "K", RollNumber: "10", branch: MAIN, attendance: { "2026-03-02": "Leave" } },
      ],
      dates: ["2026-03-01", "2026-03-02"],
      branches: [MAIN],
    });
  });

  it("orders students by branch, then roll, and lists each branch once, by id", () => {
    const rows = [
      { StudentID: 5, FirstName: "Nadia", RollNumber: "1", ClassDate: null, Status: null, ...north },
      { StudentID: 2, FirstName: "Karim", RollNumber: "2", ClassDate: null, Status: null, ...main },
      { StudentID: 1, FirstName: "Rahim", RollNumber: "1", ClassDate: null, Status: null, ...main },
    ];

    const grid = buildGrid(rows);

    expect(grid.students.map((s) => [s.StudentID, s.branch.id])).toEqual([[1, 1], [2, 1], [5, 2]]);
    expect(grid.branches).toEqual([MAIN, NORTH]);
  });
});

describe("buildOverview", () => {
  const bathuli = { id: 1, nameBn: "বাথুলী শাখা", nameEn: "Bathuli Branch" };
  const dulla = { id: 2, nameBn: "দুল্যা শাখা", nameEn: "Dulla Branch" };
  const nasima = { id: 7, name: "Nasima Akter", appAccess: true };
  const class5 = { id: 10, name: "Class 5", section: "Good", branchId: 1, students: 3, classTeacher: nasima };
  const class6 = { id: 11, name: "Class 6", section: "Good", branchId: 1, students: 2, classTeacher: null };
  const takenBy = { type: "teacher", name: "Nasima Akter", at: NOW };

  it("lists each branch's classes with the day's counts and who took it", () => {
    const overview = buildOverview({
      date: "2026-03-10",
      branches: [bathuli],
      classes: [class5, class6],
      marks: [{ classId: 10, present: 2, absent: 1, late: 0, leave: 0, takenBy }],
    });

    expect(overview).toEqual({
      date: "2026-03-10",
      branches: [
        {
          ...bathuli,
          totals: { classes: 2, taken: 1, notTaken: 1, students: 5, present: 2, absent: 1, late: 0, leave: 0 },
          classes: [
            { id: 10, name: "Class 5", section: "Good", students: 3, classTeacher: nasima, takenBy, counts: { present: 2, absent: 1, late: 0, leave: 0 } },
            { id: 11, name: "Class 6", section: "Good", students: 2, classTeacher: null, takenBy: null, counts: { present: 0, absent: 0, late: 0, leave: 0 } },
          ],
        },
      ],
    });
  });

  it("shows a branch without classes with zero totals", () => {
    const overview = buildOverview({ date: "2026-03-10", branches: [bathuli, dulla], classes: [class5], marks: [] });

    expect(overview.branches[1]).toEqual({
      ...dulla,
      totals: { classes: 0, taken: 0, notTaken: 0, students: 0, present: 0, absent: 0, late: 0, leave: 0 },
      classes: [],
    });
  });

  it("counts a day as taken even when no one is named as having taken it", () => {
    const overview = buildOverview({
      date: "2026-03-10",
      branches: [bathuli],
      classes: [class5],
      marks: [{ classId: 10, present: 0, absent: 0, late: 1, leave: 2, takenBy: null }],
    });

    expect(overview.branches[0].totals).toMatchObject({ taken: 1, notTaken: 0, late: 1, leave: 2 });
  });
});
