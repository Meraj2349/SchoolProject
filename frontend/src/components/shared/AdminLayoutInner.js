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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "24px", background: "#f9fafb" }}>
        {children}
      </main>
    </div>
  );
}
