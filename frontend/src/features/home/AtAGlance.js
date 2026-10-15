"use client";

import { FiBookOpen, FiGitBranch, FiUsers, FiUserCheck } from "react-icons/fi";
import { useBranchStats } from "@/hooks/useBranchStats";
import { formatNumber, summariseStats } from "@/lib/homePage";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const FIGURES = [
  { key: "students", icon: FiUsers },
  { key: "teachers", icon: FiUserCheck },
  { key: "classes", icon: FiBookOpen },
  { key: "branches", icon: FiGitBranch },
];

/** Live numbers for the chosen branch (or the whole school). */
export default function AtAGlance() {
  const t = useTranslations("home.glance");
  const language = useLanguageStore((s) => s.language);
  const branchId = useBranchStore((s) => s.currentBranchId);
  const { data: branches, isLoading } = useBranchStats();
  const stats = summariseStats(branches, branchId);

  return (
    <section aria-labelledby="glance-title" className="relative bg-school-navy font-school-body text-white">
      <div className="h-1 bg-gradient-to-r from-school-gold via-school-gold-soft to-school-gold" aria-hidden="true" />
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center">
        <h2 id="glance-title" className="m-0 shrink-0 font-school-heading text-lg text-school-gold-soft md:w-40">
          {t("title")}
        </h2>
        <ul className="m-0 grid flex-1 list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
          {FIGURES.map(({ key, icon: Icon }) => (
            <li key={key} className="flex items-center gap-3 border-l-2 border-school-gold/60 pl-4">
              <Icon aria-hidden="true" className="text-2xl text-school-gold" />
              <div className="flex flex-col">
                <span className="font-school-heading text-3xl font-bold leading-none" aria-busy={isLoading}>
                  {isLoading ? "—" : formatNumber(stats[key], language)}
                </span>
                <span className="mt-1 text-sm text-white/75">{t(key)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
