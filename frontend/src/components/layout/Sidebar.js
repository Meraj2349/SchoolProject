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
  FaCodeBranch,
} from "react-icons/fa";
import {
  FaClipboardList,
  FaMessage,
  FaNoteSticky,
  FaPeopleGroup,
} from "react-icons/fa6";
import { FiX, FiLogOut, FiLayout } from "react-icons/fi";
import { RiListCheck, RiTimerLine } from "react-icons/ri";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "@/store/languageStore";

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [loggingOut, setLoggingOut] = useState(false);
  const t = useTranslations();
  const role = useAuthStore((s) => s.role);

  const NAV_LINKS = [
    {
      path: "/admin/dashboard",
      icon: <FiLayout />,
      key: "sidebar.adminDashboard",
      superAdminOnly: true,
    },
    {
      path: "/admin/branches",
      icon: <FaCodeBranch />,
      key: "sidebar.branches",
      superAdminOnly: true,
    },
    { path: "/admin/notices", icon: <FaBell />, key: "sidebar.notice" },
    {
      path: "/admin/messages",
      icon: <FaMessage />,
      key: "sidebar.chairMessage",
    },
    {
      path: "/admin/chairman",
      icon: <FaHandshake />,
      key: "sidebar.chairmanProfile",
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
      path: "/admin/attendance",
      icon: <RiListCheck />,
      key: "sidebar.attendance",
    },
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
    <>
      {/* Sidebar */}
      <aside
        className={[
          "fixed left-0 top-0 h-screen z-1000 flex flex-col",
          "shadow-xl border-r border-white/10 transition-transform duration-300",
          "md:translate-x-0",
          open
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full md:translate-x-0",
        ].join(" ")}
        style={{
          background: "linear-gradient(180deg,#1e293b 0%,#0f172a 100%)",
          width: "280px",
        }}
      >
        {/* Logo / Header */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">SA</span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight truncate">
              School Admin
            </p>
            <p className="text-slate-400 text-xs leading-tight">
              Management Panel
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors border-none cursor-pointer bg-transparent shrink-0"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3">
          <div className="px-3">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2 mt-1">
              Navigation
            </p>
            {NAV_LINKS.filter(
              (item) => !item.superAdminOnly || role === "super_admin",
            ).map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={onClose}
                  className={[
                    "flex items-center px-3 py-2.5 my-0.5 rounded-xl no-underline",
                    "transition-all duration-200 group",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                      : "text-slate-300 hover:bg-white/8 hover:text-white",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex items-center justify-center mr-3 text-base min-w-4.5",
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-indigo-300",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={[
                      "text-sm",
                      isActive ? "font-semibold" : "font-medium",
                    ].join(" ")}
                  >
                    {t(item.key)}
                  </span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer: logout */}
        <div className="shrink-0 p-4 border-t border-white/10">
          {loggingOut ? (
            <div className="flex items-center justify-center gap-3 text-slate-300 text-sm py-3">
              <div className="w-4 h-4 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin" />
              <span>{t("sidebar.loggingOut")}</span>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 text-slate-300 hover:text-white font-semibold text-sm rounded-xl border border-white/10 cursor-pointer transition-all duration-200 hover:bg-red-600 hover:border-red-600 bg-transparent"
            >
              <FiLogOut className="text-base" />
              {t("sidebar.logout")}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-999 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}
