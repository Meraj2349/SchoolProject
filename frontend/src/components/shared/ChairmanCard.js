"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";
import "@/styles/ChairmanCard.css";

export default function ChairmanCard({ image, name, title, message }) {
  const t = useTranslations("chairmanCard");

  return (
    <div className="cc-wrap">
      {/* ── Left column: photo + nameplate ── */}
      <div className="cc-photo-col">
        {/* Decorative ring frame */}
        <div className="cc-photo-ring">
          <div className="cc-photo-inner">
            <img
              src={image}
              alt={`${name} – ${title}`}
              className="cc-photo"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          {/* Gold corner ornaments */}
          <span className="cc-ornament cc-ornament--tl" />
          <span className="cc-ornament cc-ornament--tr" />
          <span className="cc-ornament cc-ornament--bl" />
          <span className="cc-ornament cc-ornament--br" />
        </div>

        {/* Nameplate badge */}
        <div className="cc-nameplate">
          <span className="cc-nameplate__divider" />
          <p className="cc-nameplate__name">{name}</p>
          <p className="cc-nameplate__title">{title}</p>
          <span className="cc-nameplate__divider" />
        </div>
      </div>

      {/* ── Right column: message ── */}
      <div className="cc-content-col">
        {/* Decorative heading */}
        <div className="cc-section-label">
          <span className="cc-section-label__line" />
          <span className="cc-section-label__text">
            {t("chairmanMessage") || "Chairman's Message"}
          </span>
          <span className="cc-section-label__line" />
        </div>

        {message && (
          <blockquote className="cc-blockquote">
            {/* Large decorative open-quote */}
            <span className="cc-blockquote__openquote" aria-hidden="true">"</span>
            <p className="cc-blockquote__text">
              {message.length > 260 ? `${message.substring(0, 260)}…` : message}
            </p>
            <span className="cc-blockquote__closequote" aria-hidden="true">"</span>
          </blockquote>
        )}

        {/* Decorative rule */}
        <div className="cc-rule">
          <span className="cc-rule__line" />
          <span className="cc-rule__diamond">◆</span>
          <span className="cc-rule__line" />
        </div>

        <Link href="/chairman-message" className="cc-cta">
          <span>{t("viewFullMessage")}</span>
          <svg
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
      </div>
    </div>
  );
}
