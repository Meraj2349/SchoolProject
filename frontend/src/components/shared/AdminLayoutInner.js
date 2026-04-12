"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import AdminTopBar from "@/components/layout/AdminTopBar";

const AUTH_PATHS = ["/admin/login", "/admin/register"];

export default function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Main area: top bar + scrollable content */}
      <div className="flex flex-col flex-1 md:ml-70 min-h-screen">
        <AdminTopBar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="flex-1 p-5 md:p-7 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
