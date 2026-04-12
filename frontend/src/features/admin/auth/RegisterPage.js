"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useTranslations } from "@/store/languageStore";
import "@/styles/login.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    Email: "",
    Password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("admin.register");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.Password !== form.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authService.register({
        Email: form.Email,
        Password: form.Password,
      });
      alert(t("registrationSuccess"));
      router.replace("/admin/login");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || t("registrationFailed"),
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
            <label>{t("email")}</label>
            <input
              type="email"
              name="Email"
              value={form.Email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>{t("password")}</label>
            <input
              type="password"
              name="Password"
              value={form.Password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="input-group">
            <label>{t("confirmPassword")}</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? t("registering") : t("registerBtn")}
          </button>
        </form>
        <div className="signup-link">
          <p>
            {t("haveAccount")} <Link href="/admin/login">{t("signIn")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
