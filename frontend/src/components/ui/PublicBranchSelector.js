"use client";

import { useEffect, useState } from "react";
import { useBranchStore } from "@/store/branchStore";
import { branchService } from "@/services/branch.service";
import { useTranslations } from "@/store/languageStore";
import { FiGitBranch, FiChevronDown } from "react-icons/fi";

/**
 * PublicBranchSelector — lets any public visitor narrow the view to a specific
 * branch.  Reads/writes the same `useBranchStore` that every data hook uses, so
 * switching the branch here automatically re-fetches teachers, classes, events,
 * and every other branch-scoped query on the page.
 *
 * Renders as a compact pill in the Navbar's main navigation bar.
 */
export default function PublicBranchSelector() {
  const { currentBranchId, currentBranchName, setBranch } = useBranchStore();
  const [branches, setBranches] = useState([]);
  const [open, setOpen] = useState(false);
  const t = useTranslations("branchSelector");

  useEffect(() => {
    branchService
      .getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        // Only show active branches to public visitors
        setBranches(list.filter((b) => !b.is_proposed && b.is_proposed !== 1));
      })
      .catch(() => setBranches([]));
  }, []);

  const handleSelect = (branchId, branchName) => {
    setBranch(branchId, branchName);
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!e.target.closest("[data-branch-selector]")) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayName = currentBranchId ? currentBranchName : t("allBranches");

  return (
    <div
      data-branch-selector
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        title={t("switchBranch")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 20,
          border: currentBranchId
            ? "1.5px solid #10b981"
            : "1.5px solid #d1d5db",
          background: currentBranchId
            ? "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)"
            : "#f9fafb",
          color: currentBranchId ? "#065f46" : "#6b7280",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.2s ease",
          maxWidth: 160,
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#10b981";
          e.currentTarget.style.background =
            "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)";
          e.currentTarget.style.color = "#065f46";
        }}
        onMouseLeave={(e) => {
          if (!currentBranchId) {
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.color = "#6b7280";
          }
        }}
        aria-label={t("switchBranch")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <FiGitBranch style={{ flexShrink: 0, fontSize: 13 }} />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 100,
          }}
        >
          {displayName}
        </span>
        <FiChevronDown
          style={{
            flexShrink: 0,
            fontSize: 12,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("selectBranch")}
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 180,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            zIndex: 9999,
            overflow: "hidden",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {/* "All Branches" option */}
          <button
            role="option"
            aria-selected={currentBranchId === null}
            onClick={() => handleSelect(null, "All Branches")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "10px 14px",
              border: "none",
              background: currentBranchId === null ? "#ecfdf5" : "transparent",
              color: currentBranchId === null ? "#065f46" : "#374151",
              fontSize: 13,
              fontWeight: currentBranchId === null ? 600 : 400,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s",
              borderBottom: "1px solid #f3f4f6",
            }}
            onMouseEnter={(e) => {
              if (currentBranchId !== null)
                e.currentTarget.style.background = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              if (currentBranchId !== null)
                e.currentTarget.style.background = "transparent";
            }}
          >
            <FiGitBranch style={{ fontSize: 13, color: "#9ca3af" }} />
            {t("allBranches")}
            {currentBranchId === null && (
              <span
                style={{ marginLeft: "auto", color: "#10b981", fontSize: 12 }}
              >
                ✓
              </span>
            )}
          </button>

          {/* Individual branch options */}
          {branches.map((b) => {
            const name = b.name_en || b.name_bn || `Branch ${b.id}`;
            const isSelected = currentBranchId === b.id;
            return (
              <button
                key={b.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(b.id, name)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "10px 14px",
                  border: "none",
                  background: isSelected ? "#ecfdf5" : "transparent",
                  color: isSelected ? "#065f46" : "#374151",
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                  borderBottom: "1px solid #f3f4f6",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#10b981",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </span>
                {isSelected && (
                  <span
                    style={{
                      marginLeft: "auto",
                      color: "#10b981",
                      fontSize: 12,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
