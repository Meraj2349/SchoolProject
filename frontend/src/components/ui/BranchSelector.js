"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { branchService } from "@/services/branch.service";
import { FiGitBranch } from "react-icons/fi";

/**
 * BranchSelector — dropdown for super_admin to switch the active branch context.
 *
 * - super_admin: dropdown to switch between branches (null = All Branches).
 * - branch_admin: read-only badge showing their assigned branch name.
 */
export default function BranchSelector() {
  const role = useAuthStore((s) => s.role);
  const authBranchId = useAuthStore((s) => s.branchId);
  const { currentBranchId, currentBranchName, setBranch, lockBranch } =
    useBranchStore();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = role === "super_admin";
  const isBranchAdmin = role === "branch_admin";

  // Load branches for both roles:
  // - super_admin: needs the list for the dropdown
  // - branch_admin: needs it to resolve a real name from the assigned branch_id
  useEffect(() => {
    if (!isSuperAdmin && !isBranchAdmin) return;
    setLoading(true);
    branchService
      .getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBranches(list);

        if (isBranchAdmin && authBranchId != null) {
          const found = list.find((b) => b.id === authBranchId);
          const name = found
            ? found.name_en || found.name_bn || `Branch ${authBranchId}`
            : `Branch ${authBranchId}`;
          lockBranch(authBranchId, name);
        } else if (isSuperAdmin && currentBranchId != null) {
          // Refresh the display name if super_admin had a branch selected
          const found = list.find((b) => b.id === currentBranchId);
          if (found) {
            setBranch(
              currentBranchId,
              found.name_en || found.name_bn || `Branch ${currentBranchId}`,
            );
          }
        }
      })
      .catch(() => setBranches([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, isBranchAdmin, authBranchId]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setBranch(null, "All Branches");
    } else {
      const id = parseInt(val, 10);
      const found = branches.find((b) => b.id === id);
      setBranch(id, found?.name_en || found?.name_bn || `Branch ${id}`);
    }
  };

  if (isBranchAdmin) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
        <FiGitBranch className="text-indigo-500 flex-shrink-0" />
        <span className="font-medium truncate max-w-40">
          {currentBranchName}
        </span>
      </div>
    );
  }

  if (!isSuperAdmin) return null;

  return (
    <div className="flex items-center gap-1.5">
      <FiGitBranch className="text-slate-400 text-base flex-shrink-0" />
      <select
        value={currentBranchId ?? ""}
        onChange={handleChange}
        disabled={loading}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:opacity-60 max-w-44"
        aria-label="Select branch"
      >
        <option value="">All Branches</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name_en || b.name_bn || `Branch ${b.id}`}
          </option>
        ))}
      </select>
    </div>
  );
}
