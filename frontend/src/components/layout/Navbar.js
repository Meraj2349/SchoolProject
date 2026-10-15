"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMail, FiMenu, FiPhone } from "react-icons/fi";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import PublicBranchSelector from "@/components/ui/PublicBranchSelector";
import { PUBLIC_NAV, SCHOOL_CONTACT } from "@/lib/schoolInfo";
import { useTranslations } from "@/store/languageStore";
import MobileMenu from "./header/MobileMenu";
import NavMenu from "./header/NavMenu";

/**
 * The public site header, in three bands like a classic school website:
 * a contact strip, the crest with the school's name, and the main menu.
 */
export default function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  const isCurrent = (path) => (path === "/" ? pathname === "/" : pathname === path || pathname?.startsWith(`${path}/`));
  const items = PUBLIC_NAV.map((item) => ({
    ...item,
    label: t(`nav.${item.key}`),
    children: item.children?.map((child) => ({ ...child, label: t(`nav.${child.key}`) })),
  }));

  return (
    <header className="font-school-body">
      {/* Contact strip */}
      <div className="bg-school-navy-deep text-white/90 text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5">
          <div className="flex min-w-0 items-center gap-4">
            <a href={SCHOOL_CONTACT.phoneHref} className="inline-flex items-center gap-1.5 text-inherit no-underline hover:text-school-gold-soft">
              <FiPhone aria-hidden="true" />
              <span className="sr-only">{t("site.call")}: </span>
              {SCHOOL_CONTACT.phone}
            </a>
            <a
              href={`mailto:${SCHOOL_CONTACT.email}`}
              className="hidden sm:inline-flex items-center gap-1.5 truncate text-inherit no-underline hover:text-school-gold-soft"
            >
              <FiMail aria-hidden="true" />
              <span className="sr-only">{t("site.email")}: </span>
              {SCHOOL_CONTACT.email}
            </a>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <PublicBranchSelector />
          </div>
        </div>
      </div>

      {/* Crest band */}
      <div className="border-b-4 border-school-gold bg-school-cream">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:py-4">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 text-inherit no-underline">
            <Image src="/images/logo1.png" alt={`${t("schoolName")} logo`} width={72} height={72} className="h-14 w-14 shrink-0 md:h-[72px] md:w-[72px]" priority />
            <span className="flex min-w-0 flex-col">
              <span className="font-school-heading text-xl font-bold leading-tight text-school-navy md:text-3xl">{t("schoolName")}</span>
              <span className="text-xs text-school-muted md:text-sm">
                {t("site.estd")}: {t("establishedYear")} · {t("location")}
              </span>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-school-gold md:block">{t("site.motto")}</span>
            </span>
          </Link>
          <Link href="/apply" className="site-cta hidden md:inline-flex">
            {t("nav.onlineApply")}
          </Link>
        </div>
      </div>

      {/* Main menu */}
      <nav aria-label={t("site.mainNavigation")} className="sticky top-0 z-[100] bg-school-navy shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <ul className="m-0 hidden list-none items-stretch p-0 lg:flex">
            {items.map((item) => (
              <li key={item.key} className="flex">
                {item.children ? (
                  <NavMenu label={item.label} links={item.children} isCurrent={isCurrent} />
                ) : (
                  <Link href={item.path} aria-current={isCurrent(item.path) ? "page" : undefined} className="site-nav-link">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <span className="py-3 font-school-heading text-sm text-white/90 lg:hidden">{t("site.menu")}</span>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t("site.openMenu")}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/30 bg-transparent text-white cursor-pointer lg:hidden"
          >
            <FiMenu aria-hidden="true" />
          </button>
        </div>
      </nav>

      {mobileOpen && <MobileMenu items={items} isCurrent={isCurrent} onClose={() => setMobileOpen(false)} />}
    </header>
  );
}
