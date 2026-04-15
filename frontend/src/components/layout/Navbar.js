"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import PublicBranchSelector from "@/components/ui/PublicBranchSelector";
import { useTranslations } from "@/store/languageStore";
import "@/styles/Navbar.css";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  // Add shadow + compact style once user scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
      {/* Top bar */}
      <div
        className="top-bar"
        style={{
          transition: "box-shadow 0.3s ease, padding 0.3s ease",
          boxShadow: scrolled
            ? "0 4px 20px rgba(0,0,0,0.12)"
            : "0 2px 8px rgba(0,0,0,0.1)",
          padding: scrolled ? "10px 30px" : "15px 30px",
        }}
      >
        <div className="logo-section">
          <img
            src="/images/logo1.png"
            className="logo-image"
            alt={`${t("schoolName")} Logo`}
            style={{
              transition: "width 0.3s ease, height 0.3s ease",
              width: scrolled ? 64 : 80,
              height: scrolled ? 64 : 80,
            }}
          />
          <div className="logo-text">
            <span className="logo-estd">ESTD : {t("establishedYear")}</span>
            <span
              className="logo-name"
              style={{
                transition: "font-size 0.3s ease",
                fontSize: scrolled ? "20px" : "24px",
              }}
            >
              {t("schoolName")}
            </span>
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
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Main nav bar */}
      <div
        className="main-navigation"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          transition: "box-shadow 0.3s ease",
          boxShadow: scrolled ? "0 4px 16px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
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
                  style={{ transition: "color 0.2s ease" }}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
          {/* Branch switcher — lets public visitors filter content by branch */}
          <div style={{ display: "flex", alignItems: "center", padding: "6px 0" }}>
            <PublicBranchSelector />
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
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
              aria-label="Close menu"
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

          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <PublicBranchSelector />
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </>
  );
}
