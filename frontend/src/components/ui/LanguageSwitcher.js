"use client";

import { useLanguageStore } from "@/store/languageStore";

/**
 * Toggle button between English and Bangla.
 * Saves selection to localStorage key "language" via Zustand persist.
 */
export default function LanguageSwitcher() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return (
    <div
      className="inline-flex items-center gap-1 bg-white/15 border border-white/40 rounded-full px-2 py-0.5 text-xs"
      role="group"
      aria-label="Language selector"
    >
      <button
        className={[
          "border-none cursor-pointer text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-all duration-200",
          language === "bn"
            ? "bg-white/85 text-[#2d5a27] font-bold"
            : "bg-transparent text-inherit hover:bg-white/25",
        ].join(" ")}
        onClick={() => setLanguage("bn")}
        aria-pressed={language === "bn"}
        title="বাংলা"
      >
        বাংলা
      </button>
      <span className="opacity-50 select-none">|</span>
      <button
        className={[
          "border-none cursor-pointer text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-all duration-200",
          language === "en"
            ? "bg-white/85 text-[#2d5a27] font-bold"
            : "bg-transparent text-inherit hover:bg-white/25",
        ].join(" ")}
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
