"use client";

import Link from "next/link";
import { FiArrowLeft, FiFileText } from "react-icons/fi";
import { EmptyState, PageHero, PublicPage, SiteCard, SiteImage, SiteLoader } from "@/components/site";
import { useJobCircular } from "@/hooks/useJobCirculars";
import { assetUrl } from "@/lib/assetUrl";
import { localized } from "@/lib/homePage";
import { HEAD_OFFICE_MOBILES } from "@/lib/schoolInfo";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import ApplyForm from "./ApplyForm";
import { CircularFacts, CircularStatus, PostsTable } from "./CircularParts";

const isPdf = (url) => /\.pdf$/i.test(url ?? "");

function HowToApply({ circular }) {
  const t = useTranslations("jobs");
  const language = useLanguageStore((s) => s.language);
  const facts = [
    [t("submitTo"), t("headOffice")],
    [t("officeHours"), t("hoursValue")],
  ];
  return (
    <SiteCard id="how-to-apply" title={t("howToApply")}>
      <p className="m-0 mb-5 whitespace-pre-line leading-relaxed text-school-ink">{localized(circular, "how_to_apply", language) || t("howToApplyDefault")}</p>
      <dl className="m-0 grid gap-4 text-sm sm:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold uppercase tracking-wide text-school-muted">{label}</dt>
            <dd className="m-0 font-semibold text-school-navy">{value}</dd>
          </div>
        ))}
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-school-muted">{t("mobile")}</dt>
          <dd className="m-0">
            <ul className="m-0 list-none space-y-1 p-0">
              {HEAD_OFFICE_MOBILES.map(({ display, href }) => (
                <li key={display}>
                  <a href={href} className="font-semibold text-school-navy no-underline hover:underline">
                    {display}
                  </a>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </SiteCard>
  );
}

function Poster({ circular, title }) {
  const t = useTranslations("jobs");
  if (!circular.image_url) return null;
  const href = assetUrl(circular.image_url);
  return isPdf(circular.image_url) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="site-cta-ghost">
      <FiFileText aria-hidden="true" />
      {t("viewCircular")}
    </a>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-sm border border-school-cream-deep bg-white" title={t("viewCircular")}>
      <SiteImage src={circular.image_url} alt={title} width={1080} height={1398} sizes="(min-width: 1024px) 320px, 100vw" className="h-auto w-full" />
    </a>
  );
}

/** One circular: its posts, how to apply by hand, and the online form while it is open. */
export default function JobCircularPage({ id }) {
  const t = useTranslations("jobs");
  const language = useLanguageStore((s) => s.language);
  const { data: circular, isLoading, isError } = useJobCircular(id);
  const title = circular ? localized(circular, "title", language) : t("pageTitle");
  const trail = [{ label: t("pageTitle"), href: "/jobs" }];

  let content;
  if (isLoading) content = <SiteLoader />;
  else if (isError || !circular) content = <EmptyState title={t("notFound")} />;
  else
    content = (
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-8">
          <SiteCard>
            <div className="mb-4 flex justify-end">
              <CircularStatus circular={circular} />
            </div>
            <div className="mb-5">
              <CircularFacts circular={circular} />
            </div>
            <PostsTable posts={circular.posts} />
          </SiteCard>
          <HowToApply circular={circular} />
          <SiteCard id="apply-online" title={t("applyTitle")}>
            {circular.accepting ? (
              <>
                <p className="m-0 mb-5 text-sm text-school-muted">{t("applyIntro")}</p>
                <ApplyForm circular={circular} />
              </>
            ) : (
              <p className="m-0 font-semibold text-school-muted">{t("closedNote")}</p>
            )}
          </SiteCard>
        </div>
        <aside className="space-y-4">
          <Poster circular={circular} title={title} />
        </aside>
      </div>
    );

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={title} trail={trail} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        {content}
        <div className="mt-10">
          <Link href="/jobs" className="site-cta-ghost">
            <FiArrowLeft aria-hidden="true" />
            {t("backToJobs")}
          </Link>
        </div>
      </div>
    </PublicPage>
  );
}
