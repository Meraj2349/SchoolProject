"use client";

import { useEffect, useId, useState } from "react";
import axios from "axios";
import { FiAlertCircle, FiEye, FiEyeOff, FiGitBranch, FiShield } from "react-icons/fi";
import { useLanguageStore, useTranslations } from "@/store/languageStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export const BRANCH_ADMIN = "branch_admin";
export const SUPER_ADMIN = "super_admin";

export const inputClass =
  "w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-school-ink text-base placeholder-slate-400 transition-colors " +
  "focus:outline-none focus:border-school-navy focus:ring-2 focus:ring-school-gold/50 disabled:bg-slate-50 disabled:text-slate-400";

export const primaryButtonClass =
  "w-full h-11 rounded-lg bg-school-navy text-white font-semibold text-base cursor-pointer transition-colors " +
  "hover:bg-school-navy-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-school-gold focus-visible:ring-offset-2 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

/**
 * Open branches for the sign-in pages. Uses axios directly so no stored
 * branch or token is attached (the user is not signed in yet).
 */
export function useOpenBranches() {
  const [state, setState] = useState({ branches: [], loading: true, failed: false });
  useEffect(() => {
    let active = true;
    axios
      .get(`${BASE_URL}/branches`)
      .then((r) => {
        const list = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
        if (active) setState({ branches: list.filter((b) => !b.is_proposed), loading: false, failed: false });
      })
      .catch(() => active && setState({ branches: [], loading: false, failed: true }));
    return () => {
      active = false;
    };
  }, []);
  return state;
}

export function branchName(branch, language) {
  if (!branch) return "";
  return (language === "bn" ? branch.name_bn || branch.name_en : branch.name_en || branch.name_bn) || `Branch ${branch.id}`;
}

/** Labelled control with optional hint, like the admin Field but for the sign-in card. */
export function AuthField({ label, hint, children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-school-ink mb-1.5">
        {label}
      </label>
      {children({ id, "aria-describedby": hintId })}
      {hint && (
        <p id={hintId} className="text-xs text-school-muted mt-1.5 mb-0">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Branch admin / super admin choice as two radio cards. */
export function AccountTypePicker({ legend, value, onChange }) {
  const t = useTranslations("admin.auth");
  const name = useId();
  const options = [
    { value: BRANCH_ADMIN, icon: FiGitBranch, title: t("branchAdmin"), hint: t("branchAdminHint") },
    { value: SUPER_ADMIN, icon: FiShield, title: t("superAdmin"), hint: t("superAdminHint") },
  ];
  return (
    <fieldset className="mb-5 border-0 p-0 m-0 min-w-0">
      <legend className="block text-sm font-semibold text-school-ink mb-1.5 p-0">{legend}</legend>
      <div className="grid grid-cols-2 gap-2.5">
        {options.map(({ value: optionValue, icon: Icon, title, hint }) => (
          <label key={optionValue} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
              className="peer sr-only"
            />
            <span
              className="flex h-full flex-col gap-1 rounded-lg border-2 border-slate-200 bg-white p-3 transition-colors
                         hover:border-slate-300 peer-checked:border-school-navy peer-checked:bg-school-cream
                         peer-focus-visible:ring-2 peer-focus-visible:ring-school-gold peer-focus-visible:ring-offset-2"
            >
              <span className="flex items-center gap-2 font-semibold text-school-navy text-sm">
                <Icon aria-hidden="true" className="shrink-0" />
                {title}
              </span>
              <span className="text-xs text-school-muted">{hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Branch dropdown with loading and failure states. */
export function BranchSelect({ branches, loading, failed, value, onChange }) {
  const t = useTranslations("admin.auth");
  const language = useLanguageStore((s) => s.language);
  return (
    <AuthField label={t("branch")} hint={failed ? t("branchesFailed") : undefined}>
      {(props) => (
        <select
          {...props}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={loading || failed}
          aria-invalid={failed || undefined}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" disabled>
            {loading ? t("loadingBranches") : t("branchPlaceholder")}
          </option>
          {branches.map((b) => (
            <option key={b.id} value={String(b.id)}>
              {branchName(b, language)}
            </option>
          ))}
        </select>
      )}
    </AuthField>
  );
}

/** Password input with a show/hide toggle. Pass the AuthField render props through. */
export function PasswordInput(props) {
  const t = useTranslations("admin.auth");
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${inputClass} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 w-11 flex items-center justify-center bg-transparent border-0 cursor-pointer
                   text-school-muted hover:text-school-navy rounded-r-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-school-gold"
      >
        {visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
      </button>
    </div>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-2 mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
      <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/** The server's message for a failed request, or a fallback. */
export const errorMessage = (err, fallback) => err?.response?.data?.error || err?.response?.data?.message || fallback;
