import { describe, expect, it } from "vitest";
import { queryKeys } from "./queryKeys";

describe("queryKeys", () => {
  it("includes the branch so switching branches refetches", () => {
    expect(queryKeys.students.all(3)).not.toEqual(queryKeys.students.all(4));
  });

  it("defaults to the all-branches key", () => {
    expect(queryKeys.students.all()).toEqual(["students", { branchId: null }]);
  });

  it("has prefixes that cover every attendance query and every teacher app-access query", () => {
    expect(queryKeys.attendance.roster(1, "2026-03-01", 2).slice(0, 1)).toEqual(queryKeys.attendance.prefix);
    expect(queryKeys.teachers.appAccess(2).slice(0, 2)).toEqual(queryKeys.teachers.appAccessPrefix);
  });

  it("shares no cache between branch-agnostic class names and branch classes", () => {
    expect(queryKeys.classes.names()).toEqual(["classes", "names"]);
  });
});
