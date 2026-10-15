import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useWriteBranch } from "./useWriteBranch";

describe("useWriteBranch", () => {
  beforeEach(() => useBranchStore.setState({ currentBranchId: null }));

  it("needs a branch for a super admin on All branches", () => {
    useAuthStore.setState({ role: "super_admin" });

    expect(renderHook(() => useWriteBranch()).result.current).toEqual({ branchId: null, needsBranch: true });
  });

  it("is ready once a super admin picks a branch", () => {
    useAuthStore.setState({ role: "super_admin" });
    useBranchStore.setState({ currentBranchId: 2 });

    expect(renderHook(() => useWriteBranch()).result.current).toEqual({ branchId: 2, needsBranch: false });
  });

  it("never asks a branch admin, whose branch is fixed", () => {
    useAuthStore.setState({ role: "branch_admin" });

    expect(renderHook(() => useWriteBranch()).result.current.needsBranch).toBe(false);
  });
});
