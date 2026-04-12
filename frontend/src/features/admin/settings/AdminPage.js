"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import "@/styles/UpdateEmailPasswordPage.css";

export default function AdminPage() {
  const [form, setForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 8) {
      setStatus({
        error: "New password must be at least 8 characters",
        success: "",
      });
      return;
    }
    setLoading(true);
    setStatus({ error: "", success: "" });
    try {
      await authService.updateEmailPassword(form);
      setStatus({ error: "", success: "Credentials updated successfully!" });
      setForm({ email: "", currentPassword: "", newPassword: "" });
    } catch (err) {
      setStatus({
        error: err.response?.data?.error || err.message || "Update failed",
        success: "",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-email-password-page">
      <h1>Update Email & Password</h1>
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
            New Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="form-input"
            style={{ width: "100%" }}
            placeholder="Enter new email"
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            className="form-input"
            style={{ width: "100%" }}
            placeholder="Enter current password"
            required
          />
        </div>
        <div className="form-group" style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: 500, display: "block", marginBottom: 6 }}>
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            className="form-input"
            style={{ width: "100%" }}
            placeholder="Enter new password (min 8 chars)"
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Updating…" : "Update Credentials"}
        </button>
      </form>
    </div>
  );
}
