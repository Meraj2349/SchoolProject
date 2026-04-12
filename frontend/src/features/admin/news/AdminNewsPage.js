"use client";

import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  useAllNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
} from "@/hooks/useNews";
import { useTranslations } from "@/store/languageStore";

export default function AdminNewsPage() {
  const { data: newsItems = [], isLoading } = useAllNews();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();
  const t = useTranslations("admin.news");
  const tCommon = useTranslations("common");

  const [titleBn, setTitleBn] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [date, setDate] = useState("");
  const [link, setLink] = useState("/events");
  const [isActive, setIsActive] = useState(true);
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
    setDate("");
    setLink("/events");
    setIsActive(true);
    setEditId(null);
  };

  const handleSave = async () => {
    if (!titleBn.trim() || !titleEn.trim() || !date) {
      flash(t("requiredFields"), true);
      return;
    }
    try {
      if (editId) {
        await updateNews.mutateAsync({
          id: editId,
          data: { title_bn: titleBn, title_en: titleEn, date, link, is_active: isActive },
        });
        flash(t("newsUpdated"));
      } else {
        await createNews.mutateAsync({
          title_bn: titleBn,
          title_en: titleEn,
          date,
          link,
          is_active: isActive,
        });
        flash(t("newsAdded"));
      }
      resetForm();
    } catch (err) {
      flash(err?.response?.data?.error || err.message || t("operationFailed"), true);
    }
  };

  const handleEdit = (item) => {
    setTitleBn(item.title_bn);
    setTitleEn(item.title_en);
    setDate(item.date ? item.date.split("T")[0] : "");
    setLink(item.link || "/events");
    setIsActive(item.is_active === 1 || item.is_active === true);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await deleteNews.mutateAsync(id);
      flash(t("newsDeleted"));
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

  const isBusy = createNews.isPending || updateNews.isPending;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
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
          {editId ? t("editNews") : t("addNews")}
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
                {t("date")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 500, marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                {t("link")}
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/events"
                style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <label htmlFor="isActive" style={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {t("isActive")}
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
              {isBusy ? t("saving") : editId ? t("updateNews") : t("addNews")}
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

      {/* News list */}
      <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
        {t("allNews")}
      </h2>

      {isLoading ? (
        <div style={{ color: "#64748b" }}>{tCommon("loading")}</div>
      ) : newsItems.length === 0 ? (
        <div style={{ color: "#64748b" }}>{t("noNews")}</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>#</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("titleBn")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("titleEn")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("date")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("status")}</th>
                <th style={{ padding: "0.6rem 0.75rem", textAlign: "left" }}>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {newsItems.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.6rem 0.75rem" }}>{idx + 1}</td>
                  <td style={{ padding: "0.6rem 0.75rem", maxWidth: "200px", wordBreak: "break-word" }}>
                    {item.title_bn}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", maxWidth: "200px", wordBreak: "break-word" }}>
                    {item.title_en}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", whiteSpace: "nowrap" }}>
                    {fmtDate(item.date)}
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: (item.is_active === 1 || item.is_active === true) ? "#dcfce7" : "#fee2e2",
                        color: (item.is_active === 1 || item.is_active === true) ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {(item.is_active === 1 || item.is_active === true) ? t("active") : t("inactive")}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
