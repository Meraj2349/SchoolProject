"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiBell, FiPlusCircle } from "react-icons/fi";
import {
  useNotices,
  useCreateNotice,
  useUpdateNotice,
  useDeleteNotice,
} from "@/hooks/useNotices";
import { useTranslations } from "@/store/languageStore";

export default function AdminNoticesPage() {
  const { data: notices = [], isLoading } = useNotices();
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const deleteNotice = useDeleteNotice();
  const t = useTranslations("admin.notices");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const flash = (msg, isErr = false) => {
    if (isErr) {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 4000);
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      flash(t("titleAndDescRequired"), true);
      return;
    }
    try {
      if (editId) {
        await updateNotice.mutateAsync({
          id: editId,
          data: { Title: title, Description: description },
        });
        flash(t("noticeUpdated"));
        setEditId(null);
      } else {
        await createNotice.mutateAsync({
          Title: title,
          Description: description,
          Show: true,
        });
        flash(t("noticeAdded"));
      }
      setTitle("");
      setDescription("");
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const handleEdit = (notice) => {
    setTitle(notice.Title);
    setDescription(notice.Description);
    setEditId(notice.NoticeID);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteNotice"))) return;
    try {
      await deleteNotice.mutateAsync(id);
      flash(t("noticeDeleted"));
    } catch (err) {
      flash(err.message || t("deleteFailed"), true);
    }
  };

  const handleToggleShow = async (notice) => {
    try {
      await updateNotice.mutateAsync({
        id: notice.NoticeID,
        data: { Show: !notice.Show },
      });
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create and manage school notices
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiPlusCircle className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {editId ? t("editNotice") : t("addNewNotice")}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {t("titleLabel")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("titlePlaceholder")}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {t("descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={4}
              className="form-input"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={createNotice.isPending || updateNotice.isPending}
            >
              {editId ? t("updateNotice") : t("addNotice")}
            </button>
            {editId && (
              <button
                onClick={() => {
                  setEditId(null);
                  setTitle("");
                  setDescription("");
                }}
                className="btn-secondary"
              >
                {t("cancel")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiBell className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allNotices")}
            </h2>
            <p className="text-xs text-slate-400">
              {notices.length} total notices
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="table-header">{t("titleLabel")}</th>
                  <th className="table-header">{t("descriptionLabel")}</th>
                  <th className="table-header">{t("show")}</th>
                  <th className="table-header">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n, i) => (
                  <tr
                    key={n.NoticeID}
                    className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="table-cell font-semibold text-slate-800">
                      {n.Title}
                    </td>
                    <td className="table-cell max-w-xs truncate text-slate-600">
                      {n.Description}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleToggleShow(n)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer ${n.Show === 1 || n.Show === true ? "bg-indigo-600" : "bg-slate-300"}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${n.Show === 1 || n.Show === true ? "translate-x-4.5" : "translate-x-0.5"}`}
                        />
                      </button>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(n)}
                          className="btn-icon edit"
                          title={t("editNotice")}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(n.NoticeID)}
                          className="btn-icon delete"
                          title={t("deleteNotice")}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
