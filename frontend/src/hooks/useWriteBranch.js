"use client";

import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";

/**
 * The branch new records go to. A super admin on "All branches" must pick a
 * branch before adding or changing branch-owned records (the server refuses
 * too); a branch admin always works in their own branch.
 */
export function useWriteBranch() {
  const role = useAuthStore((s) => s.role);
  const branchId = useBranchStore((s) => s.currentBranchId);
  return { branchId, needsBranch: role === "super_admin" && branchId == null };
}
