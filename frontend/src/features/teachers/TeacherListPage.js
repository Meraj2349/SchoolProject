"use client";

import { useMemo, useState } from "react";
import { FiBookOpen, FiCalendar, FiMail, FiPhone, FiUserCheck } from "react-icons/fi";
import { EmptyState, ErrorState, PageHero, PersonAvatar, PublicPage, SiteLoader } from "@/components/site";
import { useClasses, useClassNames } from "@/hooks/useClasses";
import { useImages } from "@/hooks/useImages";
import { useTeachers } from "@/hooks/useTeachers";
import { formatDate, formatNumber } from "@/lib/homePage";
import { classesTaughtBy, filterTeachers, fullName, photosBy } from "@/lib/people";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const EMPTY_FILTERS = { search: "", field: "all", className: "", section: "" };

function TeacherCard({ teacher, photo, classes }) {
  const t = useTranslations("teachers");
  const language = useLanguageStore((s) => s.language);
  const joined = formatDate(teacher.JoiningDate, language);
  const details = [
    teacher.Email && { icon: FiMail, value: teacher.Email, href: `mailto:${teacher.Email}` },
    teacher.ContactNumber && { icon: FiPhone, value: teacher.ContactNumber, href: `tel:${teacher.ContactNumber}` },
    joined && { icon: FiCalendar, value: `${t("joined")} ${joined}` },
  ].filter(Boolean);

  return (
    <article className="flex flex-col items-center rounded-sm border-t-4 border-school-gold bg-white p-6 text-center shadow">
      <PersonAvatar person={teacher} photo={photo} />
      <h3 className="site-heading m-0 mt-4 break-words text-lg">{fullName(teacher)}</h3>
      {teacher.Subject && (
        <p className="m-0 mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-school-gold">
          <FiBookOpen aria-hidden="true" />
          {teacher.Subject}
        </p>
      )}
      {classes.length > 0 && (
        <p className="m-0 mt-2 inline-flex items-center gap-1.5 rounded-full bg-school-cream px-3 py-1 text-xs font-semibold text-school-navy">
          <FiUserCheck aria-hidden="true" />
          {t("classTeacher")}: {classes.map((c) => `${c.ClassName} – ${c.Section}`).join(", ")}
        </p>
      )}
      {details.length > 0 && (
        <ul className="m-0 mt-4 w-full list-none space-y-1.5 border-t border-school-cream-deep p-0 pt-4 text-left text-sm">
          {details.map(({ icon: Icon, value, href }) => (
            <li key={value} className="flex min-w-0 items-center gap-2 text-school-muted">
              <Icon aria-hidden="true" className="shrink-0 text-school-gold" />
              {href ? (
                <a href={href} className="break-all text-school-ink no-underline hover:underline">
                  {value}
                </a>
              ) : (
                <span>{value}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function TeacherListPage() {
  const t = useTranslations("teachers");
  const language = useLanguageStore((s) => s.language);
  const { data: teachers = [], isLoading, isError, refetch } = useTeachers();
  const { data: classes = [] } = useClasses();
  const { data: classNames = [] } = useClassNames();
  const { data: images = [] } = useImages();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const photos = useMemo(() => photosBy(images, "TeacherID"), [images]);
  const sections = [...new Set(classes.filter((c) => c.ClassName === filters.className).map((c) => c.Section))].sort();
  const shown = filterTeachers(teachers, classes, filters);
  const change = (field) => (event) =>
    setFilters((previous) => ({ ...previous, [field]: event.target.value, ...(field === "className" && { section: "" }) }));

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("pageTitle")} subtitle={t("pageSubtitle")} />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="mb-8 grid gap-4 rounded-sm bg-white p-5 shadow md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end">
          <div>
            <label htmlFor="teacher-search" className="site-label">
              {t("searchLabel")}
            </label>
            <input id="teacher-search" type="search" value={filters.search} onChange={change("search")} placeholder={t("searchPlaceholder")} className="site-input" />
          </div>
          <div>
            <label htmlFor="teacher-field" className="site-label">
              {t("searchIn")}
            </label>
            <select id="teacher-field" value={filters.field} onChange={change("field")} className="site-input">
              <option value="all">{t("allFields")}</option>
              <option value="name">{t("name")}</option>
              <option value="subject">{t("subject")}</option>
              <option value="email">{t("email")}</option>
            </select>
          </div>
          <div>
            <label htmlFor="teacher-class" className="site-label">
              {t("className")}
            </label>
            <select id="teacher-class" value={filters.className} onChange={change("className")} className="site-input">
              <option value="">{t("allClasses")}</option>
              {classNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="teacher-section" className="site-label">
              {t("section")}
            </label>
            <select id="teacher-section" value={filters.section} onChange={change("section")} disabled={!filters.className} className="site-input disabled:opacity-60">
              <option value="">{t("allSections")}</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={() => setFilters(EMPTY_FILTERS)} className="site-cta">
            {t("clear")}
          </button>
        </form>

        {isLoading ? (
          <SiteLoader label={t("loadingTeachers")} />
        ) : isError ? (
          <ErrorState message={t("failedToFetch")} onRetry={refetch} />
        ) : shown.length === 0 ? (
          <EmptyState title={t("noTeachersFound")} />
        ) : (
          <>
            <p className="m-0 mb-4 text-sm text-school-muted" aria-live="polite">
              {formatNumber(shown.length, language)} {shown.length === 1 ? t("teacherFound") : t("teachersFound")}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((teacher) => (
                <TeacherCard key={teacher.TeacherID} teacher={teacher} photo={photos.get(teacher.TeacherID)} classes={classesTaughtBy(classes, teacher.TeacherID)} />
              ))}
            </div>
          </>
        )}
      </div>
    </PublicPage>
  );
}
