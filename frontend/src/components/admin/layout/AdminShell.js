"use client";

import { useState } from "react";
import { ToastContainer } from "react-toastify";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";

const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

/**
 * Classic admin layout: fixed dark sidebar, sticky top bar, grey content area.
 * The menu button collapses the sidebar to icons on desktop and opens it as a
 * drawer on mobile.
 */
export default function AdminShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = () => (isDesktop() ? setCollapsed((c) => !c) : setMobileOpen((o) => !o));

  return (
    <div className="admin-shell min-h-screen">
      <AdminSidebar collapsed={collapsed} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`flex flex-col min-h-screen transition-all duration-200 ${collapsed ? "md:ml-[60px]" : "md:ml-[250px]"}`}>
        <AdminTopBar onToggleMenu={toggleMenu} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <ToastContainer position="top-right" autoClose={4000} newestOnTop />
    </div>
  );
}
