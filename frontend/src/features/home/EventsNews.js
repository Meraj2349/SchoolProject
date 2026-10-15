"use client";

import Link from "next/link";
import { FiArrowRight, FiCalendar, FiMapPin } from "react-icons/fi";
import { useEvents } from "@/hooks/useEvents";
import { useNews } from "@/hooks/useNews";
import { dayAndMonth, localized, upcomingEvents } from "@/lib/homePage";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const ITEMS_SHOWN = 4;

function DateBadge({ value }) {
  const language = useLanguageStore((s) => s.language);
  const date = dayAndMonth(value, language);
  if (!date) return null;
  return (
    <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-sm bg-school-navy text-white" aria-hidden="true">
      <span className="font-school-heading text-xl font-bold leading-none text-school-gold-soft">{date.day}</span>
      <span className="text-xs uppercase">{date.month}</span>
    </span>
  );
}

function Panel({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="min-w-0 rounded-sm bg-white p-6 shadow">
      <h2 id={id} className="site-heading m-0 text-xl">
        {title}
      </h2>
      <span className="site-rule mb-4" aria-hidden="true" />
      {children}
    </section>
  );
}

// A page of this site ("/events" but not "//host"), or an outside web address.
const isLocal = (href) => /^\/(?!\/)/.test(href);
const isWeb = (href) => /^https?:\/\//i.test(href);

/** Upcoming events and the latest news, side by side. */
export default function EventsNews() {
  const t = useTranslations("home");
  const language = useLanguageStore((s) => s.language);
  const { data: events = [] } = useEvents();
  const { data: news = [] } = useNews();
  const shownEvents = upcomingEvents(events, new Date(), ITEMS_SHOWN);
  const shownNews = news.slice(0, ITEMS_SHOWN);

  return (
    <div className="bg-school-cream-deep py-16 font-school-body">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-2">
        <Panel id="events-title" title={t("events.title")}>
          {shownEvents.length === 0 ? (
            <p className="m-0 text-sm text-school-muted">{t("events.empty")}</p>
          ) : (
            <ul className="m-0 list-none space-y-4 p-0">
              {shownEvents.map((event) => (
                <li key={event.EventID} className="flex gap-4">
                  <DateBadge value={event.StartDate} />
                  <div className="min-w-0">
                    <p className="m-0 break-words font-semibold text-school-ink">{event.EventName}</p>
                    {event.Venue && (
                      <p className="m-0 mt-1 flex items-center gap-1 text-sm text-school-muted">
                        <FiMapPin aria-hidden="true" />
                        {event.Venue}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link href="/events" className="mt-5 inline-flex items-center gap-2 font-semibold text-school-navy no-underline hover:text-school-gold">
            <FiCalendar aria-hidden="true" />
            {t("events.all")}
            <FiArrowRight aria-hidden="true" />
          </Link>
        </Panel>
        <Panel id="news-title" title={t("news.title")}>
          {shownNews.length === 0 ? (
            <p className="m-0 text-sm text-school-muted">{t("news.empty")}</p>
          ) : (
            <ul className="m-0 list-none space-y-4 p-0">
              {shownNews.map((item) => {
                const href = item.link || "/events";
                const title = localized(item, "title", language);
                const linkClass = "min-w-0 break-words font-semibold text-school-ink no-underline hover:text-school-navy hover:underline";
                return (
                  <li key={item.id} className="flex gap-4">
                    <DateBadge value={item.date} />
                    {isLocal(href) ? (
                      <Link href={href} className={linkClass}>
                        {title}
                      </Link>
                    ) : isWeb(href) ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {title}
                      </a>
                    ) : (
                      <span className={linkClass}>{title}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
