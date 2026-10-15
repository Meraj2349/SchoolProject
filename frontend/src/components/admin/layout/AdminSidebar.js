"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiChevronDown, FiChevronRight, FiX } from "react-icons/fi";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "@/store/languageStore";
import { findNavItem, visibleNavigation } from "../navigation";

function NavLink({ item, isCurrent, collapsed, onNavigate, t, nested }) {
  const Icon = item.icon;
  const label = t(item.key);
  return (
    <Link
      href={item.path}
      onClick={onNavigate}
      aria-current={isCurrent ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      className={[
        "flex items-center gap-3 py-2.5 text-sm no-underline border-l-[3px] transition-colors",
        collapsed ? "justify-center px-0" : nested ? "pl-8 pr-4" : "px-4",
        isCurrent
          ? "text-white border-[var(--admin-sidebar-active)] bg-[var(--admin-sidebar-hover)]"
          : "text-[var(--admin-sidebar-text)] border-transparent hover:text-white hover:bg-[var(--admin-sidebar-hover)]",
      ].join(" ")}
    >
      <Icon className="shrink-0 text-base" aria-hidden="true" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

/**
 * Classic dark admin sidebar with collapsible menu groups.
 * - collapsed: desktop icons-only mode
 * - open: mobile drawer is visible; onClose hides it (also after navigating)
 */
export default function AdminSidebar({ open = false, collapsed = false, onClose }) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const t = useTranslations();
  const groups = visibleNavigation(role);
  const current = findNavItem(pathname);
  const currentGroupKey = current?.group.key;

  // Only groups the admin opened or closed by hand are stored; any other group
  // is open exactly when it contains the current page.
  const [toggled, setToggled] = useState({});
  const isExpanded = (key) => toggled[key] ?? key === currentGroupKey;
  const toggleGroup = (key) => setToggled((previous) => ({ ...previous, [key]: !isExpanded(key) }));

  const isCurrent = (item) => current?.item.path === item.path;
  const linkProps = { collapsed, onNavigate: onClose, t };

  return (
    <>
      <aside
        aria-label={t("admin.shell.menu")}
        className={[
          "admin-no-print fixed left-0 top-0 z-[1000] flex flex-col h-screen transition-all duration-200",
          "bg-[var(--admin-sidebar-bg)]",
          collapsed ? "md:w-[60px]" : "md:w-[250px]",
          "w-[250px]",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="flex items-center h-[50px] shrink-0 px-4 bg-[var(--admin-primary-dark)] text-white">
          <span className="font-bold tracking-wide truncate">
            {collapsed ? "SA" : t("admin.shell.panelTitle")}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("admin.shell.close")}
            className="ml-auto md:hidden flex items-center justify-center w-8 h-8 text-white/80 hover:text-white bg-transparent border-none cursor-pointer"
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {groups.map((group) => {
            if (!group.key || collapsed) {
              return group.items.map((item) => (
                <NavLink key={item.path} item={item} isCurrent={isCurrent(item)} {...linkProps} />
              ));
            }
            const expanded = isExpanded(group.key);
            const GroupIcon = group.icon;
            const hasCurrent = group.key === currentGroupKey;
            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={expanded}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left bg-transparent border-0 border-l-[3px] cursor-pointer",
                    hasCurrent ? "text-white border-[var(--admin-sidebar-active)]" : "text-[var(--admin-sidebar-text)] border-transparent",
                    "hover:text-white hover:bg-[var(--admin-sidebar-hover)]",
                  ].join(" ")}
                >
                  <GroupIcon className="shrink-0 text-base" aria-hidden="true" />
                  <span className="flex-1 truncate">{t(group.key)}</span>
                  {expanded ? <FiChevronDown aria-hidden="true" /> : <FiChevronRight aria-hidden="true" />}
                </button>
                {expanded && (
                  <div className="bg-[#2c3b41]">
                    {group.items.map((item) => (
                      <NavLink key={item.path} item={item} isCurrent={isCurrent(item)} nested {...linkProps} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {open && (
        <div className="admin-no-print fixed inset-0 z-[999] bg-black/50 md:hidden" onClick={onClose} aria-hidden="true" />
      )}
    </>
  );
}
