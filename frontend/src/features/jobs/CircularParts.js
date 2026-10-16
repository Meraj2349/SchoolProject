"use client";

import { useBranches } from "@/hooks/useBranches";
import { formatDate, formatNumber, localized } from "@/lib/homePage";
import { salaryText } from "@/lib/jobCirculars";
import { fillTemplate } from "@/lib/template";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

/** "Taking applications" or "Closed". */
export function CircularStatus({ circular }) {
  const t = useTranslations("jobs");
  return circular.accepting ? (
    <span className="inline-block rounded-full bg-school-navy px-3 py-1 text-xs font-bold text-school-gold-soft">{t("open")}</span>
  ) : (
    <span className="inline-block rounded-full bg-school-cream-deep px-3 py-1 text-xs font-bold text-school-muted">{t("closed")}</span>
  );
}

/** Circular date, last date to apply and branch. */
export function CircularFacts({ circular }) {
  const t = useTranslations("jobs");
  const language = useLanguageStore((s) => s.language);
  const { data: branches = [] } = useBranches();
  const branch = branches.find((b) => b.id === circular.branch_id);
  const facts = [
    [t("date"), formatDate(circular.circular_date, language)],
    [t("deadline"), formatDate(circular.deadline, language) || t("untilFilled")],
    [t("branch"), branch ? localized(branch, "name", language) : t("wholeSchool")],
  ];
  return (
    <dl className="m-0 grid gap-3 text-sm sm:grid-cols-3">
      {facts.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-bold uppercase tracking-wide text-school-muted">{label}</dt>
          <dd className="m-0 font-semibold text-school-navy">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The posts, laid out like the printed circular's table. */
export function PostsTable({ posts }) {
  const t = useTranslations("jobs");
  const language = useLanguageStore((s) => s.language);
  return (
    <div className="overflow-x-auto rounded-sm border border-school-cream-deep">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-school-navy text-school-gold-soft">
            {["serial", "post", "vacancies", "qualification", "salary"].map((column) => (
              <th key={column} scope="col" className="px-3 py-2 text-xs font-bold uppercase tracking-wide">
                {t(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr key={index} className="border-t border-school-cream-deep text-school-ink even:bg-school-cream/60">
              <td className="px-3 py-2">{formatNumber(index + 1, language)}</td>
              <td className="px-3 py-2 font-semibold text-school-navy">{localized(post, "title", language)}</td>
              <td className="px-3 py-2">{fillTemplate(t("vacancyCount"), { count: formatNumber(post.vacancies, language) })}</td>
              <td className="px-3 py-2">{localized(post, "qualification", language) || "—"}</td>
              <td className="whitespace-nowrap px-3 py-2">{salaryText(post, language, t)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
