"use client";

import { useEffect, useState } from "react";
import { FiCheck, FiChevronDown, FiGitBranch } from "react-icons/fi";
import { useBranches } from "@/hooks/useBranches";
import useEscapeKey from "@/hooks/useEscapeKey";
import { localized } from "@/lib/homePage";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const isActive = (branch) => !(branch.is_proposed === true || branch.is_proposed === 1);

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
  useEscapeKey(open, () => setOpen(false));

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (!event.target.closest?.("[data-branch-selector]")) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const active = branches.filter(isActive);
  const nameOf = (branch) => localized(branch, "name", language) || `#${branch.id}`;
  const current = active.find((b) => b.id === currentBranchId);
  // Until the list loads, show the saved name rather than "All branches".
  const label = current ? nameOf(current) : currentBranchId != null && currentBranchName ? currentBranchName : t("allBranches");
  const choose = (branch) => {
    setBranch(branch?.id ?? null, branch ? branch.name_en || branch.name_bn : null);
    setOpen(false);
  };

  const buttonTone =
    tone === "dark" ? "border-white/30 text-white hover:bg-white/10" : "border-school-navy/30 text-school-navy hover:bg-school-navy/5";
  const option = (selected, label, onClick, key) => (
    <li key={key}>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onClick}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm border-none cursor-pointer ${
          selected ? "bg-school-cream font-semibold text-school-navy" : "bg-white text-school-ink hover:bg-school-cream"
        }`}
      >
        <span className="flex-1">{label}</span>
        {selected && <FiCheck aria-hidden="true" className="text-school-gold" />}
      </button>
    </li>
  );

  return (
    <div data-branch-selector className="relative inline-flex">
      <button
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
          role="listbox"
          aria-label={t("selectBranch")}
          className="absolute right-0 top-[calc(100%+6px)] z-[200] m-0 min-w-48 list-none overflow-hidden rounded-md border border-school-gold/40 bg-white p-0 shadow-lg"
        >
          {option(currentBranchId == null, t("allBranches"), () => choose(null), "all")}
          {active.map((branch) => option(branch.id === currentBranchId, nameOf(branch), () => choose(branch), branch.id))}
        </ul>
      )}
    </div>
  );
}
