"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FaBell,
  FaCalendarCheck,
  FaEnvelope,
  FaFileAlt,
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
      path: "/admin/applications",
      icon: <FaFileAlt />,
      key: "sidebar.applications",
    },
    {
      path: "/admin/news",
      icon: <FaNoteSticky />,
      key: "sidebar.news",
    },
    {
      path: "/admin/notice-announcements",
      icon: <FaHandshake />,
      key: "sidebar.noticeAnnouncements",
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
    <div className="font-sans">
      {/* Mobile hamburger button */}
      <div className="fixed top-4 left-4 z-[1001] md:hidden">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-center p-3 rounded-xl border-none cursor-pointer text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" }}
          aria-label="Toggle menu"
        >
          {open ? (
            <FiX className="text-xl" />
          ) : (
            <FiMenu className="text-xl" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={[
          "fixed left-0 top-0 w-70 h-screen z-[1000] flex flex-col",
          "shadow-xl border-r border-white/10 transition-transform duration-300",
          "md:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        style={{ background: "linear-gradient(180deg,#1e293b 0%,#0f172a 100%)", width: "280px" }}
      >
        {/* Header */}
        <div
          className="px-6 pt-8 pb-6 relative overflow-hidden flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" }}
        >
          <h2 className="text-white text-2xl font-bold text-center tracking-tight relative z-10 m-0">
            {t("sidebar.adminDashboard")}
          </h2>
          <div className="mt-2 flex justify-center relative z-10">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <div className="px-2">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center px-4 py-3.5 my-1 rounded-xl no-underline",
                    "transition-all duration-300 relative overflow-hidden group",
                    isActive
                      ? "text-white shadow-lg border border-white/20 translate-x-1"
                      : "text-slate-300 hover:text-slate-100 hover:translate-x-2",
                  ].join(" ")}
                  style={
                    isActive
                      ? { background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" }
                      : undefined
                  }
                >
                  {/* Active right indicator */}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-white rounded-l" />
                  )}
                  <span
                    className={[
                      "flex items-center justify-center mr-3.5 text-lg min-w-5",
                      "transition-transform duration-300",
                      isActive ? "scale-110" : "group-hover:scale-110",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={[
                      "text-sm tracking-wide",
                      isActive ? "font-semibold" : "font-medium group-hover:font-semibold",
                    ].join(" ")}
                  >
                    {t(item.key)}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-white/10 bg-black/20">
          {loggingOut ? (
            <div className="flex items-center justify-center gap-3 text-slate-300 text-sm py-3.5">
              <div className="w-5 h-5 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin" />
              <span>{t("sidebar.loggingOut")}</span>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-white font-semibold text-base rounded-xl border-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg,#ef4444 0%,#dc2626 100%)" }}
            >
              {t("sidebar.logout")}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[999] backdrop-blur-sm md:hidden animate-[fadeIn_0.3s_ease_forwards]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
