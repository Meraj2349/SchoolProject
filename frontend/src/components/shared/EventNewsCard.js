"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/store/languageStore";

function EventItem({ item, dateGradient, isLast, accentColor }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        marginBottom: isLast ? 0 : 10,
        background: hovered ? "#f8fffe" : "#fff",
        padding: 12,
        borderRadius: 10,
        border: `1px solid ${hovered ? "rgba(16,185,129,0.2)" : "rgba(0,0,0,0.07)"}`,
        boxShadow: hovered
          ? "0 4px 16px rgba(16,185,129,0.1)"
          : "0 2px 6px rgba(0,0,0,0.04)",
        transition: "all 0.22s ease",
        transform: hovered ? "translateX(3px)" : "translateX(0)",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Date badge */}
      <div
        style={{
          minWidth: 56,
          minHeight: 56,
          background: dateGradient,
          color: "#fff",
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          marginRight: 14,
          padding: "6px 4px",
          textAlign: "center",
          boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
          fontSize: 13,
          lineHeight: 1.3,
          flexShrink: 0,
          transition: "transform 0.2s ease",
          transform: hovered ? "scale(1.06)" : "scale(1)",
        }}
      >
        {item.date}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Link
          href={item.link || "#"}
          style={{
            color: hovered ? accentColor : "#1f2937",
            fontSize: 13,
            lineHeight: 1.45,
            textDecoration: "none",
            fontWeight: 600,
            display: "block",
            transition: "color 0.2s ease",
          }}
        >
          {item.text || item.title || item.name}
        </Link>
        {item.venue && (
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3, display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 10 }}>📍</span>
            {item.venue}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventNewsCard({
  type,
  data = [],
  containerStyle = {},
}) {
  const t = useTranslations("eventNews");
  const isEvents = type === "events";
  const accentColor = isEvents ? "#6366f1" : "#0891b2";
  const headerGradient = isEvents
    ? "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)"
    : "linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)";
  const dateGradient = isEvents
    ? "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)"
    : "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)";

  const [viewAllHovered, setViewAllHovered] = useState(false);

  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "box-shadow 0.3s ease",
        ...containerStyle,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: headerGradient,
          color: "#fff",
          padding: "14px 20px",
          fontWeight: 700,
          textAlign: "center",
          fontSize: "1rem",
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>{isEvents ? "📅" : "📰"}</span>
        {isEvents ? t("events") : t("news")}
      </div>

      {/* Items */}
      <div
        style={{
          padding: "14px 12px 8px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {data.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 13,
              padding: 24,
              textAlign: "center",
            }}
          >
            {isEvents ? t("noEventsAvailable") ?? "No upcoming events" : t("noNewsAvailable") ?? "No news yet"}
          </div>
        ) : (
          data.map((item, idx) => (
            <EventItem
              key={idx}
              item={item}
              dateGradient={dateGradient}
              isLast={idx === data.length - 1}
              accentColor={accentColor}
            />
          ))
        )}

        {/* View all link */}
        <div
          style={{
            textAlign: "center",
            marginTop: "auto",
            paddingTop: 14,
            borderTop: "1px solid rgba(0,0,0,0.07)",
          }}
        >
          <Link
            href={`/${type}`}
            style={{
              color: viewAllHovered ? "#fff" : accentColor,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 18px",
              borderRadius: 20,
              background: viewAllHovered
                ? accentColor
                : `${accentColor}14`,
              transition: "all 0.22s ease",
              border: `1px solid ${accentColor}30`,
            }}
            onMouseEnter={() => setViewAllHovered(true)}
            onMouseLeave={() => setViewAllHovered(false)}
          >
            {isEvents ? t("viewAllEvents") : t("viewAllNews")}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
