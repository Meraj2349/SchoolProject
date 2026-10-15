"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import useEscapeKey from "@/hooks/useEscapeKey";

/** A main-nav item that opens a short list of links (e.g. Academics). */
export default function NavMenu({ label, links, isCurrent }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const current = links.some((link) => isCurrent(link.path));
  useEscapeKey(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (!event.target.closest?.(`[data-nav-menu="${menuId}"]`)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, menuId]);

  return (
    <div className="relative" data-nav-menu={menuId}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={`site-nav-link inline-flex items-center gap-1 border-none bg-transparent cursor-pointer ${current ? "is-current" : ""}`}
      >
        {label}
        <FiChevronDown aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul id={menuId} className="absolute left-0 top-full z-[150] m-0 min-w-52 list-none border-t-2 border-school-gold bg-white p-0 py-1 shadow-xl">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                aria-current={isCurrent(link.path) ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-school-ink no-underline hover:bg-school-cream aria-[current=page]:font-semibold aria-[current=page]:text-school-navy"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
