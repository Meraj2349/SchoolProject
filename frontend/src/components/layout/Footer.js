"use client";

import { useTranslations } from "@/store/languageStore";
import "@/styles/Footer.css";

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="footer-container">
      <div className="footer-main">
        <div className="footer-info">
          <img
            src="/images/logo1.png"
            alt="School Logo"
            className="school-logo"
          />
          <h3>{t("schoolName")}</h3>
          <p>{t("footer.contact")}: 01997588476</p>
          <p>{t("footer.email")}: merajislam2349@gmail.com</p>
          <p>{t("location")}</p>
        </div>
        <div className="footer-links">
          <h4>{t("footer.quickLinks")}</h4>
          <ul>
            <li>
              <a href="#">DSHE</a>
            </li>
            <li>
              <a href="#">BANBEIS</a>
            </li>
            <li>
              <a href="#">BD National Portal</a>
            </li>
            <li>
              <a href="#">Ministry of Education</a>
            </li>
            <li>
              <a href="#">Sylhet Board</a>
            </li>
          </ul>
        </div>
        <div className="footer-maintained">
          <h4>{t("footer.maintainedBy")}</h4>
          <img
            src="/images/sustLogo.png"
            alt="SUST Logo"
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
