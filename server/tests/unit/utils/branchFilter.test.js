import { describe, expect, it } from "@jest/globals";
import { branchFilter, branchOrSchoolFilter } from "../../../utils/branchFilter.js";

describe("branchFilter", () => {
  it("adds no filter for a super_admin (null branch)", () => {
    expect(branchFilter(null)).toEqual({ clause: "", params: [] });
    expect(branchFilter(undefined)).toEqual({ clause: "", params: [] });
  });

  it("filters by branch_id with a bound parameter", () => {
    expect(branchFilter(4)).toEqual({ clause: "AND branch_id = ?", params: [4] });
  });

  it("prefixes the column with the table alias", () => {
    expect(branchFilter(4, "s").clause).toBe("AND s.branch_id = ?");
  });

  it("treats branch 0 as a real branch, not as 'no filter'", () => {
    expect(branchFilter(0).params).toEqual([0]);
  });
});

describe("branchOrSchoolFilter", () => {
  it("adds no filter when no branch is chosen", () => {
    expect(branchOrSchoolFilter(null)).toEqual({ clause: "", params: [] });
  });

  it("keeps the branch's rows and whole-school rows (branch_id NULL)", () => {
    expect(branchOrSchoolFilter(2)).toEqual({ clause: "AND (branch_id = ? OR branch_id IS NULL)", params: [2] });
  });

  it("prefixes the column with the table alias", () => {
    expect(branchOrSchoolFilter(2, "i").clause).toBe("AND (i.branch_id = ? OR i.branch_id IS NULL)");
  });
});
