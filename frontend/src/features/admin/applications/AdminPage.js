"use client";

import { useEffect, useState } from "react";
import { applicationService } from "@/services/application.service";
import { useTranslations } from "@/store/languageStore";

const STATUSES = ["pending", "reviewed", "accepted", "rejected"];

const STATUS_STYLES = {
  pending:  "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function StatusBadge({ status, t }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
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

  useEffect(() => { fetchAll(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await applicationService.updateStatus(id, newStatus);
      setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app)));
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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      {flash.msg && (
        <div className={flash.error ? "error-message" : "success-message"}>{flash.msg}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">{t("loading")}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">{t("noApplications")}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">{t("applicantName")}</th>
                  <th className="table-header">{t("applyingForClass")}</th>
                  <th className="table-header">{t("parentContact")}</th>
                  <th className="table-header">{t("status")}</th>
                  <th className="table-header">{t("date")}</th>
                  <th className="table-header">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, idx) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">{idx + 1}</td>
                    <td className="table-cell">
                      <div className="font-semibold text-gray-800">{app.applicant_name}</div>
                      <div className="text-xs text-slate-500">{app.parent_name}</div>
                    </td>
                    <td className="table-cell">{app.applying_for_class}</td>
                    <td className="table-cell">{app.parent_contact}</td>
                    <td className="table-cell">
                      <select
                        className="status-select"
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{t(s)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell whitespace-nowrap">{fmtDate(app.created_at)}</td>
                    <td className="table-cell whitespace-nowrap">
                      <StatusBadge status={app.status} t={t} />
                      <button className="btn-delete" onClick={() => handleDelete(app.id)}>
                        {tCommon("delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
