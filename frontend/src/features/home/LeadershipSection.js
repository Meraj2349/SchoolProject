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

export default function LeadershipSection() {
  const { data: messages = [], isLoading: msgLoading } = useMessages();
  const {
    data: events = [],
    isLoading: eventsLoading,
    isError: eventsError,
  } = useEvents();
  const {
    data: newsItems = [],
    isLoading: newsLoading,
    isError: newsError,
  } = useNews();
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
      <section className="relative py-16 bg-gradient-to-b from-[#f0fdf4] to-[#dcfce7] overflow-hidden">
        {/* Top gold strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent" />
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-center py-12 text-sm text-[#5a6072] italic tracking-wide">
            {tHome("loading")}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-[72px] pb-20 bg-gradient-to-b from-[#f0fdf4] to-[#dcfce7] overflow-hidden">
      {/* Top gold strip */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none z-[2]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, #10b981 30%, #a7f3d0 50%, #10b981 70%, transparent 100%)",
        }}
      />
      {/* Bottom gold strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] pointer-events-none z-[2]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, #10b981 30%, #a7f3d0 50%, #10b981 70%, transparent 100%)",
        }}
      />

      <div className="relative z-[1] max-w-[1400px] mx-auto px-6">
        {/* ── Section header ── */}
        <div className="text-center mb-[52px]">
          {/* Star rule */}
          <div className="inline-flex items-center gap-[14px] mb-4">
            <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[rgba(16,185,129,0.6)]" />
            <span className="text-[0.75rem] text-[#10b981]">★</span>
            <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[rgba(16,185,129,0.6)]" />
          </div>
          <h2 className="text-[clamp(1.65rem,4vw,2.4rem)] font-extrabold text-[#064e3b] mb-[10px] tracking-tight leading-[1.2]">
            {tHome("leadershipTitle")}
          </h2>
          <p className="text-[0.95rem] text-[#5a6072] mx-auto mb-6 max-w-[480px] leading-[1.6]">
            {tHome("leadershipSubtitle")}
          </p>
          {/* Diamond divider */}
          <div className="inline-flex items-center gap-[10px]">
            <span className="block w-10 h-px bg-gradient-to-r from-transparent to-[rgba(16,185,129,0.5)]" />
            <span className="text-[0.5rem] text-[#10b981]">◆</span>
            <span className="block w-10 h-px bg-gradient-to-l from-transparent to-[rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* ── Chairman card ── */}
        <div className="mb-14">
          <ChairmanCard
            image={chairmanImage}
            name={chairmanName}
            title={chairmanTitle}
            message={chairmanMessage}
          />
        </div>

        {/* ── Three-column: Quick Links · Events · News ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-8">
          {/* Quick Links */}
          <div className="flex flex-col min-h-[320px] bg-white rounded-sm border border-[rgba(16,185,129,0.25)] shadow-[0_2px_6px_rgba(5,150,105,0.07),0_8px_24px_rgba(5,150,105,0.06)] overflow-hidden transition-transform duration-[280ms] hover:-translate-y-[5px] hover:shadow-[0_4px_12px_rgba(5,150,105,0.1),0_20px_48px_rgba(5,150,105,0.1)] md:col-span-2 lg:col-span-1 lg:min-h-[280px]">
            {/* Top gold accent */}
            <div
              className="h-[3px] flex-shrink-0"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, #10b981 30%, #a7f3d0 50%, #10b981 70%, transparent 100%)",
              }}
            />

            {/* Column header — navy bar */}
            <div className="relative bg-[#064e3b] px-5 py-4 text-center flex-shrink-0 overflow-hidden">
              {/* Diagonal texture overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg,rgba(255,255,255,0.025) 0,rgba(255,255,255,0.025) 1px,transparent 1px,transparent 10px)",
                }}
              />
              <div className="relative z-[1] flex items-center gap-[10px] mb-[6px]">
                <span className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(16,185,129,0.5)]" />
                <span className="text-[0.9rem]" aria-hidden="true">
                  🔗
                </span>
                <span className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(16,185,129,0.5)]" />
              </div>
              <p className="relative z-[1] m-0 text-[0.72rem] font-bold tracking-[0.16em] uppercase text-[#a7f3d0]">
                Quick Links
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 p-[18px_16px_14px] bg-[#f0fdf4] flex flex-col">
              <QuickLinks hideHeader />
            </div>

            {/* Bottom gold accent */}
            <div
              className="h-[3px] flex-shrink-0"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, #10b981 30%, #a7f3d0 50%, #10b981 70%, transparent 100%)",
              }}
            />
          </div>

          {/* Events */}
          <div className="flex flex-col min-h-[320px] lg:min-h-[280px]">
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-[#5a6072] italic tracking-wide">
                {tEventNews("eventsLoading")}
              </div>
            ) : eventsError ? (
              <div className="flex items-center justify-center py-12 text-sm text-[#5a6072] italic tracking-wide">
                {tEventNews("eventsError")}
              </div>
            ) : (
              <EventNewsCard
                type="events"
                data={activeEvents.length > 0 ? activeEvents : []}
              />
            )}
          </div>

          {/* News */}
          <div className="flex flex-col min-h-[320px] lg:min-h-[280px]">
            {newsLoading ? (
              <div className="flex items-center justify-center py-12 text-sm text-[#5a6072] italic tracking-wide">
                {tEventNews("newsLoading")}
              </div>
            ) : newsError ? (
              <div className="flex items-center justify-center py-12 text-sm text-[#5a6072] italic tracking-wide">
                {tEventNews("newsError")}
              </div>
            ) : (
              <EventNewsCard type="news" data={activeNews} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
