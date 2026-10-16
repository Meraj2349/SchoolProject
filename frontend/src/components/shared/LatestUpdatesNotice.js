"use client";

import { Bell } from "lucide-react";
import { useNotices } from "@/hooks/useNotices";
import LottieLoader from "@/components/ui/LottieLoader";
import { visibleNotices } from "@/lib/homePage";
import { useTranslations } from "@/store/languageStore";

export default function LatestUpdatesNotice() {
  const { data: allNotices = [], isLoading, isError } = useNotices();
  const t = useTranslations("latestUpdates");

  const notices = visibleNotices(allNotices);

  const loopedNotices = notices.length > 1 ? [...notices, notices[0]] : notices;
  const animationDuration =
    notices.length > 1 ? `${Math.max(40, notices.length * 15)}s` : null;

  if (isLoading) {
    return (
      <LottieLoader
        size="small"
        text={t("label")}
        className="bg-school-navy-deep text-white rounded-none"
        type="dots"
      />
    );
  }

  if (isError) {
    return (
      <div className="bg-school-navy-deep text-white p-3 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{t("loadingError")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (notices.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-100%,0,0); }
        }
        .notice-marquee {
          display: inline-block;
          animation: marquee 40s linear infinite;
          padding-left: 100%;
          will-change: transform;
          white-space: nowrap;
        }
        .notice-marquee:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .notice-marquee { animation: none; padding-left: 0; white-space: normal; }
        }
      `}</style>
      <div
        className="relative overflow-hidden border-b-2 border-school-gold bg-school-navy-deep font-school-body"
      >
        <div className="relative px-4 py-2.5 z-[2]">
          <div className="flex items-center justify-between max-w-[1200px] mx-auto gap-4">
            {/* Left section */}
            <div className="flex items-center flex-shrink-0">
              <div className="bg-school-gold p-2 rounded-full mr-3 flex items-center justify-center">
                <Bell className="h-4 w-4 text-school-navy" aria-hidden="true" />
              </div>
              <span className="hidden md:inline font-bold text-sm text-school-gold-soft mr-3 tracking-wide uppercase">
                {t("label")}
              </span>
              <span className="md:hidden font-bold text-sm text-school-gold-soft tracking-wide uppercase">
                {t("labelMobile")}
              </span>
              <div className="h-6 w-0.5 bg-school-gold/50 mx-3 rounded-sm" />
            </div>

            {/* Scrolling content */}
            <div
              className="flex-1 mx-4 overflow-hidden relative h-7 flex items-center"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
              }}
            >
              {loopedNotices.map((notice, index) => {
                const isDuplicate =
                  notices.length > 1 && index >= notices.length;
                return (
                  <div
                    key={`${notice.NoticeID}-${index}`}
                    className="w-full flex-shrink-0"
                    aria-hidden={isDuplicate ? "true" : "false"}
                  >
                    <span className="notice-marquee">
                      <span className="font-semibold text-base text-white/[0.98] tracking-[0.4px]">
                        {notice.Title}:
                      </span>
                      <span className="text-[15px] ml-3 text-white/90 tracking-[0.3px]">
                        {notice.Description}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
