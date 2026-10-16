"use client";

import { useState } from "react";
import { EmptyState, ErrorState, PageHero, PublicPage, SiteCard, SiteLoader } from "@/components/site";
import { useAttendanceSearch } from "@/hooks/useAttendance";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";
import { formatDate, formatNumber } from "@/lib/homePage";
import { fullName } from "@/lib/people";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { attendanceSummary, statusKey } from "./attendanceSummary";

const STATUS_TONES = {
  present: "bg-school-navy text-school-gold-soft",
  late: "bg-school-gold-soft text-school-navy-deep",
  excused: "bg-school-cream-deep text-school-ink",
  absent: "bg-red-100 text-red-800",
};

const studentName = (record) => record.StudentName || fullName(record) || String(record.StudentID ?? "–");

function AttendanceResults({ className, section }) {
  const t = useTranslations("attendance");
  const language = useLanguageStore((s) => s.language);
  const { data: records = [], isFetching, isError, refetch } = useAttendanceSearch(className, section);

  if (isFetching) return <SiteLoader label={t("searching")} />;
  if (isError) return <ErrorState message={t("failedToFetch")} onRetry={refetch} />;

  const { total, present, absent, rate } = attendanceSummary(records);
  const cards = [
    { label: t("totalRecords"), value: formatNumber(total, language) },
    { label: t("present"), value: formatNumber(present, language) },
    { label: t("absent"), value: formatNumber(absent, language) },
    { label: t("attendanceRate"), value: `${formatNumber(rate, language)}%` },
  ];

  return (
    <div className="space-y-6">
      <ul aria-label={t("summary")} className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
        {cards.map(({ label, value }) => (
          <li key={label} className="rounded-sm border-t-4 border-school-gold bg-white px-4 py-5 text-center shadow">
            <span className="block font-school-heading text-3xl font-bold text-school-navy">{value}</span>
            <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-school-muted">{label}</span>
          </li>
        ))}
      </ul>
      {records.length === 0 ? (
        <EmptyState title={t("noRecords")} />
      ) : (
        <div className="overflow-x-auto rounded-sm bg-white shadow">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-school-navy text-school-gold-soft">
                {[t("student"), t("date"), t("status")].map((header) => (
                  <th key={header} scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => {
                const key = statusKey(record.Status);
                return (
                  <tr key={record.AttendanceID ?? index} className="border-b border-school-cream-deep text-school-ink last:border-0 even:bg-school-cream/60">
                    <td className="px-4 py-3 font-semibold text-school-navy">{studentName(record)}</td>
                    <td className="px-4 py-3">{formatDate(record.AttendanceDate || record.ClassDate, language) || "–"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block min-w-20 rounded-full px-3 py-1 text-center text-xs font-bold ${STATUS_TONES[key] ?? STATUS_TONES.excused}`}>
                        {key ? t(`statuses.${key}`) : record.Status || "–"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AttendancePage() {
  const t = useTranslations("attendance");
  const branchName = useBranchStore((s) => (s.currentBranchId != null ? s.currentBranchName : null));
  const { data: classNames = [] } = useClassNames();
  const { data: sections = [] } = useStandardSections();
  const [filters, setFilters] = useState({ className: "", section: "" });
  const [query, setQuery] = useState(null);

  const change = (field) => (event) => {
    setFilters((previous) => ({ ...previous, [field]: event.target.value, ...(field === "className" && { section: "" }) }));
    setQuery(null);
  };
  const search = (event) => {
    event.preventDefault();
    if (filters.className && filters.section) setQuery(filters);
  };

  const selects = [
    { id: "attendance-class", field: "className", label: t("className"), placeholder: t("selectClass"), options: classNames },
    { id: "attendance-section", field: "section", label: t("section"), placeholder: t("selectSection"), options: sections, disabled: !filters.className },
  ];

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("pageTitle")} subtitle={t("pageSubtitle")}>
        {branchName && <p className="m-0 mt-4 inline-block rounded-full border border-school-gold/60 px-4 py-1 text-sm font-semibold text-school-gold-soft">{branchName}</p>}
      </PageHero>
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <SiteCard title={t("searchTitle")}>
          <form onSubmit={search} className="grid gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            {selects.map(({ id, field, label, placeholder, options, disabled }) => (
              <div key={id}>
                <label htmlFor={id} className="site-label">
                  {label}
                </label>
                <select id={id} value={filters[field]} onChange={change(field)} disabled={disabled} required className="site-input disabled:opacity-60">
                  <option value="">{placeholder}</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button type="submit" disabled={!filters.className || !filters.section} className="site-cta disabled:opacity-60">
              {t("searchBtn")}
            </button>
          </form>
        </SiteCard>
        {query && <AttendanceResults className={query.className} section={query.section} />}
      </div>
    </PublicPage>
  );
}
