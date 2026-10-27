"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { useAuthStore } from "@/store/authStore";
import { canOpen, findNavItem } from "../navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import SuperAdminOnly from "./SuperAdminOnly";

const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

/**
 * Classic admin layout: fixed dark sidebar, sticky top bar, grey content area.
 * The menu button collapses the sidebar to icons on desktop and opens it as a
 * drawer on mobile. A branch admin who opens a super-admin page by its address
 * gets a notice instead of the page.
 */
export default function AdminShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);

  const toggleMenu = () => (isDesktop() ? setCollapsed((c) => !c) : setMobileOpen((o) => !o));

  return (
    <div className="admin-shell min-h-screen">
      <AdminSidebar collapsed={collapsed} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`flex flex-col min-h-screen transition-all duration-200 ${collapsed ? "md:ml-[60px]" : "md:ml-[250px]"}`}>
        <AdminTopBar onToggleMenu={toggleMenu} />
        <main className="flex-1 p-4 md:p-6">
          {canOpen(pathname, role) ? children : <SuperAdminOnly titleKey={findNavItem(pathname).item.key} />}
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    </div>
  );
}
