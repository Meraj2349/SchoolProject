"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmptyState, ErrorState, PageHero, PublicPage, SiteCard, SiteLoader } from "@/components/site";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";
import { useExamNames } from "@/hooks/useExams";
import { gradeFor } from "@/lib/grades";
import { formatNumber } from "@/lib/homePage";
import { fullName } from "@/lib/people";
import { queryKeys } from "@/lib/queryKeys";
import { resultsService } from "@/services/results.service";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const EMPTY = { firstName: "", rollNumber: "", className: "", section: "", examName: "" };
const REQUIRED = ["firstName", "rollNumber", "className", "section"];

const GRADE_TONES = {
  excellent: "bg-school-navy text-school-gold-soft",
  good: "bg-school-gold-soft text-school-navy-deep",
  fair: "bg-school-cream-deep text-school-ink",
  poor: "bg-red-100 text-red-800",
  none: "bg-school-cream text-school-muted",
};

const toQuery = (filters) => ({
  firstName: filters.firstName.trim(),
  rollNumber: filters.rollNumber.trim(),
  className: filters.className,
  section: filters.section,
  examName: filters.examName.trim() || undefined,
});

function useResultSearch(query) {
  const branchId = useBranchStore((s) => s.currentBranchId);
  return useQuery({
    queryKey: queryKeys.results.search(query, branchId),
    queryFn: () => resultsService.search(query),
    enabled: !!query,
    select: (data) => (Array.isArray(data) ? data : (data?.data ?? [])),
  });
}

function ResultsTable({ query }) {
  const t = useTranslations("results");
  const language = useLanguageStore((s) => s.language);
  const { data: rows = [], isFetching, isError, refetch } = useResultSearch(query);

  if (isFetching) return <SiteLoader label={t("loading")} />;
  if (isError) return <ErrorState message={t("failedToFetch")} onRetry={refetch} />;
  if (rows.length === 0) return <EmptyState title={t("noResultsFound")} />;

  const headers = [t("student"), t("class"), t("subjectCol"), t("exam"), t("marks"), t("total"), t("grade")];
  return (
    <section aria-labelledby="results-heading" className="overflow-hidden rounded-sm bg-white shadow">
      <h2 id="results-heading" className="site-heading m-0 border-b border-school-cream-deep px-6 py-4 text-xl">
        {t("searchResults")}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-school-navy text-school-gold-soft">
              {headers.map((header) => (
                <th key={header} scope="col" className="px-4 py-3 text-xs font-bold uppercase tracking-wide">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const marks = row.MarksObtained ?? row.marksObtained;
              const total = row.TotalMarks ?? row.totalMarks ?? 100;
              const { grade, tone } = gradeFor(marks, total);
              return (
                <tr key={row.ResultID ?? index} className="border-b border-school-cream-deep text-school-ink last:border-0 even:bg-school-cream/60">
                  <td className="px-4 py-3 font-semibold text-school-navy">{fullName(row)}</td>
                  <td className="px-4 py-3">
                    {row.ClassName} – {row.Section}
                  </td>
                  <td className="px-4 py-3">{row.SubjectName || row.Subject}</td>
                  <td className="px-4 py-3">{row.ExamName}</td>
                  <td className="px-4 py-3 font-bold">{marks == null ? "–" : formatNumber(marks, language)}</td>
                  <td className="px-4 py-3">{formatNumber(total, language)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block min-w-11 rounded-full px-2.5 py-1 text-center text-xs font-extrabold ${GRADE_TONES[tone]}`}>{grade}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function ResultsPage() {
  const t = useTranslations("results");
  const branchName = useBranchStore((s) => (s.currentBranchId != null ? s.currentBranchName : null));
  const { data: classNames = [] } = useClassNames();
  const { data: sections = [] } = useStandardSections();
  const { data: examNames = [] } = useExamNames();
  const [filters, setFilters] = useState(EMPTY);
  const [query, setQuery] = useState(null);
  const [missing, setMissing] = useState(false);

  const change = (field) => (event) =>
    setFilters((previous) => ({ ...previous, [field]: event.target.value, ...(field === "className" && { section: "" }) }));

  const search = (event) => {
    event.preventDefault();
    const incomplete = REQUIRED.some((field) => !filters[field].trim());
    setMissing(incomplete);
    setQuery(incomplete ? null : toQuery(filters));
  };

  const reset = () => {
    setFilters(EMPTY);
    setQuery(null);
    setMissing(false);
  };

  const invalid = (field) => (missing && !filters[field].trim() ? true : undefined);
  const selects = [
    { id: "result-class", field: "className", label: t("className"), placeholder: t("selectClass"), options: classNames },
    { id: "result-section", field: "section", label: t("section"), placeholder: t("selectSection"), options: sections, disabled: !filters.className },
  ];
  const inputs = [
    { id: "result-first-name", field: "firstName", label: t("firstName"), placeholder: t("firstNamePlaceholder") },
    { id: "result-roll", field: "rollNumber", label: t("rollNumber"), placeholder: t("rollNumberPlaceholder"), inputMode: "numeric" },
  ];

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("pageTitle")} subtitle={t("pageSubtitle")}>
        {branchName && <p className="m-0 mt-4 inline-block rounded-full border border-school-gold/60 px-4 py-1 text-sm font-semibold text-school-gold-soft">{branchName}</p>}
      </PageHero>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-12">
        <SiteCard title={t("searchTitle")}>
          <form onSubmit={search} noValidate className="grid gap-5 sm:grid-cols-2">
            {selects.map(({ id, field, label, placeholder, options, disabled }) => (
              <div key={id}>
                <label htmlFor={id} className="site-label">
                  {label} *
                </label>
                <select id={id} value={filters[field]} onChange={change(field)} disabled={disabled} required aria-invalid={invalid(field)} className="site-input disabled:opacity-60">
                  <option value="">{placeholder}</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {inputs.map(({ id, field, label, placeholder, inputMode }) => (
              <div key={id}>
                <label htmlFor={id} className="site-label">
                  {label} *
                </label>
                <input id={id} type="text" inputMode={inputMode} value={filters[field]} onChange={change(field)} placeholder={placeholder} required aria-invalid={invalid(field)} className="site-input" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label htmlFor="result-exam" className="site-label">
                {t("examName")}
              </label>
              <input id="result-exam" type="text" list="result-exam-names" value={filters.examName} onChange={change("examName")} placeholder={t("examNamePlaceholder")} className="site-input" />
              <datalist id="result-exam-names">
                {examNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            {missing && (
              <p role="alert" className="m-0 text-sm font-semibold text-red-700 sm:col-span-2">
                {t("fillRequired")}
              </p>
            )}
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button type="submit" className="site-cta">
                {t("searchBtn")}
              </button>
              <button type="button" onClick={reset} className="site-cta-ghost">
                {t("resetBtn")}
              </button>
            </div>
          </form>
        </SiteCard>
        {query && <ResultsTable query={query} />}
      </div>
    </PublicPage>
  );
}
