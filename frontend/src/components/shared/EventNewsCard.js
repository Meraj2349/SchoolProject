"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";

export default function EventNewsCard({
  type,
  data = [],
  containerStyle = {},
}) {
  const t = useTranslations("eventNews");
  const isEvents = type === "events";
  const accentColor = isEvents ? "#6366f1" : "#06b6d4";
  const headerGradient = isEvents
    ? "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)"
    : "linear-gradient(135deg,#06b6d4 0%,#3b82f6 100%)";
  const dateGradient = isEvents
    ? "linear-gradient(135deg,#22c55e 0%,#16a34a 100%)"
    : "linear-gradient(135deg,#f59e0b 0%,#d97706 100%)";

  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(135deg,#ffffff,#fefefe)",
        borderRadius: 15,
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.05)",
        ...containerStyle,
      }}
    >
      <div
        style={{
          background: headerGradient,
          color: "#fff",
          padding: "16px 20px",
          fontWeight: 600,
          textAlign: "center",
          fontSize: "1.1rem",
        }}
      >
        {isEvents ? t("events") : t("news")}
      </div>
      <div
        style={{
          padding: "12px 8px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {data.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "flex-start",
              marginBottom: idx === data.length - 1 ? 0 : 12,
              background: "#fff",
              padding: 14,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                minWidth: 60,
                minHeight: 60,
                background: dateGradient,
                color: "#fff",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                marginRight: 16,
                padding: 8,
                textAlign: "center",
                boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
              }}
            >
              {item.date}
            </div>
            <div style={{ flex: 1 }}>
              <Link
                href={item.link || "#"}
                style={{
                  color: "#1f2937",
                  fontSize: 14,
                  lineHeight: 1.4,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                {item.text || item.title || item.name}
              </Link>
              {item.venue && (
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                  📍 {item.venue}
                </div>
              )}
            </div>
          </div>
        ))}
        <div
          style={{
            textAlign: "center",
            marginTop: "auto",
            paddingTop: 16,
            borderTop: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Link
            href={`/${type}`}
            style={{
              color: accentColor,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {isEvents ? t("viewAllEvents") : t("viewAllNews")}
          </Link>
        </div>
      </div>
    </div>
  );
}
