"use client";

/**
 * Zustand language store.
 *
 * - Default language: "bn" (Bangla)
 * - Persists to localStorage key "language"
 * - Exposes useTranslations() hook for component-level access
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import en from "@/i18n/en.json";
import bn from "@/i18n/bn.json";

const TRANSLATIONS = { en, bn };

/**
 * Resolve a dot-separated key against an object.
 * e.g. resolveKey("nav.home", { nav: { home: "HOME" } }) → "HOME"
 */
function resolveKey(key, obj) {
  return (
    key.split(".").reduce((acc, part) => {
      if (acc == null) return key; // fallback to key
      return acc[part];
    }, obj) ?? key
  );
}

export const useLanguageStore = create(
  persist(
    (set, get) => ({
      language: "bn",

      setLanguage: (lang) => {
        if (lang !== "en" && lang !== "bn") return;
        set({ language: lang });
      },

      toggleLanguage: () => {
        const current = get().language;
        set({ language: current === "bn" ? "en" : "bn" });
      },

      /** Translate a dot-notation key for the currently selected language */
      t: (key) => {
        const lang = get().language;
        const dict = TRANSLATIONS[lang] ?? TRANSLATIONS.bn;
        return resolveKey(key, dict);
      },
    }),
    {
      name: "language", // localStorage key
      partialize: (state) => ({ language: state.language }),
    },
  ),
);

/**
 * Convenience hook — returns a translator bound to the current language.
 *
 * Usage:
 *   const t = useTranslations();
 *   <span>{t("nav.home")}</span>
 *
 * Or with a namespace:
 *   const t = useTranslations("nav");
 *   <span>{t("home")}</span>
 */
export function useTranslations(namespace) {
  const language = useLanguageStore((s) => s.language);
  const dict = TRANSLATIONS[language] ?? TRANSLATIONS.bn;

  return (key) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return resolveKey(fullKey, dict);
  };
}
