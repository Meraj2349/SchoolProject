"use client";

import { FiAlertTriangle, FiInbox } from "react-icons/fi";
import { useTranslations } from "@/store/languageStore";

/** A quiet "Loading…" in the school colours. */
export function SiteLoader({ label }) {
  const t = useTranslations("common");
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-16 text-school-muted">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-school-gold/30 border-t-school-gold" aria-hidden="true" />
      <span className="text-sm">{label ?? t("loading")}</span>
    </div>
  );
}

/** Nothing to show yet. */
export function EmptyState({ title, message, icon: Icon = FiInbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-school-gold/40 bg-school-cream px-6 py-14 text-center">
      <Icon aria-hidden="true" className="text-3xl text-school-gold" />
      <p className="m-0 font-school-heading text-lg font-bold text-school-navy">{title}</p>
      {message && <p className="m-0 max-w-md text-sm text-school-muted">{message}</p>}
    </div>
  );
}

/** Something went wrong; optionally offer to try again. */
export function ErrorState({ message, onRetry }) {
  const t = useTranslations("common");
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 rounded-sm border border-red-200 bg-red-50 px-6 py-10 text-center text-red-800">
      <FiAlertTriangle aria-hidden="true" className="text-3xl" />
      <p className="m-0">{message ?? t("error")}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="site-cta">
          {t("tryAgain")}
        </button>
      )}
    </div>
  );
}
