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
import "@/styles/NoticesPage.css";

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
    <div className="notices-page">
      <h1 className="notices-title">{t("title")}</h1>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      <div className="notices-form">
        <h2>{editId ? t("editNotice") : t("addNewNotice")}</h2>
        <div className="form-group">
          <label>{t("titleLabel")}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>{t("descriptionLabel")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={4}
            className="form-input"
          />
        </div>
        <div className="form-actions">
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

      <div className="notices-list">
        <h2>
          {t("allNotices")} ({notices.length})
        </h2>
        {isLoading ? (
          <p>{t("allNotices")}…</p>
        ) : (
          <table className="notices-table">
            <thead>
              <tr>
                <th>{t("titleLabel")}</th>
                <th>{t("descriptionLabel")}</th>
                <th>{t("show")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n) => (
                <tr key={n.NoticeID}>
                  <td>{n.Title}</td>
                  <td>{n.Description}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={n.Show === 1 || n.Show === true}
                      onChange={() => handleToggleShow(n)}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(n)}
                      className="btn-icon edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(n.NoticeID)}
                      className="btn-icon delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
