"use client";

import { usePathname } from "next/navigation";
import AdminShell from "@/components/admin/layout/AdminShell";

const AUTH_PATHS = ["/admin/login", "/admin/register"];

export default function AdminLayoutInner({ children }) {
  const pathname = usePathname();

  if (AUTH_PATHS.includes(pathname)) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
