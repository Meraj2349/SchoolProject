"use client";

import { useMemo, useState } from "react";
import { FiCalendar, FiPhone, FiUser } from "react-icons/fi";
import { EmptyState, ErrorState, PageHero, PersonAvatar, PublicPage, SiteCard, SiteLoader } from "@/components/site";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";
import { useImages } from "@/hooks/useImages";
import { useStudentSearch } from "@/hooks/useStudents";
import { formatDate, formatNumber } from "@/lib/homePage";
import { exactStudentMatches, fullName, photosBy } from "@/lib/people";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const EMPTY = { firstName: "", rollNumber: "", className: "", section: "" };

const toQuery = (filters) => ({
  FirstName: filters.firstName.trim(),
  RollNumber: filters.rollNumber.trim(),
  ClassName: filters.className,
  Section: filters.section,
});

function StudentCard({ student, photo }) {
  const t = useTranslations("students");
  const language = useLanguageStore((s) => s.language);
  const details = [
    student.Gender && { icon: FiUser, label: t("gender"), value: student.Gender },
    formatDate(student.DateOfBirth, language) && { icon: FiCalendar, label: t("dateOfBirth"), value: formatDate(student.DateOfBirth, language) },
    student.ParentContact && { icon: FiPhone, label: t("parentContact"), value: student.ParentContact },
  ].filter(Boolean);

  return (
    <article className="rounded-sm border-t-4 border-school-gold bg-white p-6 shadow">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <PersonAvatar person={student} photo={photo} size={80} />
        <div className="min-w-0">
          <h3 className="site-heading m-0 break-words text-xl">{fullName(student)}</h3>
          <p className="m-0 mt-1 font-semibold text-school-gold">
            {student.ClassName} – {t("section")} {student.Section}
          </p>
          <p className="m-0 mt-1 text-sm text-school-muted">
            {t("rollNumberLabel")} {formatNumber(student.RollNumber, language)}
          </p>
        </div>
      </div>
      {details.length > 0 && (
        <dl className="m-0 mt-5 grid gap-3 border-t border-school-cream-deep pt-5 sm:grid-cols-3">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-sm bg-school-cream px-3 py-2.5">
              <Icon aria-hidden="true" className="shrink-0 text-school-gold" />
              <div className="min-w-0">
                <dt className="text-xs font-bold uppercase tracking-wide text-school-muted">{label}</dt>
                <dd className="m-0 break-words font-semibold text-school-navy">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

function SearchResults({ query }) {
  const t = useTranslations("students");
  const language = useLanguageStore((s) => s.language);
  const { data, isFetching, isError, refetch } = useStudentSearch(query, true);
  const { data: images = [] } = useImages();
  const photos = useMemo(() => photosBy(images, "StudentID"), [images]);

  if (isFetching) return <SiteLoader label={t("searching")} />;
  if (isError || data?.success === false) return <ErrorState message={t("searchError")} onRetry={refetch} />;

  const found = exactStudentMatches(data?.data ?? [], query);
  if (found.length === 0) return <EmptyState title={t("noStudentsFound")} />;

  return (
    <section aria-labelledby="student-results">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="student-results" className="site-heading m-0 text-2xl">
          {t("searchResults")}
        </h2>
        <span className="rounded-full bg-school-navy px-4 py-1.5 text-sm font-bold text-school-gold-soft" aria-live="polite">
          {formatNumber(found.length, language)} {found.length === 1 ? t("studentFound") : t("studentsFound")}
        </span>
      </div>
      <div className="space-y-5">
        {found.map((student) => (
          <StudentCard key={student.StudentID} student={student} photo={photos.get(student.StudentID)} />
        ))}
      </div>
    </section>
  );
}

export default function StudentListPage() {
  const t = useTranslations("students");
  const branchName = useBranchStore((s) => (s.currentBranchId != null ? s.currentBranchName : null));
  const { data: classNames = [] } = useClassNames();
  const { data: sections = [] } = useStandardSections();
  const [filters, setFilters] = useState(EMPTY);
  const [query, setQuery] = useState(null);
  const [missing, setMissing] = useState(false);

  const change = (field) => (event) =>
    setFilters((previous) => ({ ...previous, [field]: event.target.value, ...(field === "className" && { section: "" }) }));

  const search = (event) => {
    event.preventDefault();
    const incomplete = Object.values(filters).some((value) => !value.trim());
    setMissing(incomplete);
    setQuery(incomplete ? null : toQuery(filters));
  };

  const reset = () => {
    setFilters(EMPTY);
    setQuery(null);
    setMissing(false);
  };

  const selects = [
    { id: "student-class", field: "className", label: t("className"), placeholder: t("selectClass"), options: classNames },
    { id: "student-section", field: "section", label: t("section"), placeholder: t("selectSection"), options: sections, disabled: !filters.className },
  ];
  const inputs = [
    { id: "student-first-name", field: "firstName", label: t("firstName"), placeholder: t("firstNamePlaceholder") },
    { id: "student-roll", field: "rollNumber", label: t("rollNumber"), placeholder: t("rollNumberPlaceholder"), inputMode: "numeric" },
  ];

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("pageTitle")} subtitle={t("pageSubtitle")}>
        {branchName && <p className="m-0 mt-4 inline-block rounded-full border border-school-gold/60 px-4 py-1 text-sm font-semibold text-school-gold-soft">{branchName}</p>}
      </PageHero>
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
        <SiteCard title={t("searchTitle")}>
          <p className="m-0 mb-5 border-l-4 border-school-gold bg-school-cream px-4 py-3 text-sm text-school-ink">{t("allFieldsRequired")}</p>
          <form onSubmit={search} noValidate className="grid gap-5 sm:grid-cols-2">
            {selects.map(({ id, field, label, placeholder, options, disabled }) => (
              <div key={id}>
                <label htmlFor={id} className="site-label">
                  {label} *
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
            {inputs.map(({ id, field, label, placeholder, inputMode }) => (
              <div key={id}>
                <label htmlFor={id} className="site-label">
                  {label} *
                </label>
                <input
                  id={id}
                  type="text"
                  inputMode={inputMode}
                  value={filters[field]}
                  onChange={change(field)}
                  placeholder={placeholder}
                  required
                  aria-invalid={missing && !filters[field].trim() ? true : undefined}
                  className="site-input"
                />
              </div>
            ))}
            {missing && (
              <p role="alert" className="m-0 text-sm font-semibold text-red-700 sm:col-span-2">
                {t("fillAllFields")}
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
        {query && <SearchResults query={query} />}
      </div>
    </PublicPage>
  );
}
