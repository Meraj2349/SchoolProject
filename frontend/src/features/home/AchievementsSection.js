"use client";

import Image from "next/image";
import { usePublishedNoticeAnnouncements } from "@/hooks/useNoticeAnnouncements";
import { useLanguageStore } from "@/store/languageStore";
import "@/styles/AchievementsSection.css";

const SERVER_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3000";

/* Category colour tokens (classic palette) */
const CAT = {
  Admission: { label: "Admission", color: "#2563eb", bg: "rgba(37,99,235,0.12)" },
  Exam:      { label: "Exam",      color: "#059669", bg: "rgba(5,150,105,0.12)" },
  Notice:    { label: "Notice",    color: "#b45309", bg: "rgba(180,83,9,0.12)"  },
  Event:     { label: "Event",     color: "#7c3aed", bg: "rgba(124,58,237,0.12)"},
};
const DEFAULT_CAT = { label: "General", color: "#c9a84c", bg: "rgba(201,168,76,0.12)" };

const LABELS = {
  en: { heading: "Achievements & Announcements", sub: "Celebrating excellence and keeping you informed" },
  bn: { heading: "অর্জন ও ঘোষণা",              sub: "শ্রেষ্ঠত্ব উদযাপন এবং সর্বশেষ তথ্য"         },
};

function fmt(d, lang) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function AchievCard({ item, lang }) {
  const title  = lang === "bn" ? item.title_bn : item.title_en;
  const cat    = CAT[item.category] ?? DEFAULT_CAT;
  const imgSrc = item.image_url
    ? item.image_url.startsWith("http") ? item.image_url : `${SERVER_URL}${item.image_url}`
    : null;

  return (
    <article className="achiev-card" style={{ "--cat-color": cat.color, "--cat-bg": cat.bg }}>
      {/* Top gold strip */}
      <div className="achiev-card__topbar" />

      {/* Image */}
      <div className="achiev-card__img-wrap">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
            className="achiev-card__img"
          />
        ) : (
          <div className="achiev-card__img-placeholder">
            <span className="achiev-card__trophy">🏆</span>
          </div>
        )}
        {/* Category badge */}
        <span className="achiev-card__badge">{cat.label}</span>
      </div>

      {/* Body */}
      <div className="achiev-card__body">
        {/* Corner ornament */}
        <span className="achiev-card__ornament" aria-hidden="true">◆</span>
        <p className="achiev-card__title">{title}</p>
        <div className="achiev-card__footer">
          <span className="achiev-card__date">{fmt(item.date, lang)}</span>
        </div>
      </div>
    </article>
  );
}

export default function AchievementsSection() {
  const { data: items = [], isLoading } = usePublishedNoticeAnnouncements();
  const language = useLanguageStore((s) => s.language);
  const L = LABELS[language] ?? LABELS.en;

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="achiev-section">
      {/* ── Section header ── */}
      <div className="achiev-section__head">
        <div className="achiev-section__rule">
          <span className="achiev-section__rule-line" />
          <span className="achiev-section__rule-icon">★</span>
          <span className="achiev-section__rule-line" />
        </div>
        <h2 className="achiev-section__heading">{L.heading}</h2>
        <p  className="achiev-section__sub">{L.sub}</p>
        <div className="achiev-section__divider">
          <span className="achiev-section__div-line" />
          <span className="achiev-section__div-diamond">◆</span>
          <span className="achiev-section__div-line" />
        </div>
      </div>

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="achiev-section__grid">
          {[1,2,3].map(n => <div key={n} className="achiev-skeleton" />)}
        </div>
      ) : (
        <div className="achiev-section__grid">
          {items.map(item => (
            <AchievCard key={item.id} item={item} lang={language} />
          ))}
        </div>
      )}
    </section>
  );
}
