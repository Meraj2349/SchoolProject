"use client";

import { useState, useRef } from "react";
import { useImages, useUploadImage, useDeleteImage } from "@/hooks/useImages";
import "@/styles/AdminImageGallery.css";

const TYPES = ["general", "school", "student", "teacher", "event", "notice"];

export default function AdminPage() {
  const { data: images = [], isLoading } = useImages();
  const upload = useUploadImage();
  const remove = useDeleteImage();
  const fileRef = useRef();

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
      flash("Please select a file", true);
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
      flash("Image uploaded!");
      if (fileRef.current) fileRef.current.value = "";
      setForm({
        description: "",
        imageType: "general",
        studentId: "",
        teacherId: "",
      });
    } catch (err) {
      flash(err.message || "Upload failed", true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await remove.mutateAsync(id);
      flash("Deleted.");
    } catch (err) {
      flash(err.message || "Delete failed", true);
    }
  };

  return (
    <div className="admin-gallery-page">
      <h1>Image Gallery</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      <form
        onSubmit={handleUpload}
        className="upload-form"
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          marginBottom: 24,
        }}
      >
        <h2>Upload Image</h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label>File</label>
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              required
              style={{ display: "block", marginTop: 4 }}
            />
          </div>
          <div>
            <label>Type</label>
            <select
              value={form.imageType}
              onChange={(e) =>
                setForm((p) => ({ ...p, imageType: e.target.value }))
              }
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label>Student ID (optional)</label>
            <input
              type="text"
              value={form.studentId}
              onChange={(e) =>
                setForm((p) => ({ ...p, studentId: e.target.value }))
              }
              className="form-input"
              style={{ marginTop: 4, width: "100%" }}
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: 16 }}
          disabled={upload.isPending}
        >
          {upload.isPending ? "Uploading…" : "Upload Image"}
        </button>
      </form>

      <div>
        <h2>All Images ({images.length})</h2>
        {isLoading ? (
          <p>Loading…</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
              gap: 16,
            }}
          >
            {images.map((img) => (
              <div
                key={img.ImageID}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <img
                  src={img.ImagePath || img.ImageUrl}
                  alt={img.Description || "Gallery"}
                  style={{ width: "100%", height: 160, objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = "";
                  }}
                />
                <div style={{ padding: "8px 12px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      background: "#f3f4f6",
                      padding: "2px 8px",
                      borderRadius: 12,
                    }}
                  >
                    {img.ImageType}
                  </span>
                  {img.Description && (
                    <p style={{ fontSize: 13, marginTop: 4, color: "#374151" }}>
                      {img.Description}
                    </p>
                  )}
                  <button
                    onClick={() => handleDelete(img.ImageID)}
                    style={{
                      marginTop: 8,
                      color: "#dc2626",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    Delete
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
