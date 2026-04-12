"use client";

import { usePathname } from "next/navigation";
import { FiBell, FiMenu, FiUser } from "react-icons/fi";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

const ROUTE_LABELS = {
  "/admin/notices": "Notices",
  "/admin/messages": "Chairman Messages",
  "/admin/gallery": "Image Gallery",
  "/admin/routine": "Class Routine",
  "/admin/studentList": "Students",
  "/admin/teacherList": "Teachers",
  "/admin/class": "Classes",
  "/admin/subject": "Subjects",
  "/admin/results": "Results",
  "/admin/exams": "Exams",
  "/admin/events": "Events",
  "/admin/attendance": "Attendance",
  "/admin/attendance/grid": "Attendance Records",
  "/admin/applications": "Applications",
  "/admin/news": "News",
  "/admin/notice-announcements": "Notice Announcements",
  "/admin/updateEmailPassword": "Settings",
};

export default function AdminTopBar({ onMenuToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const pageLabel = ROUTE_LABELS[pathname] || "Admin Panel";

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
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors border-none cursor-pointer bg-transparent"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="text-xl" />
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 hidden sm:inline">Admin</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-semibold text-slate-800">{pageLabel}</span>
        </div>
      </div>

      {/* Right: language switcher + bell + avatar */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors border-none cursor-pointer bg-transparent">
          <FiBell className="text-lg" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <FiUser className="text-sm" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-700">Admin</span>
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">Administrator</p>
                  <p className="text-xs text-slate-500 mt-0.5">School Admin</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent disabled:opacity-60"
                >
                  {loggingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
