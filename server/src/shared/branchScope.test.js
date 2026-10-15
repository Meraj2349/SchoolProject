import { describe, expect, it } from "@jest/globals";
import { ForbiddenError, NotFoundError } from "./errors/index.js";
import { assertCanManage, canManage, canSee, newRowBranch } from "./branchScope.js";

// Website content and applications belong to one branch, or to the whole
// school when branch_id is null. `admin` is { role, branchId } as set by
// authMiddleware: a branch admin's own branch, or the branch a super admin
// picked (null = "All branches").
const superOnAll = { role: "super_admin", branchId: null };
const superOnB = { role: "super_admin", branchId: 2 };
const adminA = { role: "branch_admin", branchId: 1 };

describe("branchScope", () => {
  describe("canSee", () => {
    it("shows everything when no branch is chosen", () => {
      expect([canSee(null, 1), canSee(null, null)]).toEqual([true, true]);
    });

    it("shows a branch its own rows and whole-school rows, not other branches'", () => {
      expect([canSee(1, 1), canSee(1, null), canSee(1, 2)]).toEqual([true, true, false]);
    });
  });

  describe("canManage", () => {
    it("lets a super admin manage every row", () => {
      expect([canManage(superOnAll, 1), canManage(superOnAll, null), canManage(superOnB, 1)]).toEqual([true, true, true]);
    });

    it("lets a branch admin manage only their own branch's rows", () => {
      expect([canManage(adminA, 1), canManage(adminA, null), canManage(adminA, 2)]).toEqual([true, false, false]);
    });
  });

  describe("newRowBranch", () => {
    it("puts a super admin's row in the chosen branch, or the whole school", () => {
      expect([newRowBranch(superOnB), newRowBranch(superOnAll)]).toEqual([2, null]);
    });

    it("puts a branch admin's row in their own branch", () => {
      expect(newRowBranch(adminA)).toBe(1);
    });
  });

  describe("assertCanManage", () => {
    it("passes for a row the admin may manage", () => {
      expect(() => assertCanManage(adminA, 1, "notice_not_found")).not.toThrow();
    });

    it("hides another branch's row behind not-found", () => {
      expect(() => assertCanManage(adminA, 2, "notice_not_found")).toThrow(new NotFoundError("notice_not_found"));
    });

    it("refuses a whole-school row the branch admin can see but not change", () => {
      expect(() => assertCanManage(adminA, null, "notice_not_found")).toThrow(ForbiddenError);
    });
  });
});
