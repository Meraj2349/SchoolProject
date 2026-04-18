"use client";

import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useMessages } from "@/hooks/useMessages";
import { chairmanService } from "@/services/chairman.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";

const NAVY = "#0d1f3c";
const NAVY2 = "#162a4a";
const GOLD = "#c9a84c";
const GOLD2 = "#e2c07a";
const CREAM = "#fdf8f0";
const CREAM2 = "#f5ede0";
const MUTED = "#5a6072";

function Skeleton({ style }) {
  return (
    <>
      <style>{`
        @keyframes cmp-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .cmp-skeleton {
          background: linear-gradient(90deg, ${CREAM2} 25%, ${CREAM} 50%, ${CREAM2} 75%);
          background-size: 200% 100%;
          animation: cmp-shimmer 1.6s infinite;
          border-radius: 4px;
        }
        @media (prefers-reduced-motion: reduce) { .cmp-skeleton { animation: none; } }
      `}</style>
      <div className="cmp-skeleton" style={style} />
    </>
  );
}

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

  const heroStyle = {
    background: NAVY,
    padding: "64px 24px 56px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  };

  const heroPatternStyle = {
    backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.025) 0, rgba(255,255,255,.025) 1px, transparent 1px, transparent 10px)",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <LatestUpdatesNotice />
        <div style={heroStyle}>
          <div className="absolute inset-0 pointer-events-none" style={heroPatternStyle} />
          <Skeleton style={{ height: 44, width: "44%", margin: "0 auto 16px" }} />
          <Skeleton style={{ height: 14, width: "28%", margin: "0 auto" }} />
        </div>
        <div className="flex-1 pb-24" style={{ background: CREAM }}>
          <div className="max-w-[940px] mx-auto px-6">
            <Skeleton style={{ height: 200, marginTop: 48 }} />
            <Skeleton style={{ height: 24, width: "30%", marginTop: 28 }} />
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} style={{ height: 16, width: i % 4 === 3 ? "60%" : "100%", marginTop: 12 }} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <LatestUpdatesNotice />

      <main className="flex-1 pb-24" style={{ background: CREAM }}>

        {/* Hero banner */}
        <div style={heroStyle}>
          <div className="absolute inset-0 pointer-events-none" style={heroPatternStyle} />
          {/* Top gold strip */}
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD2}, ${GOLD}, transparent)` }} />
          {/* Bottom gold strip */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD2}, ${GOLD}, transparent)` }} />

          <div className="relative z-[1]">
            <div className="inline-flex items-center gap-3.5 mb-4">
              <span className="block w-14 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(201,168,76,.6))` }} />
              <span className="text-[.8rem]" style={{ color: GOLD }}>★</span>
              <span className="block w-14 h-px" style={{ background: `linear-gradient(270deg, transparent, rgba(201,168,76,.6))` }} />
            </div>
            <h1 className="m-0 mb-2.5 font-extrabold leading-tight" style={{ fontSize: "clamp(1.7rem, 5vw, 2.8rem)", color: GOLD2, letterSpacing: "-.01em" }}>
              {t("pageTitle")}
            </h1>
            <p className="m-0 mb-6 text-[.95rem] max-w-[480px] mx-auto leading-relaxed" style={{ color: "rgba(226,192,122,.65)" }}>
              {institution}
            </p>
            <div className="inline-flex items-center gap-2.5">
              <span className="block w-10 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(201,168,76,.5))` }} />
              <span className="text-[.5rem]" style={{ color: GOLD }}>◆</span>
              <span className="block w-10 h-px" style={{ background: `linear-gradient(270deg, transparent, rgba(201,168,76,.5))` }} />
            </div>
          </div>
        </div>

        <div className="max-w-[940px] mx-auto px-6">

          {/* Profile card */}
          <div
            className="bg-white rounded-sm flex items-stretch overflow-hidden mt-12 flex-col md:flex-row"
            style={{ border: "1px solid rgba(201,168,76,.2)", boxShadow: "0 2px 8px rgba(13,31,60,.07), 0 12px 36px rgba(13,31,60,.08)" }}
          >
            {/* Photo panel */}
            <div
              className="flex-shrink-0 md:w-[220px] flex flex-col md:flex-row items-center justify-center p-9 md:p-9 relative overflow-hidden"
              style={{ background: NAVY }}
            >
              <div className="absolute inset-0 pointer-events-none" style={heroPatternStyle} />
              {/* Corner ornaments */}
              <span className="absolute top-3 left-3 text-[.45rem] leading-none" style={{ color: "rgba(201,168,76,.5)" }}>◆</span>
              <span className="absolute top-3 right-3 text-[.45rem] leading-none" style={{ color: "rgba(201,168,76,.5)" }}>◆</span>
              <span className="absolute bottom-3 left-3 text-[.45rem] leading-none" style={{ color: "rgba(201,168,76,.5)" }}>◆</span>
              <span className="absolute bottom-3 right-3 text-[.45rem] leading-none" style={{ color: "rgba(201,168,76,.5)" }}>◆</span>

              <div
                className="w-[152px] h-[152px] md:w-[152px] md:h-[152px] rounded-full p-[3px] flex-shrink-0 relative z-[1]"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD2}, ${GOLD})`,
                  boxShadow: "0 0 0 6px rgba(201,168,76,.12), 0 8px 28px rgba(0,0,0,.35)",
                }}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt={`${name} – ${title}`} className="w-full h-full rounded-full object-cover block" />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center text-5xl" style={{ background: `linear-gradient(135deg, ${NAVY2}, #1e3a5f)` }}>👤</div>
                )}
              </div>
            </div>

            {/* Info panel */}
            <div className="flex-1 p-9 flex flex-col justify-center" style={{ background: CREAM }}>
              <h2 className="text-[1.7rem] font-extrabold m-0 mb-2 leading-tight" style={{ color: NAVY, letterSpacing: "-.01em" }}>{name}</h2>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="h-px w-8" style={{ background: `linear-gradient(90deg, ${GOLD}, transparent)` }} />
                <span className="text-[.8rem] font-bold tracking-[.14em] uppercase" style={{ color: GOLD }}>{title}</span>
              </div>
              <p className="text-[.88rem] italic m-0 mb-6 leading-relaxed" style={{ color: MUTED }}>{institution}</p>
              <div className="flex items-center gap-2">
                <span className="h-px w-9" style={{ background: `linear-gradient(90deg, rgba(201,168,76,.5), transparent)` }} />
                <span className="text-[.45rem]" style={{ color: GOLD }}>◆</span>
              </div>
            </div>
          </div>

          {/* Message card */}
          <div
            className="bg-white rounded-sm overflow-hidden mt-7"
            style={{ border: "1px solid rgba(201,168,76,.2)", boxShadow: "0 2px 8px rgba(13,31,60,.07), 0 12px 36px rgba(13,31,60,.08)" }}
          >
            <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${NAVY}, ${GOLD}, ${NAVY})` }} />
            <div className="p-11 md:p-[44px_48px]">
              {/* Message body */}
              <div className="relative pl-7 border-l-[3px] mb-11" style={{ borderColor: GOLD }}>
                <span
                  className="absolute -top-[18px] -left-3.5 text-[5rem] leading-none font-serif pointer-events-none"
                  style={{ color: "rgba(201,168,76,.1)", fontFamily: "Georgia, serif" }}
                >❝</span>
                <p className="text-base leading-[1.9] m-0 text-justify whitespace-pre-wrap" style={{ color: "#1a1a2e" }}>{message}</p>
              </div>

              {/* Signature */}
              <div className="pt-8" style={{ borderTop: "1px solid rgba(201,168,76,.2)" }}>
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="flex-1 h-px" style={{ background: `linear-gradient(90deg, rgba(201,168,76,.4), transparent)` }} />
                  <span className="text-[.45rem]" style={{ color: GOLD }}>◆</span>
                  <span className="flex-1 h-px" style={{ background: `linear-gradient(270deg, rgba(201,168,76,.4), transparent)` }} />
                </div>
                <p className="text-[.82rem] italic m-0 mb-1.5" style={{ color: MUTED }}>{t("bestRegards")}</p>
                <p className="text-[1.05rem] font-extrabold m-0 mb-1" style={{ color: NAVY }}>{name}</p>
                <p className="text-[.76rem] font-bold tracking-[.12em] uppercase m-0 mb-1" style={{ color: GOLD }}>{title}</p>
                <p className="text-[.82rem] italic m-0" style={{ color: MUTED }}>{institution}</p>
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="text-center mt-10 mb-4">
            <button
              className="inline-flex items-center gap-2 px-7 py-3 text-[.78rem] font-bold tracking-[.12em] uppercase rounded-sm cursor-pointer relative overflow-hidden transition-colors duration-[220ms]"
              style={{ background: NAVY, color: GOLD2, border: `1px solid ${GOLD}` }}
              onMouseEnter={e => { e.currentTarget.style.color = NAVY; e.currentTarget.querySelector(".btn-fill").style.opacity = "1"; }}
              onMouseLeave={e => { e.currentTarget.style.color = GOLD2; e.currentTarget.querySelector(".btn-fill").style.opacity = "0"; }}
              onClick={() => window.history.back()}
            >
              <span className="btn-fill absolute inset-0 transition-opacity duration-[220ms]" style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`, opacity: 0 }} />
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="relative z-[1]">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span className="relative z-[1]">{t("backToHome")}</span>
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
