"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import { useTranslations } from "@/store/languageStore";

export default function AdminPage() {
  const [form, setForm] = useState({ email: "", currentPassword: "", newPassword: "" });
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
      setStatus({ error: t("passwordMinLength"), success: "" });
      return;
    }
    setLoading(true);
    setStatus({ error: "", success: "" });
    try {
      await authService.updateEmailPassword(form);
      setStatus({ error: "", success: t("successMessage") });
      setForm({ email: "", currentPassword: "", newPassword: "" });
    } catch (err) {
      setStatus({ error: err.response?.data?.error || err.message || t("errorMessage"), success: "" });
    } finally {
      setLoading(false);
    }
  };

  const FIELDS = [
    ["email", t("email"), "email", t("emailPlaceholder")],
    ["currentPassword", t("currentPassword"), "password", t("currentPasswordPlaceholder")],
    ["newPassword", t("newPassword"), "password", t("newPasswordPlaceholder")],
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 max-w-lg">
        {FIELDS.map(([name, label, type, placeholder]) => (
          <div key={name} className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
              type={type}
              name={name}
              value={form[name]}
              onChange={handleChange}
              className="form-input"
              placeholder={placeholder}
              required
            />
          </div>
        ))}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t("updating") : t("update")}
        </button>
      </form>
    </div>
  );
}
