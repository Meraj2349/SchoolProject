"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";
import "@/styles/NotFound.css";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>{t("title")}</h2>
        <p>{t("subtitle")}</p>
        <Link href="/" className="home-link">
          {t("backHome")}
        </Link>
      </div>
    </div>
  );
}
