"use client";

import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editId ? t("editNotice") : t("addNewNotice")}
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
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
        <div className="flex gap-2">
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

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">
            {t("allNotices")} ({notices.length})
          </h2>
        </div>
        {isLoading ? (
          <p className="p-6 text-gray-500">{t("allNotices")}…</p>
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
                {notices.map((n) => (
                  <tr key={n.NoticeID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{n.Title}</td>
                    <td className="table-cell max-w-xs truncate">{n.Description}</td>
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={n.Show === 1 || n.Show === true}
                        onChange={() => handleToggleShow(n)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleEdit(n)}
                        className="btn-icon edit"
                        title={t("editNotice")}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(n.NoticeID)}
                        className="btn-icon delete"
                        title={t("deleteNotice")}
                      >
                        <FaTrash />
                      </button>
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
