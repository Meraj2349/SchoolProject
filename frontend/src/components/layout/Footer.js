"use client";

import { useTranslations } from "@/store/languageStore";
import "@/styles/Footer.css";
import Image from "next/image";

const QUICK_LINKS = ["DSHE", "BANBEIS", "BD National Portal", "Ministry of Education", "Sylhet Board"];

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="footer-container">
      <div className="footer-main">
        <div className="footer-info">
          <Image
            src="/images/logo1.png"
            alt="School Logo"
            width={80}
            height={80}
            className="school-logo"
          />
          <h3>{t("schoolName")}</h3>
          <p className="footer-contact-row">
            {t("footer.contact")}: 01997588476
          </p>
          <p className="footer-email-row">
            {t("footer.email")}: merajislam2349@gmail.com
          </p>
          <p className="footer-location-row">
            {t("location")}
          </p>
        </div>

        <div className="footer-links">
          <h4>{t("footer.quickLinks")}</h4>
          <ul>
            {QUICK_LINKS.map((link) => (
              <li key={link}>
                <a href="#">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-maintained">
          <h4>{t("footer.maintainedBy")}</h4>
          <Image
            src="/images/sustLogo.png"
            alt="SUST Logo"
            width={140}
            height={140}
            className="maintained-logo"
          />
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t("footer.developedBy")}</p>
        <p>{t("footer.helpline")}</p>
      </div>
    </footer>
  );
}
