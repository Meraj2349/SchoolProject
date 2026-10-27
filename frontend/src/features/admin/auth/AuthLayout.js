"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslations } from "@/store/languageStore";

const LOGO = "/images/logos/star-shiksha-paribar.png";

function Brand({ compact = false }) {
  const t = useTranslations();
  return (
    <div className="flex items-center gap-3">
      <span className={`shrink-0 rounded-full bg-white p-1 shadow-md ${compact ? "w-10 h-10" : "w-14 h-14"}`}>
        <Image src={LOGO} alt="" width={56} height={56} className="w-full h-full object-contain" />
      </span>
      <span className="leading-tight">
        <span className={`block font-school-heading font-bold text-white ${compact ? "text-base" : "text-xl"}`}>
          {t("schoolName")}
        </span>
        <span className="block text-xs uppercase tracking-[0.2em] text-school-gold-soft">{t("admin.auth.portal")}</span>
      </span>
    </div>
  );
}

/** Shared frame for the admin sign-in and register pages: school panel + form card. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  const t = useTranslations("admin.auth");

  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] bg-school-cream font-school-body text-school-ink">
      {/* School panel — a band on phones, a full column on wide screens */}
      <aside className="relative overflow-hidden bg-school-navy text-white">
        <Image src="/images/School Gate Picture.jpg" alt="" fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-linear-to-b from-school-navy/70 via-school-navy/85 to-school-navy-deep" />
        <div className="relative px-4 py-5 sm:px-8 lg:h-full lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="hidden lg:block">
            <Brand />
          </div>
          <div className="hidden lg:block max-w-md">
            <p className="font-school-heading text-school-gold-soft text-lg mb-3">
              “{t("motto")}”
            </p>
            <h1 className="font-school-heading text-4xl xl:text-5xl font-bold leading-tight mb-4">{t("heroTitle")}</h1>
            <p className="text-white/75 text-lg leading-relaxed">{t("heroText")}</p>
          </div>
          <div className="hidden lg:block h-1 w-16 rounded-full bg-school-gold" />
        </div>
      </aside>

      <main className="flex flex-col px-4 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-3 mb-6 lg:mb-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-school-muted no-underline hover:text-school-navy"
          >
            <FiArrowLeft aria-hidden="true" />
            {t("backToSite")}
          </Link>
          <LanguageSwitcher tone="light" />
        </div>

        <div className="flex-1 flex items-center justify-center lg:py-10">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl border border-school-cream-deep shadow-[0_12px_40px_-12px_rgb(13_31_60/0.25)] p-6 sm:p-8">
              <h2 className="font-school-heading text-2xl sm:text-3xl font-bold text-school-navy mb-1">{title}</h2>
              {subtitle && <p className="text-sm text-school-muted mb-6">{subtitle}</p>}
              {children}
            </div>
            {footer && <p className="text-center text-sm text-school-muted mt-5 mb-0">{footer}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
