"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaBell,
  FaCalendarCheck,
  FaEnvelope,
  FaHandshake,
  FaImage,
} from "react-icons/fa";
import {
  FaClipboardList,
  FaMessage,
  FaNoteSticky,
  FaPeopleGroup,
} from "react-icons/fa6";
import { FiMenu, FiX } from "react-icons/fi";
import { RiListCheck, RiTimerLine } from "react-icons/ri";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "@/store/languageStore";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import "@/styles/Sidebar.css";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const t = useTranslations();

  const NAV_LINKS = [
    { path: "/admin/notices", icon: <FaBell />, key: "sidebar.notice" },
    {
      path: "/admin/messages",
      icon: <FaMessage />,
      key: "sidebar.chairMessage",
    },
    { path: "/admin/gallery", icon: <FaImage />, key: "sidebar.imageGallery" },
    { path: "/admin/routine", icon: <RiTimerLine />, key: "sidebar.routine" },
    {
      path: "/admin/studentList",
      icon: <FaPeopleGroup />,
      key: "sidebar.studentList",
    },
    {
      path: "/admin/teacherList",
      icon: <FaPeopleGroup />,
      key: "sidebar.teacherList",
    },
    {
      path: "/admin/class",
      icon: <FaPeopleGroup />,
      key: "sidebar.classTeacher",
    },
    { path: "/admin/subject", icon: <FaEnvelope />, key: "sidebar.subject" },
    {
      path: "/admin/results",
      icon: <FaClipboardList />,
      key: "sidebar.results",
    },
    { path: "/admin/exams", icon: <FaClipboardList />, key: "sidebar.exams" },
    { path: "/admin/events", icon: <FaCalendarCheck />, key: "sidebar.events" },
    {
      path: "/admin/attendance/grid",
      icon: <FaClipboardList />,
      key: "sidebar.attendanceGrid",
    },
    {
      path: "/admin/updateEmailPassword",
      icon: <FaEnvelope />,
      key: "sidebar.settings",
    },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      clearAuth();
      router.push("/admin/login");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="mobile-menu-button">
        <button onClick={() => setOpen((o) => !o)} className="menu-button">
          {open ? <FiX className="icon" /> : <FiMenu className="icon" />}
        </button>
      </div>

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h2>{t("sidebar.adminDashboard")}</h2>
            <div style={{ marginTop: "8px" }}>
              <LanguageSwitcher />
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-links">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={`nav-link ${pathname === item.path ? "active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{t(item.key)}</span>
                </Link>
              ))}
            </div>
          </nav>
          <div className="sidebar-footer">
            {loggingOut ? (
              <div className="logout-loading">
                <div className="spinner" />
                <span>{t("sidebar.loggingOut")}</span>
              </div>
            ) : (
              <button onClick={handleLogout} className="logout-button">
                {t("sidebar.logout")}
              </button>
            )}
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
