"use client";

import Image from "next/image";
import Link from "next/link";
import { FiExternalLink, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { useBranches } from "@/hooks/useBranches";
import { localized } from "@/lib/homePage";
import { EDUCATION_LINKS, PUBLIC_NAV, SCHOOL_CONTACT } from "@/lib/schoolInfo";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const isActive = (branch) => !(branch.is_proposed === true || branch.is_proposed === 1);
const EXPLORE = [...PUBLIC_NAV.flatMap((item) => item.children ?? [item]), { key: "onlineApply", path: "/apply" }];

function FooterHeading({ id, children }) {
  return (
    <h2 id={id} className="m-0 mb-4 font-school-heading text-lg text-school-gold-soft">
      {children}
      <span className="site-rule" aria-hidden="true" />
    </h2>
  );
}

const linkClass = "text-white/80 no-underline hover:text-school-gold-soft hover:underline";

/** The public site footer: about, pages, branches, education links and contact. */
export default function Footer() {
  const t = useTranslations();
  const language = useLanguageStore((s) => s.language);
  const { data: branches = [] } = useBranches();
  const activeBranches = branches.filter(isActive);

  return (
    <footer className="mt-auto bg-school-navy font-school-body text-white/85">
      <div className="h-1 bg-gradient-to-r from-school-gold via-school-gold-soft to-school-gold" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <section aria-labelledby="footer-about">
          <div className="mb-4 flex items-center gap-3">
            <Image src="/images/logo1.png" alt={`${t("schoolName")} logo`} width={56} height={56} />
            <h2 id="footer-about" className="m-0 font-school-heading text-xl text-white">
              {t("schoolName")}
            </h2>
          </div>
          <p className="m-0 text-sm leading-relaxed">{t("footer.about")}</p>
        </section>

        <section aria-labelledby="footer-explore">
          <FooterHeading id="footer-explore">{t("footer.explore")}</FooterHeading>
          <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-2 p-0 text-sm">
            {EXPLORE.map((item) => (
              <li key={item.path}>
                <Link href={item.path} className={linkClass}>
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="footer-branches">
          <FooterHeading id="footer-branches">{t("footer.ourBranches")}</FooterHeading>
          <ul aria-labelledby="footer-branches" className="m-0 mb-6 list-none space-y-2 p-0 text-sm">
            {activeBranches.map((branch) => (
              <li key={branch.id}>
                <Link href="/branches" className={linkClass}>
                  {localized(branch, "name", language)}
                </Link>
              </li>
            ))}
          </ul>
          <FooterHeading id="footer-links">{t("footer.educationLinks")}</FooterHeading>
          <ul aria-labelledby="footer-links" className="m-0 list-none space-y-2 p-0 text-sm">
            {EDUCATION_LINKS.map((link) => (
              <li key={link.key}>
                <a href={link.href} target="_blank" rel="noopener noreferrer" className={`${linkClass} inline-flex items-center gap-1.5`}>
                  {t(`footer.links.${link.key}`)}
                  <FiExternalLink aria-hidden="true" className="text-xs" />
                  <span className="sr-only">{t("footer.opensNewTab")}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="footer-contact">
          <FooterHeading id="footer-contact">{t("footer.contactUs")}</FooterHeading>
          <address className="space-y-3 text-sm not-italic">
            <p className="m-0 flex items-start gap-2">
              <FiMapPin aria-hidden="true" className="mt-1 shrink-0 text-school-gold" />
              <span>
                <span className="sr-only">{t("footer.address")}: </span>
                {t("location")}
              </span>
            </p>
            <p className="m-0 flex items-center gap-2">
              <FiPhone aria-hidden="true" className="shrink-0 text-school-gold" />
              <a href={SCHOOL_CONTACT.phoneHref} className={linkClass}>
                <span className="sr-only">{t("footer.phone")}: </span>
                {SCHOOL_CONTACT.phone}
              </a>
            </p>
            <p className="m-0 flex items-center gap-2">
              <FiMail aria-hidden="true" className="shrink-0 text-school-gold" />
              <a href={`mailto:${SCHOOL_CONTACT.email}`} className={`${linkClass} break-all`}>
                {SCHOOL_CONTACT.email}
              </a>
            </p>
          </address>
          <div className="mt-6 flex items-center gap-3">
            <Image src="/images/sustLogo.png" alt={t("footer.sustLogo")} width={48} height={48} className="rounded bg-white p-1" />
            <span className="text-xs text-white/70">{t("footer.maintainedBy")}</span>
          </div>
        </section>
      </div>
      <div className="border-t border-white/10 bg-school-navy-deep">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-white/70 sm:flex-row">
          <p className="m-0">
            © {new Date().getFullYear()} {t("schoolName")}. {t("footer.rights")}
          </p>
          <p className="m-0">{t("footer.developedBy")}</p>
        </div>
      </div>
    </footer>
  );
}
