"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/store/languageStore";

const LINK_CONFIGS = [
  {
    nameKey: "students",
    icon: "👥",
    gradient: "linear-gradient(135deg,#10b981 0%,#059669 100%)",
    shadow: "rgba(16,185,129,0.4)",
    path: "/students",
  },
  {
    nameKey: "teachers",
    icon: "🎓",
    gradient: "linear-gradient(135deg,#f43f5e 0%,#e11d48 100%)",
    shadow: "rgba(244,63,94,0.4)",
    path: "/teachers",
  },
  {
    nameKey: "attendance",
    icon: "✅",
    gradient: "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)",
    shadow: "rgba(245,158,11,0.4)",
    path: "/attendance",
  },
  {
    nameKey: "result",
    icon: "📊",
    gradient: "linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)",
    shadow: "rgba(59,130,246,0.4)",
    path: "/result",
  },
  {
    nameKey: "routine",
    icon: "📅",
    gradient: "linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)",
    shadow: "rgba(139,92,246,0.4)",
    path: "/routine",
  },
];

function QuickLinkItem({ link, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={link.path}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px 10px",
        borderRadius: 14,
        textDecoration: "none",
        color: "#fff",
        background: link.gradient,
        boxShadow: hovered
          ? `0 10px 28px ${link.shadow}`
          : `0 4px 14px ${link.shadow.replace("0.4", "0.25")}`,
        transform: hovered ? "translateY(-6px) scale(1.04)" : "translateY(0) scale(1)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        minHeight: 88,
        cursor: "pointer",
        animationDelay: `${index * 60}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
          fontSize: 20,
          transition: "transform 0.25s ease",
          transform: hovered ? "rotate(-6deg) scale(1.1)" : "rotate(0) scale(1)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {link.icon}
      </div>

      <span
        style={{
          fontSize: "0.82rem",
          fontWeight: 700,
          textAlign: "center",
          letterSpacing: "0.02em",
          textTransform: "capitalize",
        }}
      >
        {link.displayName}
      </span>
    </Link>
  );
}

export default function QuickLinks({ links }) {
  const t = useTranslations("quickLinks");

  const resolvedLinks = (links
    ? links.map((l) => ({ ...l, displayName: l.nameKey ? t(l.nameKey) : l.name }))
    : LINK_CONFIGS.map((l) => ({ ...l, displayName: t(l.nameKey) }))
  );

  return (
    <div style={{ width: "100%", padding: "4px 4px" }}>
      {/* Section label */}
      <div
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#6b7280",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        Quick Links
        <span style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}
      >
        {resolvedLinks.map((link, index) => (
          <QuickLinkItem key={index} link={link} index={index} />
        ))}
      </div>
    </div>
  );
}
