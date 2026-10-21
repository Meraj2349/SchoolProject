import { describe, expect, it, jest } from "@jest/globals";
import { NotFoundError, ValidationError } from "../../../shared/errors/index.js";
import { makeAttendanceReads } from "./attendanceReads.usecases.js";

const repositoryWith = (overrides = {}) => ({
  list: jest.fn(async () => []),
  countRecords: jest.fn(async () => 0),
  statusCounts: jest.fn(async () => ({})),
  findStudentInfo: jest.fn(async () => null),
  exists: jest.fn(async () => false),
  gridRows: jest.fn(async () => []),
  ...overrides,
});

const expectRejects = async (promise, Type, code) => {
  const error = await promise.then(() => null, (caught) => caught);
  expect(error).toBeInstanceOf(Type);
  expect(error.code).toBe(code);
};

describe("attendance reads", () => {
  it("scope every list by the given branch", async () => {
    const repository = repositoryWith();
    const reads = makeAttendanceReads({ repository });

    await reads.byClassSection({ branchId: 2, className: "Class 5", section: "Good" });

    expect(repository.list).toHaveBeenCalledWith({ branchId: 2, className: "Class 5", section: "Good" });
  });

  it("finds a student by the exact roll number", async () => {
    const repository = repositoryWith();
    await makeAttendanceReads({ repository }).byNameRoll({ branchId: null, firstName: "Rahim", roll: "1", className: "Class 5", section: "Good" });

    expect(repository.list).toHaveBeenCalledWith({ branchId: null, firstName: "Rahim", roll: "1", className: "Class 5", section: "Good" });
  });

  it("counts late and leave days in the statistics", async () => {
    const repository = repositoryWith({ statusCounts: jest.fn(async () => ({ Present: 6, Absent: 2, Late: 2, Leave: 5 })) });

    expect(await makeAttendanceReads({ repository }).statistics({ branchId: 1 })).toEqual({
      TotalRecords: 15,
      TotalPresent: 6,
      TotalAbsent: 2,
      TotalLate: 2,
      TotalLeave: 5,
      OverallAttendancePercentage: 80,
    });
  });

  it("summarises one student's days", async () => {
    const repository = repositoryWith({
      findStudentInfo: jest.fn(async () => ({ StudentID: 5, FirstName: "Rahim" })),
      statusCounts: jest.fn(async () => ({ Present: 3, Absent: 1 })),
    });

    expect(await makeAttendanceReads({ repository }).studentSummary({ branchId: 1, studentId: "5" })).toEqual({
      StudentID: 5,
      FirstName: "Rahim",
      TotalPresent: 3,
      TotalAbsent: 1,
      TotalLate: 0,
      TotalLeave: 0,
      TotalDays: 4,
      AttendancePercentage: 75,
    });
    expect(repository.statusCounts).toHaveBeenCalledWith({ branchId: 1, studentId: 5 });
  });

  it("has no summary for a student of another branch, or one with no days", async () => {
    const reads = makeAttendanceReads({ repository: repositoryWith() });
    await expectRejects(reads.studentSummary({ branchId: 1, studentId: 5 }), NotFoundError, "attendance_not_found");
  });

  it("answers whether a student's day is recorded, inside the branch", async () => {
    const repository = repositoryWith({ exists: jest.fn(async () => true) });

    expect(await makeAttendanceReads({ repository }).exists({ branchId: 1, studentId: "5", date: "2026-03-01" })).toBe(true);
    expect(repository.exists).toHaveBeenCalledWith({ branchId: 1, studentId: 5, date: "2026-03-01" });
  });

  it("gives a class's day as counts per status, inside the branch", async () => {
    const repository = repositoryWith({ statusCounts: jest.fn(async () => ({ Present: 2, Leave: 1 })) });

    expect(await makeAttendanceReads({ repository }).classDaySummary({ branchId: 1, classId: "10", date: "2026-03-01" })).toEqual([
      { Status: "Present", Count: 2 },
      { Status: "Leave", Count: 1 },
    ]);
    expect(repository.statusCounts).toHaveBeenCalledWith({ branchId: 1, classId: 10, date: "2026-03-01" });
  });

  it("builds the grid with Leave days and the students' branch", async () => {
    const MAIN = { id: 1, nameBn: "প্রধান", nameEn: "Main" };
    const repository = repositoryWith({
      gridRows: jest.fn(async () => [
        {
          StudentID: 1, FirstName: "Rahim", LastName: "R", RollNumber: "1", ClassDate: "2026-03-01", Status: "Leave",
          BranchID: 1, BranchNameBn: "প্রধান", BranchNameEn: "Main",
        },
      ]),
    });

    const grid = await makeAttendanceReads({ repository }).grid({
      branchId: 1, className: "Class 5", section: "Good", startDate: "2026-03-01", endDate: "2026-03-31",
    });

    expect(grid).toEqual({
      students: [{ StudentID: 1, FirstName: "Rahim", LastName: "R", RollNumber: "1", branch: MAIN, attendance: { "2026-03-01": "Leave" } }],
      dates: ["2026-03-01"],
      branches: [MAIN],
      className: "Class 5",
      section: "Good",
    });
  });

  it.each([
    [{ className: "", section: "Good", startDate: "2026-03-01", endDate: "2026-03-31" }, "attendance_class_section_required"],
    [{ className: "Class 5", section: "Good", startDate: "2026-03-31", endDate: "2026-03-01" }, "attendance_range_invalid"],
    [{ className: "Class 5", section: "Good", startDate: "2025-01-01", endDate: "2026-03-01" }, "attendance_range_invalid"],
    [{ className: "Class 5", section: "Good", startDate: "soon", endDate: "2026-03-01" }, "attendance_date_invalid"],
  ])("refuses the grid for %p", async (query, code) => {
    await expectRejects(makeAttendanceReads({ repository: repositoryWith() }).grid({ branchId: 1, ...query }), ValidationError, code);
  });

  it("finds a record by id inside the branch", async () => {
    const reads = makeAttendanceReads({ repository: repositoryWith() });
    await expectRejects(reads.byId({ branchId: 1, id: "7" }), NotFoundError, "attendance_not_found");
  });
});
