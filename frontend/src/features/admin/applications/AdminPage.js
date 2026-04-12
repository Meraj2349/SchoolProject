"use client";

import { useEffect, useState } from "react";
import { applicationService } from "@/services/application.service";
import { useTranslations } from "@/store/languageStore";
import { FiClipboard, FiTrash2 } from "react-icons/fi";

const STATUSES = ["pending", "reviewed", "accepted", "rejected"];

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function StatusBadge({ status, t }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}
    >
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

  useEffect(() => {
    setLoading(true);
    applicationService.getAll()
      .then((res) => setApplications(res.data || []))
      .catch((err) =>
        showFlash(
          err?.response?.data?.message || err.message || "Operation failed",
          true,
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await applicationService.updateStatus(id, newStatus);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app,
        ),
      );
      showFlash(t("statusUpdated"));
    } catch (err) {
      showFlash(
        err?.response?.data?.message || err.message || t("operationFailed"),
        true,
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await applicationService.remove(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
      showFlash(t("deleted"));
    } catch (err) {
      showFlash(
        err?.response?.data?.message || err.message || t("operationFailed"),
        true,
      );
    }
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review and manage admission applications
        </p>
      </div>

      {flash.msg && (
        <div className={flash.error ? "error-message" : "success-message"}>
          {flash.msg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
          {t("loading")}
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">
          <FiClipboard className="text-4xl mb-3 opacity-30" />
          <p className="text-sm">{t("noApplications")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <FiClipboard className="text-slate-600 text-sm" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                All Applications
              </h2>
              <p className="text-xs text-slate-400">
                {applications.length} total applications
              </p>
            </div>
          </div>
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
                  <tr
                    key={app.id}
                    className={`hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="table-cell text-slate-400 text-xs">
                      {idx + 1}
                    </td>
                    <td className="table-cell">
                      <div className="font-semibold text-slate-800">
                        {app.applicant_name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {app.parent_name}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        {app.applying_for_class}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600">
                      {app.parent_contact}
                    </td>
                    <td className="table-cell">
                      <select
                        className="status-select"
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value)
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {t(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell text-slate-600 whitespace-nowrap">
                      {fmtDate(app.created_at)}
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={app.status} t={t} />
                        <button
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border-none cursor-pointer transition-all hover:scale-105"
                          onClick={() => handleDelete(app.id)}
                          title={tCommon("delete")}
                        >
                          <FiTrash2 className="text-xs" />
                        </button>
                      </div>
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
