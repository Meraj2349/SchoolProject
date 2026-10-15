"use client";

import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiGitBranch } from "react-icons/fi";
import { useBranches } from "@/hooks/useBranches";
import { localized } from "@/lib/homePage";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const isActive = (branch) => !(branch.is_proposed === true || branch.is_proposed === 1);

function BranchOption({ selected, label, onSelect }) {
  return (
    <li role="presentation">
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onSelect}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm border-none cursor-pointer ${
          selected ? "bg-school-cream font-semibold text-school-navy" : "bg-white text-school-ink hover:bg-school-cream"
        }`}
      >
        <span className="flex-1">{label}</span>
        {selected && <FiCheck aria-hidden="true" className="text-school-gold" />}
      </button>
    </li>
  );
}

/**
 * Lets a visitor narrow the whole site to one branch. Every data hook reads
 * the same branch store, so switching here reloads the page's data for it.
 * `tone` matches the background it sits on.
 */
export default function PublicBranchSelector({ tone = "dark" }) {
  const { currentBranchId, currentBranchName, setBranch } = useBranchStore();
  const language = useLanguageStore((s) => s.language);
  const t = useTranslations("branchSelector");
  const { data: branches = [] } = useBranches();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const listRef = useRef(null);

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (!event.target.closest?.("[data-branch-selector]")) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // On opening, focus the chosen branch (or "All branches").
  useEffect(() => {
    if (open) (listRef.current?.querySelector('[aria-selected="true"]') ?? listRef.current?.querySelector('[role="option"]'))?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  // Escape closes only this list (not a menu around it); arrows, Home and End move between branches.
  const onKeyDown = (event) => {
    if (!open) return;
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      return;
    }
    const options = [...(listRef.current?.querySelectorAll('[role="option"]') ?? [])];
    const at = options.indexOf(document.activeElement);
    const next = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: options.length - 1 }[event.key];
    if (next === undefined || options.length === 0) return;
    event.preventDefault();
    options[(next + options.length) % options.length].focus();
  };

  const active = branches.filter(isActive);
  const nameOf = (branch) => localized(branch, "name", language) || `#${branch.id}`;
  const current = active.find((b) => b.id === currentBranchId);
  // Until the list loads, show the saved name rather than "All branches".
  const label = current ? nameOf(current) : currentBranchId != null && currentBranchName ? currentBranchName : t("allBranches");
  const choose = (branch) => {
    setBranch(branch?.id ?? null, branch ? branch.name_en || branch.name_bn : null);
    close();
  };

  const buttonTone =
    tone === "dark" ? "border-white/30 text-white hover:bg-white/10" : "border-school-navy/30 text-school-navy hover:bg-school-navy/5";

  return (
    <div data-branch-selector className="relative inline-flex" onKeyDown={onKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("switchBranch")}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={t("switchBranch")}
        className={`inline-flex items-center gap-1.5 max-w-44 rounded-full border bg-transparent px-3 py-1 text-xs font-semibold cursor-pointer ${buttonTone}`}
      >
        <FiGitBranch aria-hidden="true" className="shrink-0" />
        <span className="truncate">{label}</span>
        <FiChevronDown aria-hidden="true" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={t("selectBranch")}
          className="absolute right-0 top-[calc(100%+6px)] z-[200] m-0 min-w-48 list-none overflow-hidden rounded-md border border-school-gold/40 bg-white p-0 shadow-lg"
        >
          <BranchOption selected={currentBranchId == null} label={t("allBranches")} onSelect={() => choose(null)} />
          {active.map((branch) => (
            <BranchOption key={branch.id} selected={branch.id === currentBranchId} label={nameOf(branch)} onSelect={() => choose(branch)} />
          ))}
        </ul>
      )}
    </div>
  );
}
