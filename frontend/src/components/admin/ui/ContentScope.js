"use client";

import { FiGlobe, FiLock } from "react-icons/fi";
import { useBranches } from "@/hooks/useBranches";
import { useContentScope } from "@/hooks/useContentScope";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import Badge from "./Badge";

function useBranchName() {
  const language = useLanguageStore((s) => s.language);
  const { data: branches = [] } = useBranches();
  return (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) return "";
    return (language === "bn" ? branch.name_bn : branch.name_en) || branch.name_en || branch.name_bn;
  };
}

/** "Whole school" or the name of the branch an item belongs to. */
export function ContentScopeBadge({ branchId }) {
  const t = useTranslations("admin.shell");
  const branchName = useBranchName();
  if (branchId == null) return <Badge tone="info">{t("wholeSchool")}</Badge>;
  return <Badge>{branchName(branchId) || `#${branchId}`}</Badge>;
}

/** Above a content form: where new items will be published. */
export function NewContentScopeNote() {
  const t = useTranslations("admin.shell");
  const branchName = useBranchName();
  const { newItemsBranchId } = useContentScope();
  return (
    <div role="note" className="flex items-center gap-2 px-4 py-3 text-sm bg-sky-50 border border-sky-200 text-sky-800 rounded-sm">
      <FiGlobe aria-hidden="true" />
      {newItemsBranchId == null
        ? t("newContentForSchool")
        : t("newContentForBranch").replace("{branch}", branchName(newItemsBranchId) || `#${newItemsBranchId}`)}
    </div>
  );
}

/** In place of edit/delete on an item the admin may not change. */
export function NotYoursMark() {
  const t = useTranslations("admin.shell");
  const label = t("contentNotYours");
  return (
    <span role="img" aria-label={label} title={label} className="inline-flex items-center text-slate-400 px-2">
      <FiLock aria-hidden="true" />
    </span>
  );
}
