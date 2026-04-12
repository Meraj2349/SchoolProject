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
    if (isErr) { setError(msg); setSuccess(null); }
    else { setSuccess(msg); setError(null); }
    setTimeout(() => { setError(null); setSuccess(null); }, 4000);
  };

  const resetForm = () => {
    setTitleBn(""); setTitleEn(""); setCategory(""); setDate("");
    setIsPublished(true); setImageFile(null); setEditId(null);
  };

  const handleSave = async () => {
    if (!titleBn.trim() || !titleEn.trim() || !category || !date) {
      flash(t("requiredFields"), true); return;
    }
    if (!editId && !imageFile) {
      flash(t("imageRequired"), true); return;
    }
    const formData = new FormData();
    formData.append("title_bn", titleBn);
    formData.append("title_en", titleEn);
    formData.append("category", category);
    formData.append("date", date);
    formData.append("is_published", isPublished ? "true" : "false");
    if (imageFile) formData.append("image", imageFile);
    try {
      if (editId) { await updateItem.mutateAsync({ id: editId, formData }); flash(t("updated")); }
      else { await createItem.mutateAsync(formData); flash(t("created")); }
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

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

  const isBusy = createItem.isPending || updateItem.isPending;
  const isItemPublished = (item) => item.is_published === 1 || item.is_published === true;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          {editId ? t("editItem") : t("addItem")}
        </h2>
        <div className="grid gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("titleBn")}</label>
            <input type="text" value={titleBn} onChange={(e) => setTitleBn(e.target.value)} placeholder={t("titleBnPlaceholder")} className="form-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("titleEn")}</label>
            <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder={t("titleEnPlaceholder")} className="form-input" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t("category")}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                <option value="">{t("selectCategory")}</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">{t("date")}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t("image")} {editId ? t("imageOptional") : ""}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="block text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPublished" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 accent-blue-600" />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-600">{t("isPublished")}</label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={isBusy} className="btn-primary">
              {isBusy ? t("saving") : editId ? t("updateItem") : t("addItem")}
            </button>
            {editId && <button onClick={resetForm} className="btn-secondary">{tCommon("cancel")}</button>}
          </div>
        </div>
      </div>

      {/* List */}
      <h2 className="text-base font-semibold text-gray-700 mb-3">{t("allItems")}</h2>

      {isLoading ? (
        <div className="text-gray-500">{tCommon("loading")}</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">{t("noItems")}</div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-200">
                  {["#", t("image"), t("titleBn"), t("titleEn"), t("category"), t("date"), t("published"), t("actions")].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const published = isItemPublished(item);
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 text-gray-600">{idx + 1}</td>
                      <td className="px-3 py-2.5">
                        {item.image_url ? (
                          <img src={`${SERVER_URL}${item.image_url}`} alt="notice" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <span className="text-gray-400 text-xs">{tCommon("na")}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 max-w-44 break-words text-gray-700">{item.title_bn}</td>
                      <td className="px-3 py-2.5 max-w-44 break-words text-gray-700">{item.title_en}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{item.category}</span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-gray-600">{fmtDate(item.date)}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border-none cursor-pointer transition-colors ${published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                        >
                          {published ? t("published") : t("unpublished")}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <button onClick={() => handleEdit(item)} className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-md border-none cursor-pointer hover:bg-blue-100 transition-colors mr-1" title={tCommon("edit")}>
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="inline-flex items-center justify-center w-8 h-8 bg-red-50 text-red-600 rounded-md border-none cursor-pointer hover:bg-red-100 transition-colors" title={tCommon("delete")}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
