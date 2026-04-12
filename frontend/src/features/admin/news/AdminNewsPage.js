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
    if (isErr) { setError(msg); setSuccess(null); }
    else { setSuccess(msg); setError(null); }
    setTimeout(() => { setError(null); setSuccess(null); }, 4000);
  };

  const resetForm = () => {
    setTitleBn(""); setTitleEn(""); setDate(""); setLink("/events"); setIsActive(true); setEditId(null);
  };

  const handleSave = async () => {
    if (!titleBn.trim() || !titleEn.trim() || !date) {
      flash(t("requiredFields"), true); return;
    }
    try {
      if (editId) {
        await updateNews.mutateAsync({ id: editId, data: { title_bn: titleBn, title_en: titleEn, date, link, is_active: isActive } });
        flash(t("newsUpdated"));
      } else {
        await createNews.mutateAsync({ title_bn: titleBn, title_en: titleEn, date, link, is_active: isActive });
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
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const isBusy = createNews.isPending || updateNews.isPending;

  const isItemActive = (item) => item.is_active === 1 || item.is_active === true;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          {editId ? t("editNews") : t("addNews")}
        </h2>
        <div className="grid gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("titleBn")}</label>
            <input
              type="text"
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              placeholder={t("titleBnPlaceholder")}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("titleEn")}</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder={t("titleEnPlaceholder")}
              className="form-input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t("date")}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t("link")}</label>
              <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/events" className="form-input" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-600">{t("isActive")}</label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={isBusy} className="btn-primary">
              {isBusy ? t("saving") : editId ? t("updateNews") : t("addNews")}
            </button>
            {editId && (
              <button onClick={resetForm} className="btn-secondary">{tCommon("cancel")}</button>
            )}
          </div>
        </div>
      </div>

      {/* News list */}
      <h2 className="text-base font-semibold text-gray-700 mb-3">{t("allNews")}</h2>

      {isLoading ? (
        <div className="text-gray-500">{tCommon("loading")}</div>
      ) : newsItems.length === 0 ? (
        <div className="text-gray-500">{t("noNews")}</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">#</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">{t("titleBn")}</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">{t("titleEn")}</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">{t("date")}</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">{t("status")}</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {newsItems.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-gray-600">{idx + 1}</td>
                    <td className="px-3 py-2.5 max-w-48 break-words text-gray-700">{item.title_bn}</td>
                    <td className="px-3 py-2.5 max-w-48 break-words text-gray-700">{item.title_en}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">{fmtDate(item.date)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${isItemActive(item) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {isItemActive(item) ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md border-none cursor-pointer hover:bg-blue-100 transition-colors mr-1"
                        title={tCommon("edit")}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded-md border-none cursor-pointer hover:bg-red-100 transition-colors"
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
        </div>
      )}
    </div>
  );
}
