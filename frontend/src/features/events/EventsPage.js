"use client";

import { useEffect, useState } from "react";
import { FiBookOpen, FiCalendar, FiMapPin, FiMusic, FiTarget } from "react-icons/fi";
import { EmptyState, ErrorState, PageHero, PublicPage, SiteLoader } from "@/components/site";
import { useEvents } from "@/hooks/useEvents";
import { formatDate, formatNumber } from "@/lib/homePage";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import { countdown, endOf, isHappening, splitEvents } from "./eventTimes";

const TYPE_ICONS = { Academic: FiBookOpen, Sports: FiTarget, Cultural: FiMusic };
const TRANSLATED_TYPES = ["Academic", "Sports", "Cultural", "Other"];
const COUNTDOWN_UNITS = ["days", "hours", "minutes", "seconds"];

/** Ticks once a second on its own, so the rest of the page does not re-render. */
function Countdown({ end }) {
  const t = useTranslations("events");
  const language = useLanguageStore((s) => s.language);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = countdown(end, now);
  if (!left) return <p className="m-0 text-sm font-semibold text-school-muted">{t("eventEnded")}</p>;
  return (
    <div>
      <p className="m-0 mb-2 text-xs font-bold uppercase tracking-wider text-school-muted">{t("endsIn")}</p>
      <dl className="m-0 grid grid-cols-4 gap-2 text-center">
        {COUNTDOWN_UNITS.map((unit) => (
          <div key={unit} className="rounded-sm bg-school-navy px-1 py-2 text-white">
            <dd className="m-0 font-school-heading text-xl font-bold text-school-gold-soft">{formatNumber(left[unit], language)}</dd>
            <dt className="text-[0.65rem] uppercase tracking-wide text-white/75">{t(unit)}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EventCard({ event, past = false }) {
  const t = useTranslations("events");
  const language = useLanguageStore((s) => s.language);
  const Icon = TYPE_ICONS[event.EventType] ?? FiCalendar;
  const happening = !past && isHappening(event);
  const start = formatDate(event.StartDate, language);
  const end = formatDate(event.EndDate, language);
  return (
    <li className={`flex flex-col gap-4 rounded-sm border-t-4 bg-white p-5 shadow ${past ? "border-school-muted/40 opacity-80" : "border-school-gold"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-school-cream px-3 py-1 text-xs font-bold text-school-navy">
          <Icon aria-hidden="true" className="text-school-gold" />
          {TRANSLATED_TYPES.includes(event.EventType) ? t(`types.${event.EventType}`) : event.EventType}
        </span>
        {happening && <span className="rounded-full bg-school-gold px-2.5 py-0.5 text-xs font-bold text-school-navy">{t("happeningNow")}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="site-heading m-0 break-words text-lg">{event.EventName}</h3>
        <p className="m-0 mt-1 flex items-center gap-1.5 text-sm text-school-muted">
          <FiCalendar aria-hidden="true" />
          {start}
          {end && end !== start && ` – ${end}`}
        </p>
        {event.Venue && (
          <p className="m-0 mt-1 flex items-center gap-1.5 text-sm text-school-muted">
            <FiMapPin aria-hidden="true" />
            {event.Venue}
          </p>
        )}
        {event.Description && <p className="m-0 mt-3 whitespace-pre-line break-words text-sm text-school-ink">{event.Description}</p>}
      </div>
      {!past && <Countdown end={endOf(event)} />}
    </li>
  );
}

function EventList({ id, title, events, past }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="site-heading m-0 text-2xl">
        {title}
      </h2>
      <span className="site-rule mb-6" aria-hidden="true" />
      <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.EventID} event={event} past={past} />
        ))}
      </ul>
    </section>
  );
}

export default function EventsPage() {
  const t = useTranslations("events");
  const language = useLanguageStore((s) => s.language);
  const { data: events = [], isLoading, isError, refetch } = useEvents();
  const { upcoming, past } = splitEvents(Array.isArray(events) ? events : []);
  const count = (n) => formatNumber(n, language);

  return (
    <PublicPage className="bg-school-cream">
      <PageHero title={t("title")} subtitle={t("subtitle")} />
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-12">
        {isLoading ? (
          <SiteLoader label={t("loadingEvents")} />
        ) : isError ? (
          <ErrorState message={t("errorLoadingEvents")} onRetry={refetch} />
        ) : (
          <>
            {upcoming.length > 0 ? (
              <EventList id="upcoming-title" title={`${t("upcomingEvents")} (${count(upcoming.length)})`} events={upcoming} />
            ) : (
              <EmptyState title={t("noUpcomingEvents")} message={t("checkBackLater")} icon={FiCalendar} />
            )}
            {past.length > 0 && <EventList id="past-title" title={`${t("pastEvents")} (${count(past.length)})`} events={past} past />}
          </>
        )}
      </div>
    </PublicPage>
  );
}
