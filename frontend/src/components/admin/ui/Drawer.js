"use client";

import { useId } from "react";
import { FiX } from "react-icons/fi";
import { useTranslations } from "@/store/languageStore";
import useEscapeKey from "./useEscapeKey";

/** Side panel for forms (add/edit) that slides in from the right. */
export default function Drawer({ open, title, onClose, footer, width = "max-w-lg", children }) {
  const t = useTranslations("admin.shell");
  const titleId = useId();
  useEscapeKey(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex flex-col w-full ${width} h-full bg-white shadow-xl`}
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 id={titleId} className="text-lg font-semibold text-slate-800 m-0">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="flex items-center justify-center w-8 h-8 rounded-sm text-slate-500 hover:bg-slate-100 bg-transparent border-none cursor-pointer"
          >
            <FiX aria-hidden="true" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 px-4 py-3 border-t border-slate-200">{footer}</footer>}
      </div>
    </div>
  );
}
