"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useEvents } from "@/hooks/useEvents";
import { useTranslations } from "@/store/languageStore";

const TYPE_INFO = {
  Academic: { icon: "📚", color: "#1e40af", bgColor: "#dbeafe" },
  Sports: { icon: "⚽", color: "#059669", bgColor: "#d1fae5" },
  Cultural: { icon: "🎭", color: "#7c2d12", bgColor: "#fed7aa" },
  Other: { icon: "📅", color: "#374151", bgColor: "#f3f4f6" },
};

function getTypeInfo(type) {
  return TYPE_INFO[type] ?? TYPE_INFO.Other;
}
function fmtDate(d) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function EventsPage() {
  const { data: allEvents = [], isLoading, isError, refetch } = useEvents();
  const [countdowns, setCountdowns] = useState({});
  const t = useTranslations("events");

  const now = new Date();
  const allEventsList = Array.isArray(allEvents) ? allEvents : [];
  const events = allEventsList.filter((e) => new Date(e.EndDate) >= now);
  const pastEvents = allEventsList.filter((e) => new Date(e.EndDate) < now);

  useEffect(() => {
    const list = Array.isArray(allEvents) ? allEvents : [];
    const active = list.filter((e) => new Date(e.EndDate) >= new Date());
    const tick = () => {
      const n = new Date();
      const next = {};
      active.forEach((e) => {
        const end = new Date(e.EndDate + "T23:59:59");
        const diff = end - n;
        if (diff > 0) {
          next[e.EventID] = {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
            isExpired: false,
          };
        } else {
          next[e.EventID] = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
          };
        }
      });
      setCountdowns(next);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [allEvents]);

  const isToday = (s, e) => {
    const n = new Date();
    return n >= new Date(s) && n <= new Date(e);
  };

  const COUNTDOWN_UNITS = [
    { key: "days", labelKey: "days" },
    { key: "hours", labelKey: "hours" },
    { key: "minutes", labelKey: "minutes" },
    { key: "seconds", labelKey: "seconds" },
  ];

  function EventCard({ event, expired = false }) {
    const info = getTypeInfo(event.EventType);
    const cd = countdowns[event.EventID];
    const today = isToday(event.StartDate, event.EndDate);
    return (
      <div
        className={`bg-white rounded-2xl border-l-4 shadow-md p-6 transition-all duration-300 relative overflow-hidden flex flex-col gap-4 hover:-translate-y-1.5 hover:shadow-xl ${today ? "bg-gradient-to-br from-amber-50 to-white" : ""} ${expired ? "opacity-70" : ""}`}
        style={{ borderColor: info.color }}
      >
        {today && (
          <div
            className="inline-flex items-center gap-1.5 text-white text-[11px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full w-fit"
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            }}
          >
            <span className="w-[7px] h-[7px] rounded-full bg-white animate-pulse inline-block" />
            {t("happeningNow")}
          </div>
        )}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ backgroundColor: info.bgColor, color: info.color }}
          >
            <span className="text-sm">{info.icon}</span>
            {event.EventType}
          </div>
          <div className="text-xs text-gray-500 font-medium text-right leading-snug">
            {fmtDate(event.StartDate)}
            {event.StartDate !== event.EndDate && (
              <> – {fmtDate(event.EndDate)}</>
            )}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="text-[1.1rem] font-bold text-gray-900 leading-snug m-0">
            {event.EventName}
          </h3>
          {event.Venue && (
            <div className="text-xs text-gray-500">📍 {event.Venue}</div>
          )}
          {event.Description && (
            <p className="text-sm text-gray-600 leading-relaxed m-0">
              {event.Description}
            </p>
          )}
          {cd && !cd.isExpired && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3.5 mt-2 border border-green-200">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-green-900 m-0 mb-2.5">
                {t("endsIn")}
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {COUNTDOWN_UNITS.map(({ key, labelKey }) => (
                  <div
                    key={key}
                    className="bg-white rounded-lg p-2 text-center shadow-sm"
                  >
                    <span className="block text-2xl font-extrabold text-emerald-600 leading-none tabular-nums">
                      {cd[key]}
                    </span>
                    <span className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-0.5">
                      {t(labelKey)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cd?.isExpired && (
            <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full w-fit mt-2">
              {t("eventEnded")}
            </div>
          )}
          {expired && !cd && (
            <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full w-fit mt-2">
              {t("eventEnded")}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <LatestUpdatesNotice />
      <div className="max-w-[1200px] mx-auto px-5 py-14 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[40vh]">
            <div className="w-11 h-11 border-[3px] border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-gray-500 text-sm m-0">{t("loadingEvents")}</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[40vh] text-center">
            <div className="text-5xl opacity-60">⚠️</div>
            <h3 className="text-xl font-bold text-gray-700 m-0">
              {t("errorLoadingEvents")}
            </h3>
            <button
              onClick={refetch}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-none px-6 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {t("tryAgain")}
            </button>
          </div>
        ) : allEventsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[40vh] text-center">
            <div className="text-5xl opacity-60">📅</div>
            <h3 className="text-xl font-bold text-gray-700 m-0">
              {t("noUpcomingEvents")}
            </h3>
            <p className="text-gray-500 text-sm m-0">{t("checkBackLater")}</p>
          </div>
        ) : (
          <div>
            {events.length > 0 && (
              <h2
                className="flex items-center gap-3 font-extrabold text-gray-900 mb-8"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
              >
                <span
                  className="inline-block w-[5px] h-7 rounded-sm flex-shrink-0"
                  style={{
                    background: "linear-gradient(180deg, #10b981, #059669)",
                  }}
                />
                {t("upcomingEvents")} ({events.length})
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
              {events.map((event) => (
                <EventCard key={event.EventID} event={event} />
              ))}
            </div>

            {pastEvents.length > 0 && (
              <>
                <h2
                  className="flex items-center gap-3 font-extrabold text-gray-900 mt-8 mb-8 opacity-70"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
                >
                  <span className="inline-block w-[5px] h-7 rounded-sm flex-shrink-0 bg-gray-400" />
                  Past Events ({pastEvents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6 opacity-65">
                  {pastEvents.map((event) => (
                    <EventCard key={event.EventID} event={event} expired />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
