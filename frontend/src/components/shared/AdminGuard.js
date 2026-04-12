"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/register"];

export default function AdminGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublic = PUBLIC_ADMIN_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublic) return;
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/admin/login");
    }
  }, [pathname, isPublic, router]);

  // Always render login/register without a token check
  if (isPublic) return children;

  const token = typeof window !== "undefined" ? Cookies.get("token") : true;
  if (!token) return null;

  return children;
}
