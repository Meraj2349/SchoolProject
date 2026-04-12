"use client";

import { useState, useRef } from "react";
import { useImages, useUploadImage, useDeleteImage } from "@/hooks/useImages";
import { useTranslations } from "@/store/languageStore";

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
      setForm({ description: "", imageType: "general", studentId: "", teacherId: "" });
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
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      {/* Upload form */}
      <form
        onSubmit={handleUpload}
        className="bg-white rounded-lg border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-4">{t("upload")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t("file")}
            </label>
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              required
              className="block mt-1 text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t("imageType")}
            </label>
            <select
              value={form.imageType}
              onChange={(e) =>
                setForm((p) => ({ ...p, imageType: e.target.value }))
              }
              className="form-input mt-1"
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t("description")}
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="form-input mt-1"
              placeholder={t("descriptionPlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t("studentId")}
            </label>
            <input
              type="text"
              value={form.studentId}
              onChange={(e) =>
                setForm((p) => ({ ...p, studentId: e.target.value }))
              }
              className="form-input mt-1"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary mt-4"
          disabled={upload.isPending}
        >
          {upload.isPending ? t("uploading") : t("upload")}
        </button>
      </form>

      {/* Image grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {t("allImages")} ({images.length})
        </h2>
        {isLoading ? (
          <p className="text-gray-500">{t("loading")}</p>
        ) : images.length === 0 ? (
          <p className="text-gray-500">{t("noImages")}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.ImageID}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  src={img.ImagePath || img.ImageUrl}
                  alt={img.Description || "Gallery"}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.target.src = "";
                  }}
                />
                <div className="p-2">
                  <span className="inline-block text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                    {img.ImageType}
                  </span>
                  {img.Description && (
                    <p className="text-xs mt-1 text-gray-600 leading-snug">
                      {img.Description}
                    </p>
                  )}
                  <button
                    onClick={() => handleDelete(img.ImageID)}
                    className="mt-2 text-red-600 text-xs bg-none border-none cursor-pointer hover:text-red-800 transition-colors"
                  >
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
