"use client";

import { useEffect } from "react";
import { FiGitBranch } from "react-icons/fi";
import { useBranches, useCurrentBranchName } from "@/hooks/useBranches";
import { localized } from "@/lib/homePage";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

/**
 * BranchSelector — the admin top bar's branch, named in the admin's language.
 *
 * - super_admin: dropdown to switch between branches (empty = all branches).
 * - branch_admin: read-only badge with their own branch.
 */
export default function BranchSelector() {
  const role = useAuthStore((s) => s.role);
  const authBranchId = useAuthStore((s) => s.branchId);
  const { currentBranchId, setBranch, lockBranch } = useBranchStore();
  const language = useLanguageStore((s) => s.language);
  const t = useTranslations("branchSelector");
  const { data: branches = [], isLoading } = useBranches();
  const currentName = useCurrentBranchName();

  const isSuperAdmin = role === "super_admin";
  const isBranchAdmin = role === "branch_admin";
  const nameOf = (branch) => localized(branch, "name", language) || `Branch ${branch.id}`;

  // A branch admin always works in their own branch.
  useEffect(() => {
    if (isBranchAdmin && authBranchId != null && currentBranchId !== authBranchId) {
      const own = branches.find((b) => b.id === authBranchId);
      lockBranch(authBranchId, own ? nameOf(own) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBranchAdmin, authBranchId, currentBranchId, branches]);

  const handleChange = (e) => {
    const id = e.target.value === "" ? null : parseInt(e.target.value, 10);
    const found = branches.find((b) => b.id === id);
    setBranch(id, found ? nameOf(found) : null);
  };

  if (isBranchAdmin) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
        <FiGitBranch className="text-indigo-500 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium truncate max-w-40">{currentName}</span>
      </div>
    );
  }

  if (!isSuperAdmin) return null;

  return (
    <div className="flex items-center gap-1.5">
      <FiGitBranch className="text-slate-400 text-base flex-shrink-0" aria-hidden="true" />
      <select
        value={currentBranchId ?? ""}
        onChange={handleChange}
        disabled={isLoading}
        className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:opacity-60 max-w-44"
        aria-label={t("selectBranch")}
      >
        <option value="">{t("allBranches")}</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {nameOf(b)}
          </option>
        ))}
      </select>
    </div>
  );
}
