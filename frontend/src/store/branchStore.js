"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Branch context store for multi-tenant support.
 *
 * - super_admin: can switch between branches; null = "All Branches" (no filter)
 * - branch_admin: locked to their own branch_id from auth token (set on login)
 *
 * The store persists to localStorage so the selected branch survives page refresh.
 */
export const useBranchStore = create(
  persist(
    (set, get) => ({
      // The currently selected branch ID (null = all branches, for super_admin only)
      currentBranchId: null,
      // Human-readable name for display in the UI
      currentBranchName: "All Branches",

      setBranch: (branchId, branchName) => {
        set({
          currentBranchId: branchId ?? null,
          currentBranchName: branchName || "All Branches",
        });
      },

      // Lock branch for branch_admin — called after login
      lockBranch: (branchId, branchName) => {
        set({
          currentBranchId: branchId,
          currentBranchName: branchName || `Branch ${branchId}`,
        });
      },

      resetBranch: () => {
        set({ currentBranchId: null, currentBranchName: "All Branches" });
      },
    }),
    {
      name: "branch-store",
    },
  ),
);
