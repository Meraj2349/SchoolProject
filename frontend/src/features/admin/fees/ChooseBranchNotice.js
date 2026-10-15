"use client";

import { FiGitBranch } from "react-icons/fi";
import { useTranslations } from "@/store/languageStore";

/** Shown to a super admin on "All branches" where a fee change needs one branch. */
export default function ChooseBranchNotice() {
  const t = useTranslations("admin.fees");
  return (
    <div role="note" className="flex items-center gap-2 px-4 py-3 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-sm">
      <FiGitBranch aria-hidden="true" />
      {t("chooseBranch")}
    </div>
  );
}
