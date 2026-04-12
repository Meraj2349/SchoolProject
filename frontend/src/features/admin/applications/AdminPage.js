"use client";

import { useEffect, useState } from "react";
import { applicationService } from "@/services/application.service";
import { useTranslations, useLanguageStore } from "@/store/languageStore";
import "@/styles/AdminApplicationsPage.css";

const STATUSES = ["pending", "reviewed", "accepted", "rejected"];

function StatusBadge({ status, t }) {
  return (
    <span className={`status-badge status-${status}`}>
      {t(status)}
    </span>
  );
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState({ msg: "", error: false });
  const t = useTranslations("admin.applications");
  const tCommon = useTranslations("common");

  const showFlash = (msg, error = false) => {
    setFlash({ msg, error });
    setTimeout(() => setFlash({ msg: "", error: false }), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getAll();
      setApplications(res.data || []);
    } catch (err) {
      showFlash(err?.response?.data?.message || err.message || t("operationFailed"), true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await applicationService.updateStatus(id, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
      showFlash(t("statusUpdated"));
    } catch (err) {
      showFlash(err?.response?.data?.message || err.message || t("operationFailed"), true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await applicationService.remove(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
      showFlash(t("deleted"));
    } catch (err) {
      showFlash(err?.response?.data?.message || err.message || t("operationFailed"), true);
    }
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
    <div className="admin-applications-page">
      <h1>{t("title")}</h1>

      {flash.msg && (
        <div className={flash.error ? "flash-error" : "flash-success"}>
          {flash.msg}
        </div>
      )}

      {loading ? (
        <div className="apps-loading">{t("loading")}</div>
      ) : applications.length === 0 ? (
        <div className="apps-empty">{t("noApplications")}</div>
      ) : (
        <div className="applications-table-wrapper">
          <table className="applications-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("applicantName")}</th>
                <th>{t("applyingForClass")}</th>
                <th>{t("parentContact")}</th>
                <th>{t("status")}</th>
                <th>{t("date")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => (
                <tr key={app.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{app.applicant_name}</div>
                    <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {app.parent_name}
                    </div>
                  </td>
                  <td>{app.applying_for_class}</td>
                  <td>{app.parent_contact}</td>
                  <td>
                    <select
                      className="status-select"
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {fmtDate(app.created_at)}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <StatusBadge status={app.status} t={t} />
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(app.id)}
                    >
                      {tCommon("delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
