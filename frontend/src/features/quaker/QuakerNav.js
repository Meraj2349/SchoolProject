"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/quaker/start", label: "Take Quiz" },
  { href: "/quaker/progress", label: "My Progress" },
];

export default function QuakerNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Top accent strip — mirrors the public Navbar's border-b and Footer's gradient accent */}
      <div
        className="h-[3px] w-full"
        style={{
          background:
            "linear-gradient(90deg, #4b2e83 0%, #7c3aed 40%, #10b981 70%, #059669 100%)",
        }}
      />

      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div
          className="max-w-[1200px] mx-auto px-5 flex items-center justify-between"
          style={{ paddingTop: 12, paddingBottom: 12 }}
        >
          {/* Logo — same pattern as Navbar top-bar logo block */}
          <Link
            href="/quaker"
            className="flex items-center gap-3 no-underline"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-md flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#fff",
              }}
            >
              🧠
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
                Star Shikkha Poribar
              </span>
              <span className="text-base font-bold text-gray-900 tracking-tight">
                A Quaker Education
              </span>
            </div>
          </Link>

          {/* Desktop nav — same font/color treatment as Navbar nav items */}
          <nav className="hidden sm:flex items-center gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 no-underline rounded-lg ${
                  pathname === l.href
                    ? "text-emerald-600 font-semibold"
                    : "text-gray-700 hover:text-emerald-600 hover:bg-gray-50"
                }`}
              >
                {l.label}
                {pathname === l.href && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[3px] rounded-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    }}
                  />
                )}
              </Link>
            ))}
            <Link
              href="/"
              className="ml-3 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors no-underline"
            >
              ← Back to Site
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-5 pb-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 mt-2 text-sm font-medium rounded-xl no-underline transition-all ${
                  pathname === l.href
                    ? "text-white font-semibold"
                    : "text-gray-700 hover:text-white"
                }`}
                style={
                  pathname === l.href
                    ? {
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
                      }
                    : {}
                }
                onMouseEnter={(e) => {
                  if (pathname !== l.href) {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, #059669 0%, #047857 100%)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== l.href) {
                    e.currentTarget.style.background = "";
                  }
                }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 mt-2 text-sm font-medium text-gray-500 rounded-xl border border-gray-200 no-underline hover:bg-gray-50"
            >
              ← Back to Site
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
