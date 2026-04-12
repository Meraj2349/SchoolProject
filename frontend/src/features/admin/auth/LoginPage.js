"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "@/store/languageStore";
import "@/styles/login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const t = useTranslations("admin.login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authService.login({
        Email: email,
        Password: password,
      });
      if (data.token) {
        setToken(data.token);
        router.replace("/admin/notices");
      } else {
        setError(data.message || t("loginFailed"));
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || t("somethingWrong"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>{t("title")}</h2>
        {error && (
          <div
            style={{
              color: "#dc2626",
              background: "#fef2f2",
              padding: "10px",
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">{t("email")}</label>
            <input
              type="email"
              id="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">{t("password")}</label>
            <input
              type="password"
              id="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? t("loggingIn") : t("loginBtn")}
          </button>
        </form>
        <div className="signup-link">
          <p>
            {t("noAccount")} <Link href="/admin/register">{t("signUp")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
