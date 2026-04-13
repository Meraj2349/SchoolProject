"use client";

import { useTranslations } from "@/store/languageStore";
import useScrollReveal from "@/hooks/useScrollReveal";
import "@/styles/Footer.css";
import Image from "next/image";

const QUICK_LINKS = [
  "DSHE",
  "BANBEIS",
  "BD National Portal",
  "Ministry of Education",
  "Sylhet Board",
];

export default function Footer() {
  const t = useTranslations();
  const footerRef = useScrollReveal(0.05);

  return (
    <footer
      ref={footerRef}
      className="footer-container reveal"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top accent gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: "linear-gradient(90deg, #4b2e83 0%, #7c3aed 40%, #10b981 70%, #059669 100%)",
        }}
      />

      <div className="footer-main">
        {/* School info */}
        <div className="footer-info">
          <div
            style={{
              position: "relative",
              display: "inline-block",
            }}
          >
            <Image
              src="/images/logo1.png"
              alt="School Logo"
              width={80}
              height={80}
              className="school-logo"
              style={{
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08) rotate(-2deg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1) rotate(0)"; }}
            />
          </div>

          <h3>{t("schoolName")}</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { icon: "📞", label: t("footer.contact"), value: "01997588476" },
              { icon: "✉️", label: t("footer.email"), value: "merajislam2349@gmail.com" },
              { icon: "📍", label: null, value: t("location") },
            ].map((item, i) => (
              <p
                key={i}
                style={{
                  margin: 0,
                  color: "#555",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {item.label && (
                  <strong style={{ color: "#374151", marginRight: 2 }}>
                    {item.label}:
                  </strong>
                )}
                {item.value}
              </p>
            ))}
          </div>
        </div>

        {/* Quick links */}
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

        {/* Maintained by */}
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

      {/* Bottom bar */}
      <div
        className="footer-bottom"
        style={{
          background: "linear-gradient(135deg, #4b2e83 0%, #3b1f6e 100%)",
        }}
      >
        <p>{t("footer.developedBy")}</p>
        <p style={{ color: "#fbbf24", fontWeight: 700 }}>{t("footer.helpline")}</p>
      </div>
    </footer>
  );
}
