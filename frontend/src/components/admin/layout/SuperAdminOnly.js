"use client";

import { FiShield } from "react-icons/fi";
import { useTranslations } from "@/store/languageStore";
import PageHeader from "../ui/PageHeader";

/** Shown instead of a super-admin page when a branch admin opens it by its address. */
export default function SuperAdminOnly({ titleKey }) {
  const t = useTranslations();
  return (
    <>
      <PageHeader title={t(titleKey)} />
      <div role="note" className="flex items-center gap-2 px-4 py-3 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-sm">
        <FiShield aria-hidden="true" />
        {t("admin.shell.superAdminOnly")}
      </div>
    </>
  );
}
