"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/store/languageStore";

/** Keeps <html lang> in step with the chosen language, for screen readers and Bangla fonts. */
export default function DocumentLanguage() {
  const language = useLanguageStore((s) => s.language);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return null;
}
