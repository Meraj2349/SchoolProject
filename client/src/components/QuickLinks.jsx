import React from "react";
import { Link } from "react-router-dom";

const QuickLinks = ({
  links = [
    { name: "Students", icon: "👥", color: "#2ecc71", path: "/students" },
    { name: "Teachers", icon: "🎓", color: "#e74c3c", path: "/teachers" },
    { name: "Attendance", icon: "✓", color: "#f39c12", path: "/attendance" },
    { name: "Result", icon: "📊", color: "#3498db", path: "/result" },
    { name: "Routine", icon: "📅", color: "#3498db", path: "/routine" },
    { name: "Download", icon: "⭐", color: "#f39c12", path: "/download" },
  ],
}) => {
  return (
    <div className="quick-links-section">
      {/* Quick Links Grid */}
      <div className="quick-links-grid">
        {links.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className="quick-link-item"
            style={{ backgroundColor: link.color }}
          >
            <div className="quick-link-icon">
              <span>{link.icon}</span>
            </div>
            <span className="quick-link-text">{link.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
