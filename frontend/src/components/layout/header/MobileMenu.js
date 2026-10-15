"use client";

import Link from "next/link";
import { FiX } from "react-icons/fi";
import useDialogFocus from "@/hooks/useDialogFocus";
import useEscapeKey from "@/hooks/useEscapeKey";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import PublicBranchSelector from "@/components/ui/PublicBranchSelector";
import { useTranslations } from "@/store/languageStore";

/** Full-screen menu for small screens: every page, language and branch. */
export default function MobileMenu({ items, isCurrent, onClose }) {
  const t = useTranslations();
  const panelRef = useDialogFocus(true);
  useEscapeKey(true, onClose);

  const linkClass =
    "block px-5 py-3 text-base text-school-ink no-underline border-b border-school-cream-deep hover:bg-school-cream aria-[current=page]:bg-school-cream aria-[current=page]:font-semibold aria-[current=page]:text-school-navy aria-[current=page]:border-l-4 aria-[current=page]:border-l-school-gold";
  const link = (item) => (
    <li key={item.path}>
      <Link href={item.path} onClick={onClose} aria-current={isCurrent(item.path) ? "page" : undefined} className={linkClass}>
        {item.label}
      </Link>
    </li>
  );

  return (
    <div className="fixed inset-0 z-[300] bg-school-navy-deep/60 lg:hidden" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("site.menu")}
        onClick={(event) => event.stopPropagation()}
        className="ml-auto flex h-full w-[min(20rem,88vw)] flex-col overflow-y-auto bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between bg-school-navy px-5 py-4 text-white">
          <span className="font-school-heading text-lg">{t("schoolName")}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("site.closeMenu")}
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-white/40 bg-transparent text-white cursor-pointer"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <ul className="m-0 list-none p-0">
          {items.map((item) =>
            item.children ? (
              <li key={item.key}>
                <span className="block bg-school-cream-deep px-5 py-2 text-xs font-bold uppercase tracking-wider text-school-muted">
                  {item.label}
                </span>
                <ul className="m-0 list-none p-0">{item.children.map(link)}</ul>
              </li>
            ) : (
              link(item)
            ),
          )}
        </ul>
        <div className="mt-auto flex flex-col gap-3 p-5">
          <Link href="/apply" onClick={onClose} className="site-cta text-center">
            {t("nav.onlineApply")}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher tone="light" />
            <PublicBranchSelector tone="light" />
          </div>
        </div>
      </div>
    </div>
  );
}
