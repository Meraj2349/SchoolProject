"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useBranchStore } from "@/store/branchStore";
import { useLanguageStore, useTranslations } from "@/store/languageStore";
import AuthLayout from "./AuthLayout";
import {
  AccountTypePicker,
  AuthField,
  BRANCH_ADMIN,
  BranchSelect,
  FormError,
  PasswordInput,
  SUPER_ADMIN,
  branchName,
  errorMessage,
  inputClass,
  primaryButtonClass,
  useOpenBranches,
} from "./authFields";

export default function LoginPage() {
  const [accountType, setAccountType] = useState(BRANCH_ADMIN);
  const [branchId, setBranchId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { lockBranch, resetBranch } = useBranchStore();
  const language = useLanguageStore((s) => s.language);
  const t = useTranslations("admin.login");
  const tAuth = useTranslations("admin.auth");
  const branchList = useOpenBranches();
  const isSuperAdmin = accountType === SUPER_ADMIN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin && !branchId) {
      setError(tAuth("chooseBranch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await authService.login({
        Email: email,
        Password: password,
        branch_id: isSuperAdmin ? null : parseInt(branchId, 10),
      });
      if (!data.token) {
        setError(data.message || t("loginFailed"));
        return;
      }
      setAuth(data.token, data.role, data.branch_id ?? null);
      if (data.role === BRANCH_ADMIN && data.branch_id != null) {
        const chosen = branchList.branches.find((b) => String(b.id) === branchId);
        lockBranch(data.branch_id, data.branchName || branchName(chosen, language));
      } else {
        resetBranch();
      }
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(errorMessage(err, t("somethingWrong")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href="/admin/register" className="font-semibold text-school-navy underline-offset-2 hover:underline">
            {t("signUp")}
          </Link>
        </>
      }
    >
      <FormError>{error}</FormError>
      <form onSubmit={handleSubmit}>
        <AccountTypePicker legend={t("signInAs")} value={accountType} onChange={setAccountType} />
        {!isSuperAdmin && <BranchSelect {...branchList} value={branchId} onChange={setBranchId} />}
        <AuthField label={t("email")}>
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="username"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          )}
        </AuthField>
        <AuthField label={t("password")}>
          {(props) => (
            <PasswordInput
              {...props}
              autoComplete="current-password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
        </AuthField>
        <button type="submit" disabled={loading} className={`${primaryButtonClass} mt-2`}>
          {loading ? t("loggingIn") : t("loginBtn")}
        </button>
      </form>
    </AuthLayout>
  );
}
