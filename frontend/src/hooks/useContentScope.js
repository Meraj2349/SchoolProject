"use client";

import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";

/**
 * Website content (notices, news, messages, announcements, gallery) belongs to
 * a branch, or to the whole school when branch_id is null. A super admin
 * manages everything; a branch admin only their own branch's items. New items
 * go to the selected branch; a super admin on "All branches" publishes for the
 * whole school. The server enforces the same rules.
 */
export function useContentScope() {
  const isSuperAdmin = useAuthStore((s) => s.role) === "super_admin";
  const branchId = useBranchStore((s) => s.currentBranchId);
  return {
    canManage: (item) => isSuperAdmin || (item.branch_id != null && item.branch_id === branchId),
    newItemsBranchId: branchId ?? null,
  };
}
