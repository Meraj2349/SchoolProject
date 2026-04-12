"use client";

import { useLanguageStore } from "@/store/languageStore";
import "@/styles/LanguageSwitcher.css";

/**
 * Toggle button between English and Bangla.
 * Saves selection to localStorage key "language" via Zustand persist.
 */
export default function LanguageSwitcher() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <div
      className="language-switcher"
      role="group"
      aria-label="Language selector"
    >
      <button
        className={`lang-btn ${language === "bn" ? "active" : ""}`}
        onClick={() => setLanguage("bn")}
        aria-pressed={language === "bn"}
        title="বাংলা"
      >
        বাংলা
      </button>
      <span className="lang-divider">|</span>
      <button
        className={`lang-btn ${language === "en" ? "active" : ""}`}
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
