"use client";

import Link from "next/link";
import { useTranslations } from "@/store/languageStore";

export default function QuickLinks({ links }) {
  const t = useTranslations("quickLinks");

  const DEFAULT_LINKS = [
    { nameKey: "students", icon: "👥", color: "#2ecc71", path: "/students" },
    { nameKey: "teachers", icon: "🎓", color: "#e74c3c", path: "/teachers" },
    { nameKey: "attendance", icon: "✓", color: "#f39c12", path: "/attendance" },
    { nameKey: "result", icon: "📊", color: "#3498db", path: "/result" },
    { nameKey: "routine", icon: "📅", color: "#3498db", path: "/routine" },
  ];

  // Support both old format (with name) and new format (with nameKey)
  const resolvedLinks = (links ?? DEFAULT_LINKS).map((link) => ({
    ...link,
    displayName: link.nameKey ? t(link.nameKey) : link.name,
  }));

  return (
    <div className="quick-links-section">
      <div className="quick-links-grid">
        {resolvedLinks.map((link, index) => (
          <Link
            key={index}
            href={link.path}
            className="quick-link-item"
            style={{ backgroundColor: link.color }}
          >
            <div className="quick-link-icon">
              <span>{link.icon}</span>
            </div>
            <span className="quick-link-text">{link.displayName}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
