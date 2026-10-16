"use client";

import { useLanguageStore } from "@/store/languageStore";

const TONES = {
  dark: { group: "border-white/30 text-white", active: "bg-school-gold text-school-navy font-bold", idle: "hover:bg-white/15" },
  light: { group: "border-school-navy/30 text-school-navy", active: "bg-school-navy text-white font-bold", idle: "hover:bg-school-navy/10" },
};

/**
 * Toggle between Bangla and English. The choice is saved (Zustand persist)
 * and every page re-renders in that language. `tone` matches the background.
 */
export default function LanguageSwitcher({ tone = "dark" }) {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const styles = TONES[tone] ?? TONES.dark;

  const option = (value, label, title) => (
    <button
      type="button"
      lang={value}
      className={`border-none cursor-pointer text-xs px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
        language === value ? styles.active : `bg-transparent text-inherit ${styles.idle}`
      }`}
      onClick={() => setLanguage(value)}
      aria-pressed={language === value}
      title={title}
    >
      {label}
    </button>
  );

  return (
    <div className={`inline-flex items-center gap-0.5 border rounded-full p-0.5 ${styles.group}`} role="group" aria-label="Language / ভাষা">
      {option("bn", "বাংলা", "বাংলা")}
      {option("en", "EN", "English")}
    </div>
  );
}
