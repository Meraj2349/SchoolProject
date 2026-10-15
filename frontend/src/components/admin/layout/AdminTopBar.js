"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { FiChevronDown, FiLogOut, FiMenu, FiUser } from "react-icons/fi";
import BranchSelector from "@/components/ui/BranchSelector";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useTranslations } from "@/store/languageStore";
import useEscapeKey from "../ui/useEscapeKey";
import { breadcrumbsFor } from "../navigation";

function Breadcrumbs({ pathname, t }) {
  const crumbs = breadcrumbsFor(pathname);
  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-sm text-slate-500 min-w-0">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <Fragment key={`${crumb.key}-${index}`}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {isLast ? (
              <span aria-current="page" className="font-semibold text-slate-800 truncate">
                {t(crumb.key)}
              </span>
            ) : crumb.path ? (
              <Link href={crumb.path} className="text-slate-500 hover:text-slate-800 no-underline">
                {t(crumb.key)}
              </Link>
            ) : (
              <span className="truncate">{t(crumb.key)}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

function UserMenu({ t }) {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const branchName = useBranchStore((s) => s.currentBranchName);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  useEscapeKey(open, () => setOpen(false));

  const roleLabel = role === "super_admin" ? t("superAdmin") : t("branchAdmin");

  const signOut = async () => {
    setSigningOut(true);
    try {
      await authService.logout();
    } finally {
      clearAuth();
      router.push("/admin/login");
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 h-[50px] px-3 text-sm text-slate-700 bg-transparent border-none cursor-pointer hover:bg-slate-100"
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-600" aria-hidden="true">
          <FiUser />
        </span>
        <span className="hidden sm:inline">{roleLabel}</span>
        <FiChevronDown aria-hidden="true" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="menu" className="absolute right-0 top-full z-50 w-56 bg-white border border-slate-200 shadow-lg rounded-sm">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-semibold text-slate-800 m-0">{roleLabel}</p>
              <p className="text-xs text-slate-500 mt-0.5 mb-0">{role === "branch_admin" ? branchName : t("allBranches")}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              disabled={signingOut}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-red-600 bg-transparent border-none cursor-pointer hover:bg-red-50 disabled:opacity-60"
            >
              <FiLogOut aria-hidden="true" />
              {signingOut ? t("signingOut") : t("signOut")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** White top bar: menu toggle, breadcrumbs, branch + language pickers, user menu. */
export default function AdminTopBar({ onToggleMenu }) {
  const pathname = usePathname();
  const t = useTranslations();
  const tShell = useTranslations("admin.shell");

  return (
    <header className="admin-no-print sticky top-0 z-50 flex items-center justify-between h-[50px] bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center min-w-0">
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label={tShell("toggleMenu")}
          className="flex items-center justify-center w-[50px] h-[50px] text-slate-600 bg-transparent border-none cursor-pointer hover:bg-slate-100"
        >
          <FiMenu className="text-lg" aria-hidden="true" />
        </button>
        <Breadcrumbs pathname={pathname} t={t} />
      </div>
      <div className="flex items-center gap-1 pr-1">
        <div className="hidden sm:block">
          <BranchSelector />
        </div>
        <LanguageSwitcher />
        <UserMenu t={tShell} />
      </div>
    </header>
  );
}
