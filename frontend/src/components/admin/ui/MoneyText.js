"use client";

import { formatTaka } from "@/lib/money";
import { useLanguageStore } from "@/store/languageStore";

/** Taka amount in the current language; negative amounts shown in red. */
export default function MoneyText({ amount, className = "" }) {
  const language = useLanguageStore((s) => s.language);
  const negative = Number(amount) < 0;
  return <span className={`tabular-nums ${negative ? "text-red-600" : ""} ${className}`}>{formatTaka(amount, language)}</span>;
}
