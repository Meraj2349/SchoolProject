"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useEvents } from "@/hooks/useEvents";
import { useTranslations } from "@/store/languageStore";
import "@/styles/EventsPage.css";

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
    const tick = () => {
      const n = new Date();
      const next = {};
      events.forEach((e) => {
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
  }, [events.length]);

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

  return (
    <div className="events-page-public">
      <Navbar />
      <LatestUpdatesNotice />
      <div className="events-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>{t("loadingEvents")}</p>
          </div>
        ) : isError ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>{t("errorLoadingEvents")}</h3>
            <button onClick={refetch} className="retry-btn">
              {t("tryAgain")}
            </button>
          </div>
        ) : allEventsList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>{t("noUpcomingEvents")}</h3>
            <p>{t("checkBackLater")}</p>
          </div>
        ) : (
          <div className="events-list-section">
            {events.length > 0 && (
              <h2>
                {t("upcomingEvents")} ({events.length})
              </h2>
            )}
            <div className="events-grid">
              {events.map((event) => {
                const info = getTypeInfo(event.EventType);
                const cd = countdowns[event.EventID];
                const today = isToday(event.StartDate, event.EndDate);
                return (
                  <div
                    key={event.EventID}
                    className={`event-card ${today ? "happening-today" : ""} ${cd?.isExpired ? "expired" : ""}`}
                    style={{ borderColor: info.color }}
                  >
                    {today && (
                      <div className="live-badge">
                        <span className="pulse" />
                        {t("happeningNow")}
                      </div>
                    )}
                    <div className="event-header">
                      <div
                        className="event-type-badge"
                        style={{
                          backgroundColor: info.bgColor,
                          color: info.color,
                        }}
                      >
                        <span className="type-icon">{info.icon}</span>
                        {event.EventType}
                      </div>
                      <div className="event-date">
                        {fmtDate(event.StartDate)}
                        {event.StartDate !== event.EndDate && (
                          <> – {fmtDate(event.EndDate)}</>
                        )}
                      </div>
                    </div>
                    <div className="event-content">
                      <h3 className="event-title">{event.EventName}</h3>
                      {event.Venue && (
                        <div className="event-venue">📍 {event.Venue}</div>
                      )}
                      {event.Description && (
                        <p className="event-description">{event.Description}</p>
                      )}
                      {cd && !cd.isExpired && (
                        <div className="countdown-timer">
                          <h4>{t("endsIn")}</h4>
                          <div className="countdown-display">
                            {COUNTDOWN_UNITS.map(({ key, labelKey }) => (
                              <div key={key} className="countdown-item">
                                <span className="countdown-number">
                                  {cd[key]}
                                </span>
                                <span className="countdown-label">
                                  {t(labelKey)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {cd?.isExpired && (
                        <div className="expired-notice">{t("eventEnded")}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {pastEvents.length > 0 && (
              <>
                <h2 style={{ marginTop: "2rem", opacity: 0.7 }}>
                  Past Events ({pastEvents.length})
                </h2>
                <div className="events-grid" style={{ opacity: 0.65 }}>
                  {pastEvents.map((event) => {
                    const info = getTypeInfo(event.EventType);
                    return (
                      <div
                        key={event.EventID}
                        className="event-card expired"
                        style={{ borderColor: info.color }}
                      >
                        <div className="event-header">
                          <div
                            className="event-type-badge"
                            style={{ backgroundColor: info.bgColor, color: info.color }}
                          >
                            <span className="type-icon">{info.icon}</span>
                            {event.EventType}
                          </div>
                          <div className="event-date">
                            {fmtDate(event.StartDate)}
                            {event.StartDate !== event.EndDate && (
                              <> – {fmtDate(event.EndDate)}</>
                            )}
                          </div>
                        </div>
                        <div className="event-content">
                          <h3 className="event-title">{event.EventName}</h3>
                          {event.Venue && (
                            <div className="event-venue">📍 {event.Venue}</div>
                          )}
                          {event.Description && (
                            <p className="event-description">{event.Description}</p>
                          )}
                          <div className="expired-notice">{t("eventEnded")}</div>
                        </div>
                      </div>
                    );
                  })}
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
