"use client";

import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { useTranslations } from "@/store/languageStore";

/**
 * The banner at the top of every public page: breadcrumb (Home › … › page),
 * eyebrow, the page's one h1, a gold rule and an optional subtitle.
 * `trail` lists pages between Home and this one: [{ label, href }].
 */
export default function PageHero({ eyebrow, title, subtitle, trail = [], children }) {
  const t = useTranslations();
  return (
    <section className="relative overflow-hidden bg-school-navy font-school-body text-white">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 12px)" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10 md:py-14">
        <nav aria-label={t("site.breadcrumb")} className="mb-4 text-xs text-white/70">
          <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
            {[{ label: t("nav.home"), href: "/" }, ...trail].map((crumb) => (
              <li key={crumb.href} className="inline-flex items-center gap-1">
                <Link href={crumb.href} className="text-white/80 no-underline hover:text-school-gold-soft">
                  {crumb.label}
                </Link>
                <FiChevronRight aria-hidden="true" />
              </li>
            ))}
            <li aria-current="page" className="font-semibold text-school-gold-soft">
              {title}
            </li>
          </ol>
        </nav>
        {eyebrow && <p className="m-0 mb-1 text-xs font-bold uppercase tracking-[0.25em] text-school-gold-soft">{eyebrow}</p>}
        <h1 className="m-0 font-school-heading text-3xl font-bold leading-tight md:text-4xl">{title}</h1>
        <span className="site-rule" aria-hidden="true" />
        {subtitle && <p className="m-0 mt-3 max-w-2xl text-white/80">{subtitle}</p>}
        {children}
      </div>
      <div className="h-1 bg-gradient-to-r from-school-gold via-school-gold-soft to-school-gold" aria-hidden="true" />
    </section>
  );
}
