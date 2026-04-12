"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

const AUTH_PATHS = ["/admin/login", "/admin/register"];

export default function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Offset main content by sidebar width on md+ screens */}
      <main className="flex-1 p-6 bg-gray-50 md:ml-[280px]">
        {children}
      </main>
    </div>
  );
}
