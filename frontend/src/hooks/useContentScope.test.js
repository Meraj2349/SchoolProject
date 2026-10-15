import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useContentScope } from "./useContentScope";

// Website content belongs to a branch, or to the whole school (branch_id null).
describe("useContentScope", () => {
  beforeEach(() => useBranchStore.setState({ currentBranchId: null }));

  it("lets a super admin manage everything, publishing for the whole school on All branches", () => {
    useAuthStore.setState({ role: "super_admin" });

    const { canManage, newItemsBranchId } = renderHook(() => useContentScope()).result.current;

    expect([canManage({ branch_id: null }), canManage({ branch_id: 2 })]).toEqual([true, true]);
    expect(newItemsBranchId).toBeNull();
  });

  it("publishes a super admin's items for the chosen branch", () => {
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: 2 });

    expect(renderHook(() => useContentScope()).result.current.newItemsBranchId).toBe(2);
  });

  it("lets a branch admin manage only their own branch's items", () => {
    useAuthStore.setState({ role: "branch_admin" });
    useBranchStore.setState({ currentBranchId: 1 });

    const { canManage, newItemsBranchId } = renderHook(() => useContentScope()).result.current;

    expect([canManage({ branch_id: 1 }), canManage({ branch_id: null }), canManage({ branch_id: 2 })]).toEqual([true, false, false]);
    expect(newItemsBranchId).toBe(1);
  });
});
