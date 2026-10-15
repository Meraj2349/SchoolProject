"use client";

import { FiGitBranch } from "react-icons/fi";
import { useTranslations } from "@/store/languageStore";

/** Shown to a super admin on "All branches" where adding or changing records needs one branch. */
export default function ChooseBranchNotice({ children }) {
  const t = useTranslations("admin.shell");
  return (
    <div role="note" className="flex items-center gap-2 px-4 py-3 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-sm">
      <FiGitBranch aria-hidden="true" />
      {children ?? t("chooseBranch")}
    </div>
  );
}
