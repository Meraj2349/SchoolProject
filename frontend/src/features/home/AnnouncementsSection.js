"use client";

import Image from "next/image";
import { usePublishedNoticeAnnouncements } from "@/hooks/useNoticeAnnouncements";
import { assetUrl, isRemoteImage } from "@/lib/assetUrl";
import { localized } from "@/lib/homePage";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import SectionHeading from "./SectionHeading";

const ANNOUNCEMENTS_SHOWN = 6;

/** Image notices from the school (admission, exam, ...). Left out when there are none. */
export default function AnnouncementsSection() {
  const t = useTranslations("home.announcements");
  const language = useLanguageStore((s) => s.language);
  const { data: items = [] } = usePublishedNoticeAnnouncements();
  if (items.length === 0) return null;

  const dateOf = (value) =>
    value ? new Date(value).toLocaleDateString(language === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <section aria-labelledby="announcements-title" className="bg-white py-16 font-school-body">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading id="announcements-title" eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, ANNOUNCEMENTS_SHOWN).map((item) => (
            <li key={item.id} className="overflow-hidden rounded-sm border border-school-cream-deep bg-white shadow-sm">
              <div className="relative h-48 bg-school-cream-deep">
                {item.image_url && (
                  <Image
                    src={assetUrl(item.image_url)}
                    alt={localized(item, "title", language)}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    unoptimized={isRemoteImage(assetUrl(item.image_url))}
                    className="object-cover"
                  />
                )}
                <span className="absolute left-3 top-3 rounded-sm bg-school-navy px-2 py-0.5 text-xs font-bold text-school-gold-soft">
                  {t(`categories.${item.category}`)}
                </span>
              </div>
              <div className="p-4">
                <p className="m-0 text-xs text-school-muted">{dateOf(item.date)}</p>
                <p className="m-0 mt-1 font-school-heading font-bold text-school-navy">{localized(item, "title", language)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
