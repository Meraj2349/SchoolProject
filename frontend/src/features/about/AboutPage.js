"use client";

import Image from "next/image";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { PageHero, PublicPage, SiteCard } from "@/components/site";
import { SCHOOL_CONTACT } from "@/lib/schoolInfo";
import { useTranslations } from "@/store/languageStore";

const MAP_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3642.0098647768087!2d90.01732967589534!3d24.174524126251374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375601dc523374e5%3A0xb6e0a55e11d5c5ce!2sStar%20Academic%20School!5e0!3m2!1sen!2sbd!4v1690095436935!5m2!1sen!2sbd";

export default function AboutPage() {
  const t = useTranslations();
  const contact = [
    { icon: FiMapPin, label: t("about.address"), value: t("about.addressValue") },
    { icon: FiPhone, label: t("about.phone"), value: SCHOOL_CONTACT.phone, href: SCHOOL_CONTACT.phoneHref },
    { icon: FiMail, label: t("about.emailLabel"), value: SCHOOL_CONTACT.email, href: `mailto:${SCHOOL_CONTACT.email}` },
  ];

  return (
    <PublicPage>
      <PageHero eyebrow={t("schoolName")} title={t("about.title")} subtitle={t("about.subtitle")} />

      <section className="bg-white py-14">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 md:grid-cols-[2fr_3fr]">
          <div className="overflow-hidden rounded-sm border-4 border-white shadow-lg ring-2 ring-school-gold/60">
            <Image src="/images/School Gate Picture.jpg" alt={t("home.hero.gateAlt")} width={800} height={600} className="h-auto w-full object-cover" />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-school-ink">
            <p className="m-0 border-l-4 border-school-gold pl-5">{t("about.body1")}</p>
            <p className="m-0">{t("about.body2")}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="visit-title" className="bg-school-cream py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 text-center">
            <h2 id="visit-title" className="site-heading m-0 text-2xl md:text-3xl">
              {t("about.visitTitle")}
            </h2>
            <span className="site-rule mx-auto" aria-hidden="true" />
            <p className="m-0 mt-3 text-school-muted">{t("about.locationSubtitle")}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
            <div className="h-[360px] overflow-hidden rounded-sm shadow-lg md:h-[400px]">
              <iframe
                src={MAP_URL}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${t("schoolName")} location`}
              />
            </div>
            <SiteCard id="contact-title" title={t("about.getInTouch")}>
              <ul className="m-0 list-none space-y-4 p-0">
                {contact.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex gap-3 border-b border-school-cream-deep pb-3 last:border-0">
                    <Icon aria-hidden="true" className="mt-1 shrink-0 text-school-gold" />
                    <div className="min-w-0">
                      <p className="m-0 text-xs font-bold uppercase tracking-wider text-school-muted">{label}</p>
                      {href ? (
                        <a href={href} className="break-words font-semibold text-school-navy no-underline hover:underline">
                          {value}
                        </a>
                      ) : (
                        <p className="m-0 font-semibold text-school-navy">{value}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </SiteCard>
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
