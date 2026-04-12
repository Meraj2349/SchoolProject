"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import { useTranslations } from "@/store/languageStore";
import "@/styles/UpdateEmailPasswordPage.css";

export default function AdminPage() {
  const [form, setForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);
  const t = useTranslations("admin.settings");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      setStatus({
        error: t("passwordMinLength"),
        success: "",
      });
      return;
    }
    setLoading(true);
    setStatus({ error: "", success: "" });
    try {
      await authService.updateEmailPassword(form);
      setStatus({ error: "", success: t("successMessage") });
      setForm({ email: "", currentPassword: "", newPassword: "" });
    } catch (err) {
      setStatus({
        error: err.response?.data?.error || err.message || t("errorMessage"),
        success: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-email-password-page">
      <h1>{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: 32,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          maxWidth: 480,
        }}
      >
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>
            {t("email")}
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="form-input"
            style={{ width: "100%" }}
            placeholder={t("emailPlaceholder")}
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>
            {t("currentPassword")}
          </label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="form-input"
            style={{ width: "100%" }}
            placeholder={t("currentPasswordPlaceholder")}
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>
            {t("newPassword")}
          </label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="form-input"
            style={{ width: "100%" }}
            placeholder={t("newPasswordPlaceholder")}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t("updating") : t("update")}
        </button>
      </form>
    </div>
  );
}
