import { describe, expect, it } from "vitest";
import { fileKind, filterRoutines } from "./routineFilters";

const ROUTINES = [
  { RoutineID: 1, RoutineTitle: "Weekly", Description: "Science lab on Sunday", ClassName: "Class 5", Section: "Good", RoutineDate: "2026-10-05" },
  { RoutineID: 2, RoutineTitle: "Exam", ClassName: "Class 6", Section: "Better", RoutineDate: "2026-11-20" },
  { RoutineID: 3, RoutineTitle: "Old", ClassName: "Class 5", Section: "Better", RoutineDate: "not a date" },
];
const ids = (list) => list.map((r) => r.RoutineID);

describe("filterRoutines", () => {
  it("sorts newest first, with unreadable dates last", () => {
    expect(ids(filterRoutines(ROUTINES))).toEqual([2, 1, 3]);
  });

  it("narrows by class and section", () => {
    expect(ids(filterRoutines(ROUTINES, { className: "Class 5" }))).toEqual([1, 3]);
    expect(ids(filterRoutines(ROUTINES, { className: "Class 5", section: "Better" }))).toEqual([3]);
  });

  it("searches title, description, class and section, ignoring case", () => {
    expect(ids(filterRoutines(ROUTINES, { search: " SCIENCE " }))).toEqual([1]);
    expect(ids(filterRoutines(ROUTINES, { search: "better" }))).toEqual([2, 3]);
  });

  it("does not change the list it was given", () => {
    const list = [...ROUTINES];
    filterRoutines(list);
    expect(ids(list)).toEqual([1, 2, 3]);
  });
});

describe("fileKind", () => {
  it("reads the stored type or the file name", () => {
    expect(fileKind({ FileType: "pdf", FileURL: "/uploads/x" })).toBe("pdf");
    expect(fileKind({ FileURL: "/uploads/r.PDF" })).toBe("pdf");
    expect(fileKind({ FileURL: "https://cdn/x.webp" })).toBe("image");
    expect(fileKind({ FileURL: "/uploads/r.docx" })).toBe("file");
    expect(fileKind({ FileType: "pdf" })).toBeNull();
  });
});
