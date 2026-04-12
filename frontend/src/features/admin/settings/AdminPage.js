"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import { useTranslations } from "@/store/languageStore";
import { FiLock } from "react-icons/fi";

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
      setStatus({
        error: err.response?.data?.error || err.message || t("errorMessage"),
        success: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const FIELDS = [
    ["email", t("email"), "email", t("emailPlaceholder")],
    [
      "currentPassword",
      t("currentPassword"),
      "password",
      t("currentPasswordPlaceholder"),
    ],
    ["newPassword", t("newPassword"), "password", t("newPasswordPlaceholder")],
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your admin account credentials
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiLock className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            Change Credentials
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {FIELDS.map(([name, label, type, placeholder]) => (
            <div key={name}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {label}
              </label>
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
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t("updating") : t("update")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
