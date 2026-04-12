"use client";

import Image from "next/image";
import { useState } from "react";
import {
  useAllNoticeAnnouncements,
  useCreateNoticeAnnouncement,
  useUpdateNoticeAnnouncement,
  useToggleNoticeAnnouncementPublish,
  useDeleteNoticeAnnouncement,
} from "@/hooks/useNoticeAnnouncements";
import { useTranslations } from "@/store/languageStore";
import { FiEdit2, FiTrash2, FiPlusCircle, FiList } from "react-icons/fi";

const CATEGORIES = ["Admission", "Exam", "Notice", "Event"];
const SERVER_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:3000";

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
    if (imageFile) formData.append("image", imageFile);
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
      flash(
        err?.response?.data?.error || err.message || t("operationFailed"),
        true,
      );
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
      flash(
        err?.response?.data?.error || err.message || t("operationFailed"),
        true,
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await deleteItem.mutateAsync(id);
      flash(t("deleted"));
    } catch (err) {
      flash(
        err?.response?.data?.error || err.message || t("deleteFailed"),
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

  const isBusy = createItem.isPending || updateItem.isPending;
  const isItemPublished = (item) =>
    item.is_published === 1 || item.is_published === true;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage notice announcements and publications
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
            {editId ? t("editItem") : t("addItem")}
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
                {t("category")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              >
                <option value="">{t("selectCategory")}</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
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
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              {t("image")} {editId ? t("imageOptional") : ""}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-indigo-600"
            />
            {t("isPublished")}
          </label>
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              disabled={isBusy}
              className="btn-primary"
            >
              {isBusy ? t("saving") : editId ? t("updateItem") : t("addItem")}
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
            <FiList className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allItems")}
            </h2>
            <p className="text-xs text-slate-400">{items.length} items</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {tCommon("loading")}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <FiList className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">{t("noItems")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {[
                    "#",
                    t("image"),
                    t("titleBn"),
                    t("titleEn"),
                    t("category"),
                    t("date"),
                    t("published"),
                    t("actions"),
                  ].map((h) => (
                    <th key={h} className="table-header">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const published = isItemPublished(item);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-indigo-50/30 transition-colors ${idx % 2 === 0 ? "" : "bg-slate-50/50"}`}
                    >
                      <td className="table-cell text-slate-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="table-cell">
                        {item.image_url ? (
                          <Image
                            src={`${SERVER_URL}${item.image_url}`}
                            alt="notice"
                            width={48}
                            height={48}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-slate-400 text-xs">
                            {tCommon("na")}
                          </span>
                        )}
                      </td>
                      <td className="table-cell max-w-44 wrap-break-word text-slate-700">
                        {item.title_bn}
                      </td>
                      <td className="table-cell max-w-44 wrap-break-word text-slate-700">
                        {item.title_en}
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="table-cell whitespace-nowrap text-slate-600">
                        {fmtDate(item.date)}
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border-none cursor-pointer transition-colors ${published ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                        >
                          {published ? t("published") : t("unpublished")}
                        </button>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
