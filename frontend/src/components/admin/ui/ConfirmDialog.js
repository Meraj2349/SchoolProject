"use client";

import { useId } from "react";
import { useTranslations } from "@/store/languageStore";
import Button from "./Button";
import useEscapeKey from "./useEscapeKey";

/** "Are you sure?" dialog for destructive actions. */
export default function ConfirmDialog({ open, title, children, confirmLabel, tone = "danger", busy = false, onConfirm, onCancel }) {
  const t = useTranslations("admin.shell");
  const titleId = useId();
  useEscapeKey(open && !busy, onCancel);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={busy ? undefined : onCancel} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative w-full max-w-md bg-white rounded-sm shadow-xl">
        <div className="px-5 pt-5 pb-3">
          <h2 id={titleId} className="text-lg font-semibold text-slate-800 m-0">
            {title}
          </h2>
          {children && <div className="text-sm text-slate-600 mt-2">{children}</div>}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50">
          <Button onClick={onCancel} disabled={busy}>
            {t("cancel")}
          </Button>
          <Button variant={tone} onClick={onConfirm} disabled={busy}>
            {confirmLabel ?? t("confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
