"use client";

import { useBranchStore } from "@/store/branchStore";
import { useTranslations } from "@/store/languageStore";

/**
 * BranchBadge — shared pill showing which branch the current view is scoped to.
 * Hidden when no branch selected (All Branches) unless `showAll` is true.
 */
export default function BranchBadge({ className = "", showAll = false }) {
  const { currentBranchId, currentBranchName } = useBranchStore();
  const t = useTranslations("branchSelector");

  if (currentBranchId == null && !showAll) return null;

  const label =
    currentBranchId == null
      ? t("allBranches") || "All Branches"
      : currentBranchName;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/60 bg-emerald-50 text-emerald-800 text-xs font-semibold tracking-wide ${className}`}
      title={currentBranchId == null ? "All branches" : `Viewing: ${label}`}
    >
      <span aria-hidden>🏫</span>
      <span className="truncate max-w-[180px]">{label}</span>
    </span>
  );
}
