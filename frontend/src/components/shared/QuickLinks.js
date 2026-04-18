"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/store/languageStore";
import { useBranchStore } from "@/store/branchStore";

/* ── Classic navy/gold palette ── */
const GOLD = "#c9a84c";

const LINK_CONFIGS = [
  {
    nameKey: "students",
    icon: "👥",
    path: "/students",
    gradient: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
    shadow: "rgba(16,185,129,0.35)",
  },
  {
    nameKey: "teachers",
    icon: "🎓",
    path: "/teachers",
    gradient: "linear-gradient(135deg,#f43f5e 0%,#e11d48 100%)",
    shadow: "rgba(244,63,94,0.35)",
  },
  {
    nameKey: "attendance",
    icon: "✅",
    path: "/attendance",
    gradient: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)",
    shadow: "rgba(245,158,11,0.35)",
  },
  {
    nameKey: "result",
    icon: "📊",
    path: "/result",
    gradient: "linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)",
    shadow: "rgba(59,130,246,0.35)",
  },
  {
    nameKey: "routine",
    icon: "📅",
    path: "/routine",
    gradient: "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)",
    shadow: "rgba(139,92,246,0.35)",
  },
  {
    nameKey: "quaker",
    icon: "🧠",
    path: "/quaker",
    gradient: "linear-gradient(135deg,#f59e0b 0%,#b45309 100%)",
    shadow: "rgba(245,158,11,0.35)",
  },
];

function QuickLinkItem({ link }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={link.path}
      className={`ql-item${hovered ? " ql-item--hovered" : ""}`}
      style={{
        background: link.gradient,
        boxShadow: hovered
          ? `0 10px 28px ${link.shadow}`
          : `0 4px 14px ${link.shadow.replace("0.35", "0.18")}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon circle */}
      <div className={`ql-icon${hovered ? " ql-icon--hovered" : ""}`}>
        <span aria-hidden="true">{link.icon}</span>
      </div>

      {/* Label */}
      <span className="ql-label">{link.displayName}</span>
    </Link>
  );
}

export default function QuickLinks({ links, hideHeader = false }) {
  const t = useTranslations("quickLinks");
  const { currentBranchId, currentBranchName } = useBranchStore();

  const resolvedLinks = links
    ? links.map((l) => ({
        ...l,
        displayName: l.nameKey ? t(l.nameKey) : l.name,
      }))
    : LINK_CONFIGS.map((l) => ({ ...l, displayName: t(l.nameKey) }));

  return (
    <div className="ql-wrap">
      {/* Section label — hidden when parent wrapper already shows a header */}
      {!hideHeader && (
        <div className="ql-header">
          <span className="ql-header__line" />
          <span className="ql-header__text">Quick Links</span>
          <span className="ql-header__line" />
        </div>
      )}

      {/* Active branch context badge */}
      {currentBranchId != null && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            marginBottom: 10,
            padding: "4px 12px",
            background: "rgba(201,168,76,0.1)",
            border: "1px solid rgba(201,168,76,0.4)",
            borderRadius: 12,
            fontSize: 11,
            color: "#7a5c1e",
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
        >
          <span style={{ fontSize: 10 }}>🏫</span>
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 120,
            }}
          >
            {currentBranchName}
          </span>
        </div>
      )}

      <div className="ql-grid">
        {resolvedLinks.map((link, i) => (
          <QuickLinkItem key={i} link={link} />
        ))}
      </div>

      <style>{`
        .ql-wrap {
          width: 100%;
          padding: 4px 2px;
        }

        /* Header */
        .ql-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .ql-header__line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,.45));
        }
        .ql-header__line:last-child {
          background: linear-gradient(270deg, transparent, rgba(201,168,76,.45));
        }
        .ql-header__text {
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: ${GOLD};
          white-space: nowrap;
        }

        /* Grid */
        .ql-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        /* Item card */
        .ql-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 8px 14px;
          border-radius: 12px;
          text-decoration: none;
          color: #fff;
          transition: transform .25s cubic-bezier(.34,1.56,.64,1),
                      box-shadow .25s ease;
          min-height: 86px;
        }
        .ql-item--hovered {
          transform: translateY(-6px) scale(1.04);
        }

        /* Icon circle */
        .ql-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255,255,255,.22);
          box-shadow: 0 2px 8px rgba(0,0,0,.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: transform .25s ease;
          flex-shrink: 0;
        }
        .ql-icon--hovered {
          transform: rotate(-6deg) scale(1.1);
        }

        /* Label */
        .ql-label {
          font-size: .8rem;
          font-weight: 700;
          text-align: center;
          color: #fff;
          letter-spacing: .02em;
          text-transform: capitalize;
          line-height: 1.2;
        }

      `}</style>
    </div>
  );
}
