"use client";

import { useState } from "react";
import {
  useAllNews,
  useCreateNews,
  useUpdateNews,
  useDeleteNews,
} from "@/hooks/useNews";
import { useTranslations } from "@/store/languageStore";
import { FiEdit2, FiTrash2, FiFileText, FiPlusCircle } from "react-icons/fi";

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
          data: {
            title_bn: titleBn,
            title_en: titleEn,
            date,
            link,
            is_active: isActive,
          },
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
      flash(
        err?.response?.data?.error || err.message || t("operationFailed"),
        true,
      );
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
      flash(
        err?.response?.data?.error || err.message || t("deleteFailed"),
        true,
      );
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

  const isItemActive = (item) =>
    item.is_active === 1 || item.is_active === true;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage school news and announcements
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
            {editId ? t("editNews") : t("addNews")}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {t("titleBn")}
            </label>
            <input
              type="text"
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              placeholder={t("titleBnPlaceholder")}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {t("titleEn")}
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder={t("titleEnPlaceholder")}
              className="form-input"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("date")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("link")}
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/events"
                className="form-input"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            {t("isActive")}
          </label>
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={isBusy}
              className="btn-primary"
            >
              {isBusy ? t("saving") : editId ? t("updateNews") : t("addNews")}
            </button>
            {editId && (
              <button onClick={resetForm} className="btn-secondary">
                {tCommon("cancel")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiFileText className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allNews")}
            </h2>
            <p className="text-xs text-slate-400">{newsItems.length} items</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {tCommon("loading")}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <FiFileText className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">{t("noNews")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">{t("titleBn")}</th>
                  <th className="table-header">{t("titleEn")}</th>
                  <th className="table-header">{t("date")}</th>
                  <th className="table-header">{t("status")}</th>
                  <th className="table-header">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {newsItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="table-cell text-slate-400 text-xs">
                      {idx + 1}
                    </td>
                    <td className="table-cell max-w-44 wrap-break-word text-slate-700">
                      {item.title_bn}
                    </td>
                    <td className="table-cell max-w-44 wrap-break-word text-slate-700">
                      {item.title_en}
                    </td>
                    <td className="table-cell whitespace-nowrap text-slate-600">
                      {fmtDate(item.date)}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isItemActive(item) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                      >
                        {isItemActive(item) ? t("active") : t("inactive")}
                      </span>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn-icon edit"
                          title={tCommon("edit")}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn-icon delete"
                          title={tCommon("delete")}
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
