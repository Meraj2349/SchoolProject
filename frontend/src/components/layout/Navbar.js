"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useTranslations } from "@/store/languageStore";
import "@/styles/Navbar.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  const isActive = (path) => pathname === path;

  const NAV_ITEMS = [
    { key: "nav.home", path: "/" },
    { key: "nav.about", path: "/about" },
    { key: "nav.gallery", path: "/gallery" },
    { key: "nav.events", path: "/events" },
    { key: "nav.branches", path: "/branches" },
    { key: "nav.students", path: "/students" },
  ];

  return (
    <>
      <div className="top-bar">
        <div className="logo-section">
          <img
            src="/images/logo1.png"
            className="logo-image"
            alt={`${t("schoolName")} Logo`}
          />
          <div className="logo-text">
            <span className="logo-estd">ESTD : {t("establishedYear")}</span>
            <span className="logo-name">{t("schoolName")}</span>
            <span className="logo-location">{t("location")}</span>
          </div>
        </div>
        <div className="top-right-section">
          <div className="online-apply-dropdown">
            <Link href="/apply">
              <span>{t("nav.onlineApply")}</span>
            </Link>
          </div>
          <div className="quaker-education">
            <span>{t("nav.quakerEducation")}</span>
            <span className="arrow-down">▼</span>
          </div>
          <LanguageSwitcher />
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? "hidden" : ""}`}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <div className="main-navigation">
        <div className="nav-container">
          <ul className="nav-items">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.path}
                className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              >
                <Link
                  href={item.path}
                  className={isActive(item.path) ? "active-link" : ""}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <div className="mobile-logo-section">
              <img
                src="/images/logo1.png"
                className="mobile-logo-image"
                alt={`${t("schoolName")} Logo`}
              />
              <div className="mobile-logo-text">
                <span className="mobile-logo-name">{t("schoolName")}</span>
              </div>
            </div>
            <button
              className="mobile-menu-close"
              onClick={() => setMobileMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={isActive(item.path) ? "active-mobile-link" : ""}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ padding: "12px 16px" }}>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </>
  );
}
