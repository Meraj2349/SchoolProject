"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";
import "@/styles/ChairmanCard.css";

export default function ChairmanCard({ image, name, title, message }) {
  const t = useTranslations("chairmanCard");

  return (
    <div className="chairman-card">
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
          <h2 className="chairman-name">{name}</h2>
          <p className="chairman-title">{title}</p>
        </div>
        {message && (
          <div className="chairman-message">
            <p className="chairman-message-text">
              {message.length > 200 ? `${message.substring(0, 200)}…` : message}
            </p>
          </div>
        )}
        <div className="chairman-actions">
          <Link href="/chairman-message" className="chairman-link">
            {t("viewFullMessage")}
          </Link>
        </div>
      </div>
    </div>
  );
}
