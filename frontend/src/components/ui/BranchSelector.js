"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { branchService } from "@/services/branch.service";
import { FiGitBranch } from "react-icons/fi";

/**
 * BranchSelector — dropdown for super_admin to switch the active branch context.
 *
 * - Visible only to super_admin.
 * - branch_admin sees a read-only badge showing their assigned branch.
 * - Selecting a branch updates the global branchStore, which the httpClient
 *   interceptor reads to append ?branch_id=X to API calls.
 */
export default function BranchSelector() {
  const role = useAuthStore((s) => s.role);
  const authBranchId = useAuthStore((s) => s.branchId);
  const { currentBranchId, currentBranchName, setBranch, lockBranch } = useBranchStore();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = role === "super_admin";
  const isBranchAdmin = role === "branch_admin";

  // For branch_admin, lock the store to their own branch on mount
  useEffect(() => {
    if (isBranchAdmin && authBranchId != null) {
      lockBranch(authBranchId, `Branch ${authBranchId}`);
    }
  }, [isBranchAdmin, authBranchId, lockBranch]);

  // For super_admin, load the branch list
  useEffect(() => {
    if (!isSuperAdmin) return;
    setLoading(true);
    branchService
      .getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBranches(list);
        // If branch was locked to a specific one previously, update the name
        if (currentBranchId != null) {
          const found = list.find((b) => b.BranchID === currentBranchId || b.id === currentBranchId);
          if (found) {
            setBranch(currentBranchId, found.BranchName || found.name || `Branch ${currentBranchId}`);
          }
        }
      })
      .catch(() => setBranches([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setBranch(null, "All Branches");
    } else {
      const id = parseInt(val, 10);
      const found = branches.find((b) => (b.BranchID ?? b.id) === id);
      setBranch(id, found?.BranchName || found?.name || `Branch ${id}`);
    }
  };

  if (isBranchAdmin) {
    // Read-only badge for branch_admin
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
        <FiGitBranch className="text-indigo-500 flex-shrink-0" />
        <span className="font-medium truncate max-w-32">{currentBranchName}</span>
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
        className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:opacity-60 max-w-40"
        aria-label="Select branch"
      >
        <option value="">All Branches</option>
        {branches.map((b) => {
          const id = b.BranchID ?? b.id;
          const name = b.BranchName || b.name || `Branch ${id}`;
          return (
            <option key={id} value={id}>
              {name}
            </option>
          );
        })}
      </select>
    </div>
  );
}
