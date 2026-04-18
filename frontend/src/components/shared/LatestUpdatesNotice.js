"use client";

import { Bell } from "lucide-react";
import { useNotices } from "@/hooks/useNotices";
import LottieLoader from "@/components/ui/LottieLoader";
import { useTranslations } from "@/store/languageStore";

export default function LatestUpdatesNotice() {
  const { data: allNotices = [], isLoading, isError } = useNotices();
  const t = useTranslations("latestUpdates");

  const notices = allNotices
    .filter((n) => n.Show === true || n.Show === 1)
    .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));

  const loopedNotices = notices.length > 1 ? [...notices, notices[0]] : notices;
  const animationDuration =
    notices.length > 1 ? `${Math.max(40, notices.length * 15)}s` : null;

  if (isLoading) {
    return (
      <LottieLoader
        size="small"
        text={t("label")}
        className="bg-gradient-to-br from-green-600 via-green-700 to-green-900 text-white rounded-none"
        type="dots"
      />
    );
  }

  if (isError) {
    return (
      <div className="bg-green-800 text-white p-3 shadow-lg">
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
      `}</style>
      <div
        className="relative overflow-hidden border-b border-white/15 transition-all duration-300 hover:-translate-y-0.5"
        style={{
          background:
            "linear-gradient(135deg, #10b981 0%, #059669 25%, #047857 75%, #064e3b 100%)",
          boxShadow: "0 6px 24px rgba(16,185,129,0.3)",
        }}
      >
        <div className="relative px-6 py-3.5 bg-white/[0.06] z-[2]">
          <div className="flex items-center justify-between max-w-[1200px] mx-auto gap-4">
            {/* Left section */}
            <div className="flex items-center flex-shrink-0">
              <div className="bg-white/20 p-2.5 rounded-full mr-3.5 flex items-center justify-center border border-white/25 transition-all duration-300 hover:scale-105 hover:bg-white/30">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span className="hidden md:inline font-bold text-base text-white mr-3 tracking-wide uppercase">
                {t("label")}
              </span>
              <span className="md:hidden font-bold text-sm text-white tracking-wide uppercase">
                {t("labelMobile")}
              </span>
              <div className="h-6 w-0.5 bg-white/50 mx-4 rounded-sm" />
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
