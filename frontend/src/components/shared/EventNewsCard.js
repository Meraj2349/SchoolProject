"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";

/* ── Classic navy/gold palette (mirrors ChairmanCard) ── */
const NAVY = "#0d1f3c";
const GOLD = "#c9a84c";
const GOLD2 = "#e2c07a";
const CREAM = "#fdf8f0";

const CONFIG = {
  events: {
    labelKey: "events",
    viewAllKey: "viewAllEvents",
    href: "/events",
    emptyKey: "noEventsAvailable",
    icon: "📅",
  },
  news: {
    labelKey: "news",
    viewAllKey: "viewAllNews",
    href: "/events",
    emptyKey: "noNewsAvailable",
    icon: "📰",
  },
};

function Row({ item, isLast }) {
  return (
    <div className={`enc-row${isLast ? " enc-row--last" : ""}`}>
      {/* Date badge */}
      <div className="enc-date">{item.date || "—"}</div>

      {/* Text */}
      <div className="enc-row-body">
        <Link href={item.link || "#"} className="enc-row-title">
          {item.text || item.title || item.name}
        </Link>
        {item.venue && (
          <span className="enc-row-venue">
            <span aria-hidden="true">📍</span> {item.venue}
          </span>
        )}
      </div>
    </div>
  );
}

export default function EventNewsCard({
  type = "events",
  data = [],
  containerStyle = {},
}) {
  const t = useTranslations("eventNews");
  const cfg = CONFIG[type] ?? CONFIG.events;

  return (
    <div className="enc-wrap" style={containerStyle}>
      {/* Top gold strip */}
      <div className="enc-topbar" />

      {/* Header */}
      <div className="enc-header">
        <div className="enc-header__rule">
          <span className="enc-header__line" />
          <span className="enc-header__icon" aria-hidden="true">
            {cfg.icon}
          </span>
          <span className="enc-header__line" />
        </div>
        <p className="enc-header__label">{t(cfg.labelKey)}</p>
      </div>

      {/* Items */}
      <div className="enc-body">
        {data.length === 0 ? (
          <p className="enc-empty">
            {t(cfg.emptyKey) ??
              (type === "events" ? "No upcoming events" : "No news yet")}
          </p>
        ) : (
          data.map((item, i) => (
            <Row key={i} item={item} isLast={i === data.length - 1} />
          ))
        )}
      </div>

      {/* Footer CTA */}
      <div className="enc-footer">
        <div className="enc-footer__rule">
          <span className="enc-footer__line" />
          <span className="enc-footer__diamond">◆</span>
          <span className="enc-footer__line" />
        </div>
        <Link href={cfg.href} className="enc-cta">
          {t(cfg.viewAllKey)}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
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

      {/* Bottom gold strip */}
      <div className="enc-bottombar" />

      <style>{`
        .enc-wrap {
          flex: 1;
          background: #fff;
          border-radius: 4px;
          border: 1px solid rgba(201,168,76,.22);
          box-shadow: 0 2px 6px rgba(13,31,60,.07), 0 8px 24px rgba(13,31,60,.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 320px;
          position: relative;
        }
        .enc-topbar, .enc-bottombar {
          height: 3px;
          background: linear-gradient(90deg, transparent, ${GOLD}, ${GOLD2}, ${GOLD}, transparent);
          flex-shrink: 0;
        }
        /* Header */
        .enc-header {
          background: ${NAVY};
          padding: 16px 20px 14px;
          text-align: center;
          position: relative;
        }
        .enc-header::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            45deg, rgba(255,255,255,.025) 0, rgba(255,255,255,.025) 1px,
            transparent 1px, transparent 10px
          );
          pointer-events: none;
        }
        .enc-header__rule {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
          position: relative;
          z-index: 1;
        }
        .enc-header__line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,.5));
        }
        .enc-header__line:last-child {
          background: linear-gradient(270deg, transparent, rgba(201,168,76,.5));
        }
        .enc-header__icon { font-size: .9rem; }
        .enc-header__label {
          margin: 0;
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: ${GOLD2};
          position: relative;
          z-index: 1;
        }
        /* Body */
        .enc-body {
          flex: 1;
          padding: 12px 14px 8px;
          display: flex;
          flex-direction: column;
          gap: 0;
          background: ${CREAM};
        }
        .enc-empty {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: .82rem;
          text-align: center;
          padding: 24px;
          margin: 0;
        }
        /* Row */
        .enc-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(201,168,76,.14);
        }
        .enc-row--last { border-bottom: none; }
        /* Date badge */
        .enc-date {
          flex-shrink: 0;
          min-width: 52px;
          padding: 6px 4px;
          background: ${NAVY};
          color: ${GOLD2};
          border-radius: 2px;
          font-size: .7rem;
          font-weight: 700;
          text-align: center;
          line-height: 1.3;
          border: 1px solid rgba(201,168,76,.3);
          letter-spacing: .01em;
        }
        .enc-row-body { flex: 1; min-width: 0; }
        .enc-row-title {
          display: block;
          font-size: .82rem;
          font-weight: 600;
          color: ${NAVY};
          text-decoration: none;
          line-height: 1.45;
          transition: color .18s;
        }
        .enc-row-title:hover { color: ${GOLD}; }
        .enc-row-venue {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: .7rem;
          color: #9ca3af;
          margin-top: 2px;
        }
        /* Footer */
        .enc-footer {
          padding: 10px 14px 14px;
          background: ${CREAM};
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .enc-footer__rule {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }
        .enc-footer__line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,.4));
        }
        .enc-footer__line:last-child {
          background: linear-gradient(270deg, transparent, rgba(201,168,76,.4));
        }
        .enc-footer__diamond { font-size: .4rem; color: ${GOLD}; }
        .enc-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 20px;
          background: ${NAVY};
          color: ${GOLD2};
          font-size: .72rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 2px;
          border: 1px solid ${GOLD};
          transition: background .22s, color .22s;
          position: relative;
          overflow: hidden;
        }
        .enc-cta::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${GOLD}, ${GOLD2});
          opacity: 0;
          transition: opacity .22s;
        }
        .enc-cta:hover::before { opacity: 1; }
        .enc-cta:hover { color: ${NAVY}; }
        .enc-cta span, .enc-cta svg { position: relative; z-index: 1; }
      `}</style>
    </div>
  );
}
