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

  const name        = profileData?.name_en        || t("name");
  const title       = profileData?.title_en       || t("title");
  const institution = profileData?.institution_en || t("institution");
  const photoUrl    = profileData?.image_url      || "/images/WhatsApp Image 2024-12-07 at 20.48.41_3423f492.jpg";

  const visible = messages
    .filter((m) => m.Show === 1 || m.Show === true)
    .sort((a, b) => a.MessageID - b.MessageID);

  const message = visible.length > 0 ? visible[0].Messages : t("defaultMessage");

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="chairman-message-page">
        <Navbar />
        <LatestUpdatesNotice />

        {/* Hero skeleton */}
        <div style={{ background: "#0d1f3c", padding: "64px 24px 56px", textAlign: "center" }}>
          <div className="skeleton" style={{ height: 44, width: "44%", margin: "0 auto 16px", borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 14, width: "28%", margin: "0 auto", borderRadius: 4 }} />
        </div>

        <div className="chairman-message-main">
          <div className="container">
            {/* Profile skeleton */}
            <div className="skeleton" style={{ height: 200, marginTop: 48, borderRadius: 4 }} />
            {/* Message skeleton */}
            <div className="skeleton" style={{ height: 24, width: "30%", marginTop: 28, borderRadius: 4 }} />
            {[...Array(7)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 16, width: i % 4 === 3 ? "60%" : "100%", marginTop: 12, borderRadius: 4 }} />
            ))}
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="chairman-message-page">
      <Navbar />
      <LatestUpdatesNotice />

      <main className="chairman-message-main" style={{ paddingTop: 0 }}>

        {/* ── Hero banner ── */}
        <div className="cmp-hero">
          <div className="cmp-hero-topbar" />
          <div className="cmp-hero__rule">
            <span className="cmp-hero__rule-line" />
            <span className="cmp-hero__rule-icon">★</span>
            <span className="cmp-hero__rule-line" />
          </div>
          <h1 className="cmp-hero__title">{t("pageTitle")}</h1>
          <p className="cmp-hero__sub">{institution}</p>
          <div className="cmp-hero__divider">
            <span className="cmp-hero__div-line" />
            <span className="cmp-hero__div-diamond">◆</span>
            <span className="cmp-hero__div-line" />
          </div>
        </div>

        <div className="container">

          {/* ── Profile card ── */}
          <div className="cmp-profile">
            {/* Left: photo panel */}
            <div className="cmp-profile__photo-panel">
              <span className="cmp-profile__ornament cmp-profile__ornament--tl">◆</span>
              <span className="cmp-profile__ornament cmp-profile__ornament--tr">◆</span>
              <span className="cmp-profile__ornament cmp-profile__ornament--bl">◆</span>
              <span className="cmp-profile__ornament cmp-profile__ornament--br">◆</span>

              <div className="cmp-profile__img-ring">
                {photoUrl ? (
                  <img src={photoUrl} alt={`${name} – ${title}`} className="cmp-profile__img" />
                ) : (
                  <div className="cmp-profile__img-placeholder">👤</div>
                )}
              </div>
            </div>

            {/* Right: info panel */}
            <div className="cmp-profile__info">
              <h2 className="cmp-profile__name">{name}</h2>

              <div className="cmp-profile__title-rule">
                <span className="cmp-profile__title-line" />
                <span className="cmp-profile__job-title">{title}</span>
              </div>

              <p className="cmp-profile__institution">{institution}</p>

              <div className="cmp-profile__divider">
                <span className="cmp-profile__div-line" />
                <span className="cmp-profile__div-diamond">◆</span>
              </div>
            </div>
          </div>

          {/* ── Message card ── */}
          <div className="cmp-message-wrap">
            <div className="cmp-message-topbar" />
            <div className="cmp-message-inner">

              {/* Body */}
              <div className="cmp-message-body">
                <p className="cmp-message-text">{message}</p>
              </div>

              {/* Signature */}
              <div className="cmp-signature">
                <div className="cmp-signature__rule">
                  <span className="cmp-signature__rule-line" />
                  <span className="cmp-signature__rule-diamond">◆</span>
                  <span className="cmp-signature__rule-line" />
                </div>
                <p className="cmp-signature__regards">{t("bestRegards")}</p>
                <p className="cmp-signature__name">{name}</p>
                <p className="cmp-signature__job">{title}</p>
                <p className="cmp-signature__institution">{institution}</p>
              </div>
            </div>
          </div>

          {/* ── Back button ── */}
          <div className="cmp-back-wrap">
            <button className="cmp-back-btn" onClick={() => window.history.back()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>{t("backToHome")}</span>
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
