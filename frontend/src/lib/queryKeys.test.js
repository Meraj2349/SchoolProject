import { describe, expect, it } from "vitest";
import { queryKeys } from "./queryKeys";

describe("queryKeys", () => {
  it("includes the branch so switching branches refetches", () => {
    expect(queryKeys.students.all(3)).not.toEqual(queryKeys.students.all(4));
  });

  it("defaults to the all-branches key", () => {
    expect(queryKeys.students.all()).toEqual(["students", { branchId: null }]);
  });

  it("shares no cache between branch-agnostic class names and branch classes", () => {
    expect(queryKeys.classes.names()).toEqual(["classes", "names"]);
  });
});
