import { beforeEach, describe, expect, it } from "vitest";
import { useBranchStore } from "./branchStore";

const state = () => useBranchStore.getState();

describe("branchStore", () => {
  beforeEach(() => state().resetBranch());

  it("starts on all branches", () => {
    expect(state()).toMatchObject({ currentBranchId: null, currentBranchName: "All Branches" });
  });

  it("switches to a branch", () => {
    state().setBranch(2, "North");

    expect(state()).toMatchObject({ currentBranchId: 2, currentBranchName: "North" });
  });

  it("falls back to a generated name when locking without one", () => {
    state().lockBranch(5);

    expect(state().currentBranchName).toBe("Branch 5");
  });

  it("persists the selected branch to localStorage", () => {
    state().setBranch(2, "North");

    expect(JSON.parse(localStorage.getItem("branch-store")).state.currentBranchId).toBe(2);
  });
});
