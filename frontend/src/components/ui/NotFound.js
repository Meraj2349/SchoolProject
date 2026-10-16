"use client";

import Link from "next/link";
import { PublicPage } from "@/components/site";
import { useTranslations } from "@/store/languageStore";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <PublicPage>
      <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
        <p className="m-0 font-school-heading text-8xl font-bold text-school-gold" aria-hidden="true">
          404
        </p>
        <h1 className="site-heading m-0 mt-2 text-3xl">{t("title")}</h1>
        <span className="site-rule mx-auto" aria-hidden="true" />
        <p className="m-0 mt-4 mb-8 text-lg text-school-muted">{t("subtitle")}</p>
        <Link href="/" className="site-cta">
          {t("backHome")}
        </Link>
      </section>
    </PublicPage>
  );
}
