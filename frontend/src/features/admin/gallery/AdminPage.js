"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { useImages, useUploadImage, useDeleteImage } from "@/hooks/useImages";
import { useTranslations } from "@/store/languageStore";
import { FiImage, FiUploadCloud, FiTrash2 } from "react-icons/fi";

const TYPES = ["general", "school", "student", "teacher", "event", "notice"];

export default function AdminPage() {
  const { data: images = [], isLoading } = useImages();
  const upload = useUploadImage();
  const remove = useDeleteImage();
  const fileRef = useRef();
  const t = useTranslations("admin.gallery");
  const tCommon = useTranslations("common");

  const [form, setForm] = useState({
    description: "",
    imageType: "general",
    studentId: "",
    teacherId: "",
  });
  const [status, setStatus] = useState({ error: null, success: null });

  const flash = (msg, isErr = false) => {
    setStatus(
      isErr ? { error: msg, success: null } : { error: null, success: msg },
    );
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      flash(t("selectFile"), true);
      return;
    }
    const fd = new FormData();
    fd.append("image", file);
    fd.append("description", form.description);
    fd.append("imageType", form.imageType);
    if (form.studentId) fd.append("studentId", form.studentId);
    if (form.teacherId) fd.append("teacherId", form.teacherId);
    try {
      await upload.mutateAsync(fd);
      flash(t("uploaded"));
      if (fileRef.current) fileRef.current.value = "";
      setForm({
        description: "",
        imageType: "general",
        studentId: "",
        teacherId: "",
      });
    } catch (err) {
      flash(err.message || t("uploadFailed"), true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("deleteConfirm"))) return;
    try {
      await remove.mutateAsync(id);
      flash(t("deleted"));
    } catch (err) {
      flash(err.message || t("deleteFailed"), true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload and manage school gallery images
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      {/* Upload form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiUploadCloud className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {t("upload")}
          </h2>
        </div>
        <form onSubmit={handleUpload} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("file")}
              </label>
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                required
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("imageType")}
              </label>
              <select
                value={form.imageType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, imageType: e.target.value }))
                }
                className="form-input"
              >
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("description")}
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="form-input"
                placeholder={t("descriptionPlaceholder")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("studentId")}
              </label>
              <input
                type="text"
                value={form.studentId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, studentId: e.target.value }))
                }
                className="form-input"
              />
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="submit"
              className="btn-primary"
              disabled={upload.isPending}
            >
              {upload.isPending ? t("uploading") : t("upload")}
            </button>
          </div>
        </form>
      </div>

      {/* Image grid */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiImage className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allImages")}
            </h2>
            <p className="text-xs text-slate-400">{images.length} images</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {t("loading")}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400">
            <FiImage className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">{t("noImages")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.ImageID}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="relative overflow-hidden h-36">
                  <Image
                    src={img.ImagePath || img.ImageUrl}
                    alt={img.Description || "Gallery"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    {img.ImageType}
                  </span>
                  {img.Description && (
                    <p className="text-xs mt-1.5 text-slate-600 leading-snug line-clamp-2">
                      {img.Description}
                    </p>
                  )}
                  <button
                    onClick={() => handleDelete(img.ImageID)}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-red-500 text-xs font-medium hover:text-red-700 bg-transparent border-none cursor-pointer transition-colors"
                  >
                    <FiTrash2 className="text-xs" />
                    {tCommon("delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
