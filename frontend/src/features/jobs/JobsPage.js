"use client";

import Link from "next/link";
import { FiArrowRight, FiBriefcase, FiFileText } from "react-icons/fi";
import { EmptyState, ErrorState, PageHero, PublicPage, SiteLoader } from "@/components/site";
import { usePublishedJobCirculars } from "@/hooks/useJobCirculars";
import { assetUrl } from "@/lib/assetUrl";
import { localized } from "@/lib/homePage";
import { splitCirculars } from "@/lib/jobCirculars";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { CircularFacts, CircularStatus, PostsTable } from "./CircularParts";

function CircularCard({ circular }) {
  const t = useTranslations("jobs");
  const language = useLanguageStore((s) => s.language);
  return (
    <article className="rounded-sm border-t-4 border-school-gold bg-white p-5 shadow sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h3 className="site-heading m-0 min-w-0 break-words text-xl">{localized(circular, "title", language)}</h3>
        <CircularStatus circular={circular} />
      </div>
      <div className="mb-4">
        <CircularFacts circular={circular} />
      </div>
      <PostsTable posts={circular.posts} />
      <div className="mt-5 flex flex-wrap gap-3">
        {circular.accepting ? (
          <Link href={`/jobs/${circular.id}`} className="site-cta">
            {t("applyOnline")}
            <FiArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <Link href={`/jobs/${circular.id}`} className="site-cta-ghost">
            {t("details")}
          </Link>
        )}
        {circular.image_url && (
          <a href={assetUrl(circular.image_url)} target="_blank" rel="noopener noreferrer" className="site-cta-ghost">
            <FiFileText aria-hidden="true" />
            {t("viewCircular")}
          </a>
        )}
      </div>
    </article>
  );
}

function Section({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="space-y-5">
      <h2 id={id} className="site-heading m-0 text-2xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Job circulars (নিয়োগ বিজ্ঞপ্তি): those taking applications first, then past ones. */
export default function JobsPage() {
  const t = useTranslations("jobs");
  const { data: circulars = [], isLoading, isError, refetch } = usePublishedJobCirculars();
  const { open, past } = splitCirculars(circulars);

  let content;
  if (isLoading) content = <SiteLoader />;
  else if (isError) content = <ErrorState message={t("loadFailed")} onRetry={refetch} />;
  else if (circulars.length === 0) content = <EmptyState title={t("none")} message={t("noneBody")} icon={FiBriefcase} />;
  else
    content = (
      <div className="space-y-12">
        <Section id="jobs-open" title={t("openTitle")}>
          {open.length ? open.map((c) => <CircularCard key={c.id} circular={c} />) : <EmptyState title={t("noneOpen")} icon={FiBriefcase} />}
        </Section>
        {past.length > 0 && (
          <Section id="jobs-past" title={t("pastTitle")}>
            {past.map((c) => (
              <CircularCard key={c.id} circular={c} />
            ))}
          </Section>
        )}
      </div>
    );

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("pageTitle")} subtitle={t("pageSubtitle")} />
      <div className="mx-auto max-w-5xl px-4 py-12">{content}</div>
    </PublicPage>
  );
}
