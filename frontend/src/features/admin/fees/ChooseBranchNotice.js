"use client";

import { ChooseBranchNotice as Notice } from "@/components/admin/ui";
import { useTranslations } from "@/store/languageStore";

/** Shown to a super admin on "All branches" where a fee change needs one branch. */
export default function ChooseBranchNotice() {
  const t = useTranslations("admin.fees");
  return <Notice>{t("chooseBranch")}</Notice>;
}
