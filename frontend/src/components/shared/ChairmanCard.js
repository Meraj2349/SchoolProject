"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";

export default function ChairmanCard({ image, name, title, message }) {
  const t = useTranslations("chairmanCard");

  return (
    <div className="relative flex max-w-[1000px] mx-auto bg-[#fdf8f0] rounded-sm overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.06),0_8px_32px_rgba(13,31,60,0.12),inset_0_0_0_1px_rgba(201,168,76,0.35)] flex-col md:flex-row">
      {/* Top gold strip */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent z-[1]" />
      {/* Bottom gold strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a84c] via-[#e2c07a] via-[#c9a84c] to-transparent z-[1]" />

      {/* ── Left photo column ── */}
      <div className="relative flex-shrink-0 w-full md:w-[260px] bg-gradient-to-b from-[#0d1f3c] to-[#162847] flex flex-col items-center justify-center p-[40px_28px] gap-6 overflow-hidden">
        {/* Diagonal texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,rgba(255,255,255,0.02) 0px,rgba(255,255,255,0.02) 1px,transparent 1px,transparent 12px)",
          }}
        />

        {/* Photo ring */}
        <div className="relative w-[170px] h-[170px]">
          <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-[#c9a84c] shadow-[0_0_0_6px_rgba(201,168,76,0.18),0_0_0_12px_rgba(201,168,76,0.08),0_12px_40px_rgba(0,0,0,0.4)]">
            <img
              src={image}
              alt={`${name} – ${title}`}
              className="w-full h-full object-cover object-top block"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          {/* Gold corner ornaments */}
          <span className="absolute top-[-8px] left-[-8px] w-[18px] h-[18px] border-t-2 border-l-2 border-[#c9a84c]" />
          <span className="absolute top-[-8px] right-[-8px] w-[18px] h-[18px] border-t-2 border-r-2 border-[#c9a84c]" />
          <span className="absolute bottom-[-8px] left-[-8px] w-[18px] h-[18px] border-b-2 border-l-2 border-[#c9a84c]" />
          <span className="absolute bottom-[-8px] right-[-8px] w-[18px] h-[18px] border-b-2 border-r-2 border-[#c9a84c]" />
        </div>

        {/* Nameplate */}
        <div className="relative z-[1] text-center w-full flex flex-col items-center gap-[6px]">
          <span className="block w-[60px] h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />
          <p className="m-0 text-[1.15rem] font-bold text-white tracking-[0.03em] leading-[1.25]">
            {name}
          </p>
          <p className="m-0 text-[0.72rem] font-semibold text-[#e2c07a] tracking-[0.12em] uppercase">
            {title}
          </p>
          <span className="block w-[60px] h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />
        </div>
      </div>

      {/* ── Right content column ── */}
      <div className="relative flex-1 p-[44px_48px] flex flex-col justify-center min-w-0">
        {/* Faint watermark quote */}
        <span
          className="absolute top-5 right-[30px] text-[120px] text-[rgba(201,168,76,0.06)] font-serif leading-none pointer-events-none select-none"
          aria-hidden="true"
        >
          ❝
        </span>

        {/* Section label */}
        <div className="flex items-center gap-3 mb-6">
          <span className="flex-1 h-px bg-gradient-to-r from-[#c9a84c] to-transparent" />
          <span className="text-[0.68rem] font-bold tracking-[0.18em] uppercase text-[#c9a84c] whitespace-nowrap">
            {t("chairmanMessage") || "Chairman's Message"}
          </span>
          <span className="flex-1 h-px bg-gradient-to-l from-[#c9a84c] to-transparent" />
        </div>

        {/* Message blockquote */}
        {message && (
          <blockquote className="m-0 mb-6 relative pl-1">
            <p className="m-0 text-[1rem] leading-[1.9] text-[#1a1a2e] text-justify hyphens-auto italic border-l-[3px] border-[#c9a84c] pl-[18px]">
              {message.length > 260 ? `${message.substring(0, 260)}…` : message}
            </p>
          </blockquote>
        )}

        {/* Decorative rule */}
        <div className="flex items-center gap-[10px] mb-7">
          <span className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(201,168,76,0.4)]" />
          <span className="text-[0.5rem] text-[#c9a84c]">◆</span>
          <span className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(201,168,76,0.4)]" />
        </div>

        {/* CTA */}
        <Link
          href="/chairman-message"
          className="cc-cta-tw relative inline-flex items-center gap-2 self-start px-6 py-[10px] bg-[#0d1f3c] text-[#e2c07a] text-[0.82rem] font-bold tracking-[0.1em] uppercase no-underline rounded-sm border border-[#c9a84c] overflow-hidden transition-colors duration-[250ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c9a84c] focus-visible:outline-offset-[3px]"
        >
          <span className="relative z-[1]">{t("viewFullMessage")}</span>
          <svg
            className="relative z-[1]"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
        <style>{`
          .cc-cta-tw::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #c9a84c, #e2c07a);
            opacity: 0;
            transition: opacity 0.25s;
          }
          .cc-cta-tw:hover::before { opacity: 1; }
          .cc-cta-tw:hover { color: #0d1f3c; box-shadow: 0 4px 16px rgba(201,168,76,0.35); }
        `}</style>
      </div>
    </div>
  );
}
