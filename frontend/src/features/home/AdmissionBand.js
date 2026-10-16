"use client";

import Link from "next/link";
import { FiPhone } from "react-icons/fi";
import { SCHOOL_CONTACT } from "@/lib/schoolInfo";
import { useTranslations } from "@/store/languageStore";

/** Closing call to action: apply online or phone the school. */
export default function AdmissionBand() {
  const t = useTranslations("home.admission");
  return (
    <section aria-labelledby="admission-title" className="relative overflow-hidden bg-school-navy py-14 font-school-body text-white">
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-school-gold/20 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 id="admission-title" className="m-0 font-school-heading text-3xl text-white">
            {t("title")}
          </h2>
          <p className="m-0 mt-2 max-w-2xl text-white/80">{t("body")}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/apply" className="site-cta">
            {t("apply")}
          </Link>
          <a href={SCHOOL_CONTACT.phoneHref} className="site-cta-outline">
            <FiPhone aria-hidden="true" />
            {t("call").replace("{phone}", SCHOOL_CONTACT.phone)}
          </a>
        </div>
      </div>
    </section>
  );
}
