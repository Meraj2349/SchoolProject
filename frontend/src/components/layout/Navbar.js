"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import PublicBranchSelector from "@/components/ui/PublicBranchSelector";
import { useTranslations } from "@/store/languageStore";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <style>{`
        @keyframes slideInFromTop {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .mobile-menu-animate { animation: slideInFromTop 0.3s ease-out; }
        .online-apply-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        .online-apply-btn:hover::before { left: 100%; }
        .mobile-link-arrow::after { content: '→'; font-size: 16px; transition: transform 0.3s ease; }
        .mobile-link-arrow:hover::after { transform: translateX(4px); }
      `}</style>

      {/* Top bar */}
      <div
        className="flex justify-between items-center bg-white text-gray-700 border-b border-gray-200"
        style={{
          transition: "box-shadow 0.3s ease, padding 0.3s ease",
          boxShadow: scrolled
            ? "0 4px 20px rgba(0,0,0,0.12)"
            : "0 2px 8px rgba(0,0,0,0.1)",
          padding: scrolled ? "10px 30px" : "15px 30px",
        }}
      >
        {/* Logo section */}
        <div className="flex-1 flex items-center gap-2.5 p-2.5 max-sm:flex-col max-sm:items-center max-sm:text-center">
          <Image
            src="/images/logo1.png"
            alt={`${t("schoolName")} Logo`}
            width={80}
            height={80}
            style={{
              transition: "width 0.3s ease, height 0.3s ease",
              width: scrolled ? 64 : 80,
              height: scrolled ? 64 : 80,
            }}
          />
          <div className="flex flex-col items-start max-sm:items-center">
            <span className="text-sm text-gray-500">
              {t("establishedYear") ? `ESTD : ${t("establishedYear")}` : ""}
            </span>
            <span
              className="font-bold text-gray-900"
              style={{
                transition: "font-size 0.3s ease",
                fontSize: scrolled ? "20px" : "24px",
              }}
            >
              {t("schoolName")}
            </span>
            <span className="text-sm text-gray-500">{t("location")}</span>
          </div>
        </div>

        {/* Top right */}
        <div className="flex items-center gap-6">
          <div
            className="online-apply-btn relative flex items-center cursor-pointer text-white font-semibold px-4 py-2 rounded-lg overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(16,185,129,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(16,185,129,0.3)";
            }}
          >
            <Link href="/apply">
              <span>{t("nav.onlineApply")}</span>
            </Link>
          </div>
          <div className="hidden lg:flex items-center cursor-pointer text-gray-700 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-200 transition-colors duration-200 gap-1">
            <span>{t("nav.quakerEducation")}</span>
            <span className="text-[10px] ml-1">▼</span>
          </div>
          <LanguageSwitcher />
          {/* Hamburger — hidden on lg+ */}
          <button
            className={`lg:hidden text-white text-xl cursor-pointer p-3 rounded-xl border-none ${mobileMenuOpen ? "hidden" : "block"}`}
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              boxShadow: "0 4px 12px rgba(5,150,105,0.3)",
              transition: "all 0.3s ease",
            }}
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Main nav bar */}
      <div
        className="bg-white border-b border-gray-200 sticky top-0 z-[100]"
        style={{
          transition: "box-shadow 0.3s ease",
          boxShadow: scrolled
            ? "0 4px 16px rgba(0,0,0,0.1)"
            : "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex justify-between max-w-[1200px] mx-auto px-5">
          <ul className="hidden lg:flex list-none flex-1 m-0 p-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.path} className="inline-block mr-7 relative">
                <Link
                  href={item.path}
                  className={`block py-4 text-sm font-medium no-underline transition-colors duration-300 relative ${
                    isActive(item.path)
                      ? "text-emerald-500 font-semibold"
                      : "text-gray-700 hover:text-emerald-500"
                  }`}
                  style={{ transition: "color 0.2s ease" }}
                >
                  {t(item.key)}
                  {isActive(item.path) && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[3px] rounded-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center py-1.5">
            <PublicBranchSelector />
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-menu-animate lg:hidden fixed top-0 left-0 w-full h-screen z-[9999] overflow-y-auto"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          {/* Mobile header */}
          <div
            className="flex justify-between items-center p-5 shadow-md"
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo1.png"
                width={50}
                height={50}
                className="w-[50px] h-[50px] rounded-lg"
                alt={`${t("schoolName")} Logo`}
              />
              <div className="flex flex-col">
                <span className="text-base font-semibold text-white">
                  {t("schoolName")}
                </span>
              </div>
            </div>
            <button
              className="flex items-center justify-center w-9 h-9 text-lg text-white cursor-pointer border-2 border-white/30 rounded-lg transition-all duration-300 hover:rotate-90"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              }}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <ul className="list-none m-0 py-5 px-0 max-w-[400px] mx-auto">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.path}
                className="mx-4 my-2 rounded-xl overflow-hidden shadow-sm bg-white"
              >
                <Link
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-link-arrow flex items-center justify-between px-6 py-[18px] text-base font-medium no-underline uppercase tracking-wide transition-all duration-300 ${
                    isActive(item.path)
                      ? "text-white font-semibold"
                      : "text-gray-700 hover:text-white"
                  }`}
                  style={
                    isActive(item.path)
                      ? {
                          background:
                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          transform: "translateX(8px)",
                          boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
                        }
                      : {}
                  }
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.background =
                        "linear-gradient(135deg, #059669 0%, #047857 100%)";
                      e.currentTarget.style.transform = "translateX(8px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.background = "";
                      e.currentTarget.style.transform = "";
                    }
                  }}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="px-4 pb-5 flex flex-col gap-2.5">
            <PublicBranchSelector />
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </>
  );
}
