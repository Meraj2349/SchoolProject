"use client";

import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  useAllNoticeAnnouncements,
  useCreateNoticeAnnouncement,
  useUpdateNoticeAnnouncement,
  useToggleNoticeAnnouncementPublish,
  useDeleteNoticeAnnouncement,
} from "@/hooks/useNoticeAnnouncements";
import { useTranslations } from "@/store/languageStore";

const CATEGORIES = ["Admission", "Exam", "Notice", "Event"];

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3000";

export default function AdminNoticeAnnouncementsPage() {
  const { data: items = [], isLoading } = useAllNoticeAnnouncements();
  const createItem = useCreateNoticeAnnouncement();
  const updateItem = useUpdateNoticeAnnouncement();
  const togglePublish = useToggleNoticeAnnouncementPublish();
  const deleteItem = useDeleteNoticeAnnouncement();
  const t = useTranslations("admin.noticeAnnouncements");
  const tCommon = useTranslations("common");

  const [titleBn, setTitleBn] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [imageFile, setImageFile] = useState(null);
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

  const resetForm = () => {
    setTitleBn("");
    setTitleEn("");
    setCategory("");
    setDate("");
    setIsPublished(true);
    setImageFile(null);
    setEditId(null);
  };

  const handleSave = async () => {
    if (!titleBn.trim() || !titleEn.trim() || !category || !date) {
      flash(t("requiredFields"), true);
      return;
    }
    if (!editId && !imageFile) {
      flash(t("imageRequired"), true);
      return;
    }

    const formData = new FormData();
    formData.append("title_bn", titleBn);
    formData.append("title_en", titleEn);
    formData.append("category", category);
    formData.append("date", date);
    formData.append("is_published", isPublished ? "true" : "false");
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editId) {
        await updateItem.mutateAsync({ id: editId, formData });
        flash(t("updated"));
      } else {
        await createItem.mutateAsync(formData);
        flash(t("created"));
      }
      resetForm();
    } catch (err) {
      flash(err?.response?.data?.error || err.message || t("operationFailed"), true);
    }
  };

  const handleEdit = (item) => {
    setTitleBn(item.title_bn);
    setTitleEn(item.title_en);
    setCategory(item.category);
    setDate(item.date ? item.date.split("T")[0] : "");
    setIsPublished(item.is_published === 1 || item.is_published === true);
    setImageFile(null);
    setEditId(item.id);
  };

  const handleTogglePublish = async (item) => {
    const newVal = !(item.is_published === 1 || item.is_published === true);
    try {
      await togglePublish.mutateAsync({ id: item.id, is_published: newVal });
      flash(t("publishToggled"));
    } catch (err) {
      flash(err?.response?.data?.error || err.message || t("operationFailed"), true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await deleteItem.mutateAsync(id);
      flash(t("deleted"));
    } catch (err) {
      flash(err?.response?.data?.error || err.message || t("deleteFailed"), true);
    }
  };

  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isBusy = createItem.isPending || updateItem.isPending;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 700 }}>
        {t("title")}
      </h1>

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#dcfce7", color: "#15803d", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem" }}>
          {success}
        </div>
      )}

      {/* Form */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1.25rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
          {editId ? t("editItem") : t("addItem")}
        </h2>

        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: "0.25rem", fontSize: "0.875rem" }}>
              {t("titleBn")}
            </label>
            <input
              type="text"
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              placeholder={t("titleBnPlaceholder")}
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: "0.25rem", fontSize: "0.875rem" }}>
              {t("titleEn")}
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder={t("titleEnPlaceholder")}
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                {t("category")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", boxSizing: "border-box" }}
              >
                <option value="">{t("selectCategory")}</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                {t("date")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 500, marginBottom: "0.25rem", fontSize: "0.875rem" }}>
              {t("image")} {editId ? t("imageOptional") : ""}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              style={{ fontSize: "0.875rem" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <label htmlFor="isPublished" style={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {t("isPublished")}
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleSave}
              disabled={isBusy}
              style={{
                padding: "0.5rem 1.25rem",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: isBusy ? "not-allowed" : "pointer",
                opacity: isBusy ? 0.7 : 1,
              }}
            >
              {isBusy ? t("saving") : editId ? t("updateItem") : t("addItem")}
            </button>
            {editId && (
              <button
                onClick={resetForm}
                style={{
                  padding: "0.5rem 1.25rem",
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {tCommon("cancel")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* List */}
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
        {t("allItems")}
      </h2>

      {isLoading ? (
        <div style={{ color: "#64748b" }}>{tCommon("loading")}</div>
      ) : items.length === 0 ? (
        <div style={{ color: "#64748b" }}>{t("noItems")}</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>#</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("image")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("titleBn")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("titleEn")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("category")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("date")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("published")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const published = item.is_published === 1 || item.is_published === true;
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "0.6rem 0.75rem" }}>{idx + 1}</td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      {item.image_url ? (
                        <img
                          src={`${SERVER_URL}${item.image_url}`}
                          alt="notice"
                          style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "4px" }}
                        />
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{tCommon("na")}</span>
                      )}
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem", maxWidth: "180px", wordBreak: "break-word" }}>
                      {item.title_bn}
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem", maxWidth: "180px", wordBreak: "break-word" }}>
                      {item.title_en}
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <span style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: "#eff6ff",
                        color: "#2563eb",
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                      {fmtDate(item.date)}
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem" }}>
                      <button
                        onClick={() => handleTogglePublish(item)}
                        style={{
                          padding: "0.2rem 0.6rem",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                          background: published ? "#dcfce7" : "#fee2e2",
                          color: published ? "#15803d" : "#b91c1c",
                        }}
                      >
                        {published ? t("published") : t("unpublished")}
                      </button>
                    </td>
                    <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.35rem 0.6rem",
                          cursor: "pointer",
                          marginRight: "0.4rem",
                        }}
                        title={tCommon("edit")}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          background: "#fef2f2",
                          color: "#dc2626",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.35rem 0.6rem",
                          cursor: "pointer",
                        }}
                        title={tCommon("delete")}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
