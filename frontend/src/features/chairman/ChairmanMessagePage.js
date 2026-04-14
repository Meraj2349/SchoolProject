"use client";

import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useMessages } from "@/hooks/useMessages";
import { chairmanService } from "@/services/chairman.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import "@/styles/ChairmanMessagePage.css";

export default function ChairmanMessagePage() {
  const { data: messages = [], isLoading: messagesLoading } = useMessages();
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: queryKeys.chairman.profile,
    queryFn: chairmanService.getProfile,
    select: (d) => d?.data ?? d,
  });
  const t = useTranslations("chairman");

  const isLoading = messagesLoading || profileLoading;

  // Use API profile data, fall back to i18n hardcoded strings
  const name        = profileData?.name_en        || t("name");
  const title       = profileData?.title_en       || t("title");
  const institution = profileData?.institution_en || t("institution");
  const photoUrl    = profileData?.image_url      || null;

  const visible = messages
    .filter((m) => m.Show === 1 || m.Show === true)
    .sort((a, b) => a.MessageID - b.MessageID);

  const message =
    visible.length > 0 ? visible[0].Messages : t("defaultMessage");

  if (isLoading) {
    return (
      <div className="chairman-message-page">
        <Navbar />
        <LatestUpdatesNotice />
        <main className="chairman-message-main">
          <div className="container">
            <div
              style={{
                maxWidth: 800,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                padding: "40px 0",
              }}
            >
              <div className="skeleton" style={{ height: 48, width: "50%", margin: "0 auto", borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 4, width: 100, margin: "0 auto", borderRadius: 2 }} />
              <div className="skeleton" style={{ height: 180, borderRadius: 20, marginTop: 16 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 16, width: i % 3 === 2 ? "70%" : "100%", borderRadius: 6 }} />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="chairman-message-page">
      <Navbar />
      <LatestUpdatesNotice />
      <main className="chairman-message-main">
        <div className="container">
          <div className="page-header">
            <h1>{t("pageTitle")}</h1>
            <div className="header-line" />
          </div>
          <div className="chairman-profile">
            <div className="profile-image-container">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`${name} – ${title}`}
                  className="profile-image"
                />
              ) : (
                <img
                  src="/images/WhatsApp Image 2024-12-07 at 20.48.41_3423f492.jpg"
                  alt={`${name} – ${title}`}
                  className="profile-image"
                />
              )}
            </div>
            <div className="profile-info">
              <h2>{name}</h2>
              <p className="title">{title}</p>
              <p className="institution">{institution}</p>
            </div>
          </div>
          <div className="message-content">
            <div className="message-text">
              <p>{message}</p>
            </div>
            <div className="message-signature">
              <p className="signature-regards">{t("bestRegards")}</p>
              <p className="signature-name">{name}</p>
              <p className="signature-title">{title}</p>
              <p className="signature-institution">{institution}</p>
            </div>
          </div>
          <div className="back-button-container">
            <button
              onClick={() => window.history.back()}
              className="back-button"
            >
              {t("backToHome")}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
