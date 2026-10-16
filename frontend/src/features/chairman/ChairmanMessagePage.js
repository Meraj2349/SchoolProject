"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import { PageHero, PublicPage, SiteImage, SiteLoader } from "@/components/site";
import { useChairmanProfile } from "@/hooks/useChairman";
import { useMessages } from "@/hooks/useMessages";
import { localized } from "@/lib/homePage";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const CHAIRMAN_PHOTO = "/images/WhatsApp Image 2024-12-07 at 20.48.41_3423f492.jpg";
const isShown = (m) => m.Show === 1 || m.Show === true;

/** The chairman's full message, in the reader's language. */
export default function ChairmanMessagePage() {
  const t = useTranslations("chairman");
  const language = useLanguageStore((s) => s.language);
  const { data: messages = [], isLoading: messagesLoading } = useMessages();
  const { data: profile, isLoading: profileLoading } = useChairmanProfile();

  const name = localized(profile, "name", language) || t("name");
  const title = localized(profile, "title", language) || t("title");
  const institution = localized(profile, "institution", language) || t("institution");
  const message = [...messages].filter(isShown).sort((a, b) => a.MessageID - b.MessageID)[0]?.Messages || t("defaultMessage");

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("pageTitle")} subtitle={institution} />
      {messagesLoading || profileLoading ? (
        <SiteLoader label={t("loading")} />
      ) : (
        <article className="mx-auto max-w-4xl px-4 py-14">
          <div className="grid gap-8 rounded-sm bg-white p-6 shadow-lg md:grid-cols-[220px_1fr] md:p-10">
            <figure className="m-0 text-center">
              <div className="relative mx-auto h-64 w-48 overflow-hidden rounded-sm border-4 border-white shadow-lg ring-2 ring-school-gold">
                <SiteImage src={profile?.image_url || CHAIRMAN_PHOTO} alt={`${name} – ${title}`} fill sizes="192px" className="object-cover" />
              </div>
              <figcaption className="mt-4">
                <span className="block break-words font-school-heading text-lg font-bold text-school-navy">{name}</span>
                <span className="block text-sm text-school-muted">{title}</span>
                <span className="block text-sm text-school-muted">{institution}</span>
              </figcaption>
            </figure>
            <div className="min-w-0">
              <blockquote className="m-0 whitespace-pre-line break-words border-l-4 border-school-gold pl-6 text-lg leading-relaxed text-school-ink">
                {message}
              </blockquote>
              <div className="mt-8 border-t border-school-cream-deep pt-5">
                <p className="m-0 text-school-muted">{t("bestRegards")}</p>
                <p className="m-0 mt-1 font-school-heading text-lg font-bold text-school-navy">{name}</p>
                <p className="m-0 text-sm text-school-muted">
                  {title}, {institution}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link href="/" className="site-cta">
              <FiArrowLeft aria-hidden="true" />
              {t("backToHome")}
            </Link>
          </div>
        </article>
      )}
    </PublicPage>
  );
}
