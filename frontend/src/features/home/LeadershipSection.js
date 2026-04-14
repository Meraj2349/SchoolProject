"use client";

import { useQuery } from "@tanstack/react-query";
import { useMessages } from "@/hooks/useMessages";
import { useEvents } from "@/hooks/useEvents";
import { useNews } from "@/hooks/useNews";
import { chairmanService } from "@/services/chairman.service";
import { queryKeys } from "@/lib/queryKeys";
import ChairmanCard from "@/components/shared/ChairmanCard";
import EventNewsCard from "@/components/shared/EventNewsCard";
import QuickLinks from "@/components/shared/QuickLinks";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import "@/styles/LeaderShipSection.css";

export default function LeadershipSection() {
  const { data: messages = [], isLoading: msgLoading } = useMessages();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const { data: newsItems = [], isLoading: newsLoading, isError: newsError } = useNews();
  const { data: profileData } = useQuery({
    queryKey: queryKeys.chairman.profile,
    queryFn: chairmanService.getProfile,
    select: (d) => d?.data ?? d,
  });
  const language = useLanguageStore((s) => s.language);
  const tChairman = useTranslations("chairman");
  const tHome = useTranslations("home");
  const tEventNews = useTranslations("eventNews");

  // Use API data, fall back to i18n hardcoded values
  const chairmanImage =
    profileData?.image_url ||
    "/images/WhatsApp Image 2024-12-07 at 20.48.41_3423f492.jpg";
  const chairmanName =
    (language === "bn" ? profileData?.name_bn : profileData?.name_en) ||
    tChairman("name");
  const chairmanTitle =
    (language === "bn" ? profileData?.title_bn : profileData?.title_en) ||
    tChairman("title");

  const visibleMessages = messages.filter(
    (m) => m.Show === 1 || m.Show === true,
  );
  const chairmanMessage =
    visibleMessages.length > 0
      ? visibleMessages[0].Messages
      : tChairman("defaultMessage");

  const formatDate = (d) => {
    if (!d) return "TBA";
    const date = new Date(d);
    return `${date.toLocaleDateString("en-US", { month: "short" })} ${String(date.getDate()).padStart(2, "0")}`;
  };

  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.EndDate) >= now);
  const activeEvents = (upcomingEvents.length > 0 ? upcomingEvents : events)
    .slice(0, 4)
    .map((e) => ({
      date: formatDate(e.StartDate),
      text: e.EventName,
      link: `/events`,
      venue: e.Venue,
    }));

  const activeNews = newsItems.slice(0, 4).map((item) => ({
    date: formatDate(item.date),
    text: language === "en" ? item.title_en : item.title_bn,
    link: item.link || "/events",
  }));

  if (msgLoading) {
    return (
      <section className="leadership-section">
        <div className="container">
          <div className="loading-message">{tHome("loading")}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="leadership-section">
      <div className="container">
        <div className="chairman-section">
          <ChairmanCard
            image={chairmanImage}
            name={chairmanName}
            title={chairmanTitle}
            message={chairmanMessage}
          />
        </div>
        <div className="three-column-container">
          <div className="quick-links-wrapper">
            <QuickLinks />
          </div>
          <div className="events-wrapper">
            <EventNewsCard
              type="events"
              data={activeEvents.length > 0 ? activeEvents : []}
            />
          </div>
          <div className="news-wrapper">
            {newsLoading ? (
              <div className="loading-message">{tEventNews("newsLoading")}</div>
            ) : newsError ? (
              <div className="loading-message">{tEventNews("newsError")}</div>
            ) : (
              <EventNewsCard type="news" data={activeNews} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
