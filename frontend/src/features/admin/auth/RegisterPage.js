"use client";

import { useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiInfo } from "react-icons/fi";
import { authService } from "@/services/auth.service";
import { useTranslations } from "@/store/languageStore";
import AuthLayout from "./AuthLayout";
import {
  AccountTypePicker,
  AuthField,
  BRANCH_ADMIN,
  BranchSelect,
  FormError,
  PasswordInput,
  SUPER_ADMIN,
  errorMessage,
  inputClass,
  primaryButtonClass,
  useOpenBranches,
} from "./authFields";

const PASSWORD_MIN = 8; // same rule as the server (src/modules/admins/domain/admin.js)
const EMPTY_FORM = { Username: "", Email: "", Password: "", confirmPassword: "" };

export default function RegisterPage() {
  const [accountType, setAccountType] = useState(BRANCH_ADMIN);
  const [branchId, setBranchId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  const t = useTranslations("admin.register");
  const tAuth = useTranslations("admin.auth");
  const branchList = useOpenBranches();
  const isSuperAdmin = accountType === SUPER_ADMIN;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin && !branchId) {
      setError(tAuth("chooseBranch"));
      return;
    }
    if (form.Password !== form.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.register({
        Username: form.Username,
        Email: form.Email,
        Password: form.Password,
        role: accountType,
        branch_id: isSuperAdmin ? null : parseInt(branchId, 10),
      });
      setCreated(true);
    } catch (err) {
      setError(errorMessage(err, t("registrationFailed")));
    } finally {
      setLoading(false);
    }
  };

  const signInLink = (
    <>
      {t("haveAccount")}{" "}
      <Link href="/admin/login" className="font-semibold text-school-navy underline-offset-2 hover:underline">
        {t("signIn")}
      </Link>
    </>
  );

  if (created) {
    return (
      <AuthLayout title={t("title")}>
        <div role="status" className="text-center py-4">
          <FiCheckCircle aria-hidden="true" className="mx-auto mb-3 text-5xl text-emerald-600" />
          <p className="font-school-heading text-xl font-bold text-school-navy mb-1">{t("successTitle")}</p>
          <p className="text-sm text-school-muted mb-6">{t("successText")}</p>
          <Link href="/admin/login" className={`${primaryButtonClass} inline-flex items-center justify-center no-underline`}>
            {t("goToSignIn")}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t("title")} subtitle={t("subtitle")} footer={signInLink}>
      <p className="flex items-start gap-2 mb-5 rounded-lg bg-school-cream px-3.5 py-3 text-sm text-school-muted">
        <FiInfo aria-hidden="true" className="mt-0.5 shrink-0 text-school-navy" />
        <span>{t("setupNote")}</span>
      </p>
      <FormError>{error}</FormError>
      <form onSubmit={handleSubmit}>
        <AccountTypePicker legend={t("accountFor")} value={accountType} onChange={setAccountType} />
        {!isSuperAdmin && <BranchSelect {...branchList} value={branchId} onChange={setBranchId} />}
        <AuthField label={t("username")}>
          {(props) => (
            <input
              {...props}
              type="text"
              name="Username"
              autoComplete="name"
              placeholder={t("usernamePlaceholder")}
              maxLength={50}
              value={form.Username}
              onChange={handleChange}
              required
              className={inputClass}
            />
          )}
        </AuthField>
        <AuthField label={t("email")}>
          {(props) => (
            <input
              {...props}
              type="email"
              name="Email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              maxLength={100}
              value={form.Email}
              onChange={handleChange}
              required
              className={inputClass}
            />
          )}
        </AuthField>
        <AuthField label={t("password")} hint={t("passwordHint")}>
          {(props) => (
            <PasswordInput
              {...props}
              name="Password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN}
              value={form.Password}
              onChange={handleChange}
              required
            />
          )}
        </AuthField>
        <AuthField label={t("confirmPassword")}>
          {(props) => (
            <PasswordInput
              {...props}
              name="confirmPassword"
              autoComplete="new-password"
              minLength={PASSWORD_MIN}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          )}
        </AuthField>
        <button type="submit" disabled={loading} className={`${primaryButtonClass} mt-2`}>
          {loading ? t("registering") : t("registerBtn")}
        </button>
      </form>
    </AuthLayout>
  );
}
