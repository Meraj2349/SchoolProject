"use client";

import { useMemo, useState } from "react";
import { FiCalendar, FiClock, FiDownload, FiUsers } from "react-icons/fi";
import { EmptyState, ErrorState, PageHero, PublicPage, SiteLoader } from "@/components/site";
import { useRoutineFilterOptions, useRoutines } from "@/hooks/useRoutines";
import { assetUrl } from "@/lib/assetUrl";
import { formatDate, formatNumber } from "@/lib/homePage";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { fileKind, filterRoutines } from "./routineFilters";

const PER_PAGE = 12;
const EMPTY_FILTERS = { className: "", section: "", search: "" };
const VIEW_LABEL = { pdf: "viewPDF", image: "viewImage", file: "view" };

function RoutineCard({ routine }) {
  const t = useTranslations("routine");
  const language = useLanguageStore((s) => s.language);
  const kind = fileKind(routine);
  const added = formatDate(routine.CreatedDate, language);

  return (
    <article className="flex flex-col rounded-sm border-t-4 border-school-gold bg-white p-6 shadow">
      <div className="flex items-start justify-between gap-3">
        <h3 className="site-heading m-0 min-w-0 break-words text-lg">{routine.RoutineTitle}</h3>
        {(kind === "pdf" || kind === "image") && (
          <span className="shrink-0 rounded-sm bg-school-navy px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-school-gold-soft">
            {t(`fileTypes.${kind}`)}
          </span>
        )}
      </div>
      <p className="m-0 mt-2 inline-flex items-center gap-2 text-sm font-semibold text-school-gold">
        <FiUsers aria-hidden="true" />
        {routine.ClassName} – {routine.Section}
      </p>
      <p className="m-0 mt-3 inline-flex items-center gap-2 font-medium text-school-ink">
        <FiCalendar aria-hidden="true" className="text-school-gold" />
        {formatDate(routine.RoutineDate, language)}
      </p>
      {routine.Description && <p className="m-0 mt-3 leading-relaxed text-school-muted">{routine.Description}</p>}
      {kind && (
        <a href={assetUrl(routine.FileURL)} target="_blank" rel="noopener noreferrer" className="site-cta-ghost mt-4 self-start">
          <FiDownload aria-hidden="true" />
          {t(VIEW_LABEL[kind])}
        </a>
      )}
      {added && (
        <div className="mt-auto pt-4">
          <p className="m-0 flex items-center gap-1.5 border-t border-school-cream-deep pt-4 text-sm text-school-muted">
            <FiClock aria-hidden="true" />
            {t("added")} {added}
          </p>
        </div>
      )}
    </article>
  );
}

function Pagination({ page, pages, onChange }) {
  const t = useTranslations("routine");
  const language = useLanguageStore((s) => s.language);
  if (pages <= 1) return null;
  return (
    <nav aria-label={t("pagination")} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} className="site-cta-ghost disabled:opacity-50">
        {t("previous")}
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-current={n === page ? "page" : undefined}
          className={`h-10 w-10 rounded-sm border font-semibold ${n === page ? "border-school-navy bg-school-navy text-school-gold-soft" : "border-school-cream-deep bg-white text-school-navy hover:border-school-gold"}`}
        >
          {formatNumber(n, language)}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pages} className="site-cta-ghost disabled:opacity-50">
        {t("next")}
      </button>
    </nav>
  );
}

export default function RoutinePage() {
  const t = useTranslations("routine");
  const language = useLanguageStore((s) => s.language);
  const branchName = useBranchStore((s) => (s.currentBranchId != null ? s.currentBranchName : null));
  const { data: routines = [], isLoading, isError, refetch } = useRoutines();
  const { data: options = { classes: [], sections: [] } } = useRoutineFilterOptions();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const shown = useMemo(() => filterRoutines(routines, filters), [routines, filters]);
  const pages = Math.ceil(shown.length / PER_PAGE);
  const paged = shown.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const filtering = Object.values(filters).some(Boolean);

  const change = (field) => (event) => {
    setFilters((previous) => ({ ...previous, [field]: event.target.value }));
    setPage(1);
  };
  const clear = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const selects = [
    { id: "routine-class", field: "className", label: t("class"), all: t("allClasses"), values: options.classes ?? [] },
    { id: "routine-section", field: "section", label: t("section"), all: t("allSections"), values: options.sections ?? [] },
  ];

  let content;
  if (isLoading) content = <SiteLoader label={t("loadingRoutines")} />;
  else if (isError) content = <ErrorState message={t("failedToLoad")} onRetry={refetch} />;
  else
    content = (
      <>
        {/* Stays mounted so screen readers hear the count change, including "0 routines found". */}
        <p className="m-0 mb-4 font-school-heading text-xl font-bold text-school-navy" aria-live="polite">
          {formatNumber(shown.length, language)} {shown.length === 1 ? t("routineFound") : t("routinesFound")}
        </p>
        {shown.length === 0 ? (
          <EmptyState title={t("noRoutinesFound")} message={filtering ? t("tryAdjustFilters") : t("noRoutinesPublished")} />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paged.map((routine) => (
                <RoutineCard key={routine.RoutineID} routine={routine} />
              ))}
            </div>
            <Pagination page={page} pages={pages} onChange={setPage} />
          </>
        )}
      </>
    );

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("pageTitle")} subtitle={t("pageSubtitle")}>
        {branchName && <p className="m-0 mt-4 inline-block rounded-full border border-school-gold/60 px-4 py-1 text-sm font-semibold text-school-gold-soft">{branchName}</p>}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-12">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-8 grid gap-4 rounded-sm bg-white p-5 shadow md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
          <div>
            <label htmlFor="routine-search" className="site-label">
              {t("searchLabel")}
            </label>
            <input id="routine-search" type="search" value={filters.search} onChange={change("search")} placeholder={t("searchPlaceholder")} className="site-input" />
          </div>
          {selects.map(({ id, field, label, all, values }) => (
            <div key={id}>
              <label htmlFor={id} className="site-label">
                {label}
              </label>
              <select id={id} value={filters[field]} onChange={change(field)} className="site-input">
                <option value="">{all}</option>
                {values.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button type="button" onClick={clear} disabled={!filtering} className="site-cta disabled:opacity-60">
            {t("clearAllFilters")}
          </button>
        </form>
        {content}
      </div>
    </PublicPage>
  );
}
