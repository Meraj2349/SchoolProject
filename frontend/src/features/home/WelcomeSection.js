"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiBell } from "react-icons/fi";
import { useChairmanProfile } from "@/hooks/useChairman";
import { useMessages } from "@/hooks/useMessages";
import { useNotices } from "@/hooks/useNotices";
import { isRemoteImage } from "@/lib/assetUrl";
import { dayAndMonth, localized, visibleNotices } from "@/lib/homePage";
import { FOUNDER_PHOTO } from "@/lib/schoolInfo";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import SectionHeading from "./SectionHeading";

const MESSAGE_PREVIEW_CHARS = 600;
const NOTICES_SHOWN = 6;

function ChairmanMessage() {
  const t = useTranslations();
  const language = useLanguageStore((s) => s.language);
  const { data: messages = [] } = useMessages();
  const { data: profile } = useChairmanProfile();
  const shown = messages.find((m) => m.Show === 1 || m.Show === true);
  const message = shown?.Messages || t("chairman.defaultMessage");
  const preview = message.length > MESSAGE_PREVIEW_CHARS ? `${message.slice(0, MESSAGE_PREVIEW_CHARS).trimEnd()}…` : message;
  const name = localized(profile, "name", language) || t("chairman.name");
  const photo = profile?.image_url || FOUNDER_PHOTO;

  return (
    <section aria-labelledby="chairman-title" className="min-w-0 lg:col-span-2">
      <SectionHeading id="chairman-title" eyebrow={t("home.chairman.eyebrow")} title={t("home.chairman.title")} align="left" />
      <div className="flex flex-col gap-6 sm:flex-row">
        <figure className="m-0 shrink-0 text-center">
          <div className="relative mx-auto h-44 w-36 overflow-hidden rounded-sm border-4 border-white shadow-lg ring-2 ring-school-gold">
            <Image src={photo} alt={name} fill sizes="144px" unoptimized={isRemoteImage(photo)} className="object-cover" />
          </div>
          <figcaption className="mt-3">
            <span className="block max-w-40 break-words font-school-heading font-bold text-school-navy">{name}</span>
            <span className="block text-sm text-school-muted">{localized(profile, "title", language) || t("chairman.title")}</span>
          </figcaption>
        </figure>
        <div className="flex flex-col">
          <blockquote className="relative m-0 whitespace-pre-line border-l-4 border-school-gold pl-5 text-school-ink leading-relaxed">
            {preview}
          </blockquote>
          <Link href="/chairman-message" className="mt-4 inline-flex items-center gap-2 self-start font-semibold text-school-navy no-underline hover:text-school-gold">
            {t("home.chairman.readMore")}
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function NoticeBoard() {
  const t = useTranslations("home.noticeBoard");
  const language = useLanguageStore((s) => s.language);
  const { data: notices = [] } = useNotices();
  const shown = visibleNotices(notices, NOTICES_SHOWN);

  return (
    <section aria-labelledby="notice-board-title" className="min-w-0 overflow-hidden rounded-sm border border-school-gold/40 bg-white shadow">
      <h2 id="notice-board-title" className="m-0 flex items-center gap-2 bg-school-navy px-5 py-3 font-school-heading text-lg text-white">
        <FiBell aria-hidden="true" className="text-school-gold" />
        {t("title")}
      </h2>
      {shown.length === 0 ? (
        <p className="m-0 p-5 text-sm text-school-muted">{t("empty")}</p>
      ) : (
        <ul className="m-0 max-h-96 list-none divide-y divide-school-cream-deep overflow-y-auto p-0">
          {shown.map((notice) => {
            const date = dayAndMonth(notice.CreatedAt, language);
            return (
              <li key={notice.NoticeID} className="flex gap-3 px-5 py-3">
                {date && (
                  <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-sm bg-school-cream text-school-navy" aria-hidden="true">
                    <span className="font-school-heading text-lg font-bold leading-none">{date.day}</span>
                    <span className="text-[0.65rem] uppercase">{date.month}</span>
                  </span>
                )}
                <details className="min-w-0 flex-1">
                  <summary className="cursor-pointer break-words font-semibold text-school-ink">{notice.Title}</summary>
                  <p className="m-0 mt-2 whitespace-pre-line break-words text-sm text-school-muted">{notice.Description}</p>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** The chairman's message beside the notice board, as on a classic school website. */
export default function WelcomeSection() {
  return (
    <div className="bg-white py-16 font-school-body">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-3">
        <ChairmanMessage />
        <NoticeBoard />
      </div>
    </div>
  );
}
