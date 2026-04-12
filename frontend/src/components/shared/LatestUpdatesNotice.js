"use client";

import { Bell } from "lucide-react";
import { useNotices } from "@/hooks/useNotices";
import LottieLoader from "@/components/ui/LottieLoader";
import { useTranslations } from "@/store/languageStore";
import "@/styles/listcss/noticlist.css";

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
        className="notice-loading"
        type="dots"
      />
    );
  }

  if (isError) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-left">
            <Bell className="error-icon" />
            <span className="error-text">{t("loadingError")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (notices.length === 0) return null;

  return (
    <div className="latest-updates-container">
      <div className="content-wrapper">
        <div className="content-container">
          <div className="left-section">
            <div className="bell-icon-container">
              <Bell className="bell-icon" />
            </div>
            <span className="updates-label">{t("label")}</span>
            <span className="updates-label-mobile">{t("labelMobile")}</span>
            <div className="separator" />
          </div>
          <div className="content-section">
            <div className="slider-container">
              <div
                className={`slider-wrapper ${notices.length > 1 ? "is-looping" : ""}`}
                style={
                  animationDuration
                    ? {
                        animationDuration,
                        "--slide-count": loopedNotices.length,
                      }
                    : undefined
                }
              >
                {loopedNotices.map((notice, index) => {
                  const isDuplicate =
                    notices.length > 1 && index >= notices.length;
                  return (
                    <div
                      key={`${notice.NoticeID}-${index}`}
                      className="slide"
                      aria-hidden={isDuplicate ? "true" : "false"}
                    >
                      <div className="slide-content">
                        <span className="slide-title">{notice.Title}:</span>
                        <span className="slide-description">
                          {notice.Description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
