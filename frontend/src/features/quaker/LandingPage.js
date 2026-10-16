"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiBarChart2, FiCheckCircle, FiDatabase } from "react-icons/fi";
import { useTranslations } from "@/store/languageStore";

const FEATURES = [
  { key: "bank", icon: FiDatabase },
  { key: "grading", icon: FiCheckCircle },
  { key: "progress", icon: FiBarChart2 },
];

export default function LandingPage() {
  const t = useTranslations("quaker");

  return (
    <div className="font-school-body">
      <section className="relative overflow-hidden bg-school-navy-deep text-white">
        <Image src="/images/School Gate Picture.jpg" alt={t("heroAlt")} fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-linear-to-r from-school-navy-deep via-school-navy/90 to-school-navy/40" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start px-4 py-20 sm:py-28">
          <p className="m-0 mb-6 rounded-full border border-school-gold/50 px-4 py-1 text-xs font-bold uppercase tracking-[0.14em] text-school-gold-soft">{t("badge")}</p>
          <h1 className="m-0 max-w-3xl font-school-heading text-4xl font-bold leading-tight sm:text-6xl">
            {t("headline")} <span className="block text-school-gold-soft">{t("headlineAccent")}</span>
          </h1>
          <span className="site-rule mt-6" aria-hidden="true" />
          <p className="m-0 mt-6 max-w-xl text-lg leading-relaxed text-white/80">{t("intro")}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/quaker/start" className="site-cta">
              {t("startQuiz")}
              <FiArrowRight aria-hidden="true" />
            </Link>
            <Link href="/quaker/progress" className="site-cta-outline">
              {t("checkProgress")}
            </Link>
          </div>
        </div>
        <div className="relative h-1 bg-school-gold" aria-hidden="true" />
      </section>

      <section aria-labelledby="quaker-inside" className="bg-school-cream py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 id="quaker-inside" className="site-heading m-0 text-3xl sm:text-4xl">
              {t("insideTitle")}
            </h2>
            <span className="site-rule mx-auto mt-4" aria-hidden="true" />
            <p className="mx-auto mb-0 mt-4 max-w-lg text-school-muted">{t("insideBody")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {FEATURES.map(({ key, icon: Icon }) => (
              <article key={key} className="rounded-sm border-t-4 border-school-gold bg-white p-6 shadow">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-school-navy text-xl text-school-gold-soft" aria-hidden="true">
                  <Icon />
                </span>
                <h3 className="site-heading m-0 text-lg">{t(`features.${key}.title`)}</h3>
                <p className="m-0 mt-2 text-sm leading-relaxed text-school-muted">{t(`features.${key}.body`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="quaker-ready" className="border-y-4 border-school-gold bg-school-navy py-20 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 id="quaker-ready" className="m-0 font-school-heading text-3xl font-bold text-school-gold-soft sm:text-4xl">
            {t("readyTitle")}
          </h2>
          <p className="mx-auto mb-8 mt-3 max-w-xl text-lg leading-relaxed text-white/75">{t("readyBody")}</p>
          <Link href="/quaker/start" className="site-cta">
            {t("startNow")}
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
