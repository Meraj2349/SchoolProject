"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";
import "@/styles/ChairmanCard.css";

export default function ChairmanCard({ image, name, title, message }) {
  const t = useTranslations("chairmanCard");

  return (
    <div
      className="chairman-card"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Subtle accent bar top-left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 5,
          height: "100%",
          background: "linear-gradient(180deg, #10b981 0%, #059669 100%)",
          borderRadius: "20px 0 0 20px",
        }}
      />

      <div className="chairman-image-container">
        <img
          src={image}
          alt={`${name} – ${title}`}
          className="chairman-image"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </div>

      <div className="chairman-content">
        <div className="chairman-header">
          {/* Role label */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
              color: "#065f46",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "3px 10px",
              borderRadius: 20,
              marginBottom: 10,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            {title}
          </span>
          <h2 className="chairman-name" style={{ marginBottom: 0 }}>{name}</h2>
        </div>

        {message && (
          <div className="chairman-message" style={{ marginTop: 16 }}>
            {/* Open-quote decoration */}
            <span
              style={{
                fontSize: 48,
                lineHeight: 0.5,
                color: "#d1fae5",
                fontFamily: "Georgia, serif",
                display: "block",
                marginBottom: 8,
              }}
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="chairman-message-text">
              {message.length > 220 ? `${message.substring(0, 220)}…` : message}
            </p>
          </div>
        )}

        <div className="chairman-actions" style={{ marginTop: 24 }}>
          <Link
            href="/chairman-message"
            className="chairman-link"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {t("viewFullMessage")}
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
