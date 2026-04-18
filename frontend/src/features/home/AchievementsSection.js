"use client";

import Image from "next/image";
import { usePublishedNoticeAnnouncements } from "@/hooks/useNoticeAnnouncements";
import { useLanguageStore } from "@/store/languageStore";

const SERVER_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3000";

/* Category colour tokens */
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
    <article className="group relative bg-white border border-[rgba(201,168,76,0.2)] rounded-sm overflow-hidden flex flex-col shadow-[0_2px_6px_rgba(13,31,60,0.07),0_8px_24px_rgba(13,31,60,0.06)] transition-transform duration-[280ms] hover:-translate-y-[6px] hover:shadow-[0_4px_12px_rgba(13,31,60,0.1),0_20px_48px_rgba(13,31,60,0.12)]">
      {/* Top accent bar */}
      <div className="h-[3px] flex-shrink-0 bg-gradient-to-r from-[#0d1f3c] via-[#c9a84c] to-[#0d1f3c]" />

      {/* Image area */}
      <div className="relative w-full h-[200px] overflow-hidden bg-[#f5ede0] flex-shrink-0">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
            className="object-cover transition-transform duration-[400ms] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5ede0] to-[#ede8df]">
            <span className="text-[3rem]">🏆</span>
          </div>
        )}
        {/* Category badge */}
        <span
          className="absolute top-3 left-3 text-[0.65rem] font-bold tracking-[0.1em] uppercase px-[10px] py-[4px] rounded-sm backdrop-blur-sm border"
          style={{ color: cat.color, background: cat.bg, borderColor: cat.color }}
        >
          {cat.label}
        </span>
      </div>

      {/* Body */}
      <div className="relative p-[18px_20px_20px] flex-1 flex flex-col border-t border-[rgba(201,168,76,0.15)]">
        {/* Corner diamond ornament */}
        <span className="absolute top-[14px] right-4 text-[0.45rem] text-[rgba(201,168,76,0.5)] leading-none" aria-hidden="true">◆</span>
        <p className="m-0 mb-3 text-[0.92rem] font-bold text-[#0d1f3c] leading-[1.5] line-clamp-3 pr-3">
          {title}
        </p>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[rgba(201,168,76,0.12)]">
          <span className="text-[0.72rem] text-[#5a6072] italic tracking-[0.02em]">
            {fmt(item.date, lang)}
          </span>
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
    <section className="relative py-[72px] pb-20 px-6 bg-gradient-to-b from-[#fdf8f0] to-[#f5ede0] overflow-hidden">
      {/* Top gold strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent pointer-events-none" />
      {/* Bottom gold strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent pointer-events-none" />

      {/* ── Section header ── */}
      <div className="relative z-[1] text-center mb-[52px]">
        {/* Star rule */}
        <div className="inline-flex items-center gap-[14px] mb-4">
          <span className="block w-14 h-px bg-gradient-to-r from-transparent to-[#c9a84c]" />
          <span className="text-[0.75rem] text-[#c9a84c] leading-none">★</span>
          <span className="block w-14 h-px bg-gradient-to-l from-transparent to-[#c9a84c]" />
        </div>
        <h2 className="text-[clamp(1.65rem,4vw,2.5rem)] font-extrabold text-[#0d1f3c] mb-[10px] tracking-tight leading-[1.2]">
          {L.heading}
        </h2>
        <p className="text-[0.95rem] text-[#5a6072] mx-auto mb-6 max-w-[440px] leading-[1.6]">
          {L.sub}
        </p>
        {/* Diamond divider */}
        <div className="inline-flex items-center gap-[10px]">
          <span className="block w-10 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.6)]" />
          <span className="text-[0.5rem] text-[#c9a84c]">◆</span>
          <span className="block w-10 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.6)]" />
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="relative z-[1]">
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-7 max-w-[1200px] mx-auto">
            {[1,2,3].map(n => (
              <div
                key={n}
                className="h-[320px] rounded-sm border border-[rgba(201,168,76,0.15)]"
                style={{
                  background: "linear-gradient(90deg,#f5ede0 25%,#fdf8f0 50%,#f5ede0 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.6s infinite",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-7 max-w-[1200px] mx-auto">
            {items.map(item => (
              <AchievCard key={item.id} item={item} lang={language} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>
    </section>
  );
}
