"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chairmanService } from "@/services/chairman.service";
import { queryKeys } from "@/lib/queryKeys";
import { FiUser, FiUpload, FiSave, FiX, FiCamera } from "react-icons/fi";

const EMPTY = {
  name_en: "",
  name_bn: "",
  title_en: "",
  title_bn: "",
  institution_en: "",
  institution_bn: "",
};

export default function AdminPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null); // File object to upload
  const [previewUrl, setPreviewUrl] = useState(null); // local blob URL
  const [status, setStatus] = useState({ error: null, success: null });

  // ── Load existing profile ─────────────────────────────────────────────
  const { data: profileData, isLoading } = useQuery({
    queryKey: queryKeys.chairman.profile,
    queryFn: chairmanService.getProfile,
    select: (d) => d?.data ?? d,
  });

  const [syncedProfile, setSyncedProfile] = useState(null);
  if (profileData && profileData !== syncedProfile) {
    setSyncedProfile(profileData);
    setForm({
      name_en: profileData.name_en || "",
      name_bn: profileData.name_bn || "",
      title_en: profileData.title_en || "",
      title_bn: profileData.title_bn || "",
      institution_en: profileData.institution_en || "",
      institution_bn: profileData.institution_bn || "",
    });
  }

  // ── Save mutation ─────────────────────────────────────────────────────
  const save = useMutation({
    mutationFn: (fd) => chairmanService.updateProfile(fd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chairman.profile });
      flash("Profile updated successfully!");
      setImageFile(null);
      setPreviewUrl(null);
    },
    onError: (err) => flash(err.message || "Update failed", true),
  });

  const flash = (msg, isErr = false) => {
    setStatus(
      isErr ? { error: msg, success: null } : { error: null, success: msg },
    );
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name_en.trim() && !form.name_bn.trim()) {
      flash("Please enter at least one name (English or Bangla).", true);
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);
    save.mutate(fd);
  };

  // ── Image to display ──────────────────────────────────────────────────
  const currentImage = previewUrl || profileData?.image_url || null;

  // ── Field groups ──────────────────────────────────────────────────────
  const FIELD_GROUPS = [
    {
      label: "Name",
      fields: [
        {
          name: "name_en",
          label: "Name (English)",
          placeholder: "e.g. Md. Rashedul Islam",
        },
        {
          name: "name_bn",
          label: "Name (Bangla)",
          placeholder: "e.g. মোঃ রাশেদুল ইসলাম",
        },
      ],
    },
    {
      label: "Title",
      fields: [
        {
          name: "title_en",
          label: "Title (English)",
          placeholder: "e.g. Chairman",
        },
        {
          name: "title_bn",
          label: "Title (Bangla)",
          placeholder: "e.g. চেয়ারম্যান",
        },
      ],
    },
    {
      label: "Institution",
      fields: [
        {
          name: "institution_en",
          label: "Institution (English)",
          placeholder: "e.g. Star Shikkha Poribar",
        },
        {
          name: "institution_bn",
          label: "Institution (Bangla)",
          placeholder: "e.g. স্টার শিক্ষা পরিবার",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chairman Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update the chairman&apos;s name, title, institution, and photo. These
          appear on the public Chairman&apos;s Message page.
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex items-center justify-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          Loading profile…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <FiCamera className="text-indigo-600 text-sm" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Profile Photo
              </h2>
            </div>
            <div className="p-6 flex items-start gap-6 flex-wrap">
              {/* Preview */}
              <div className="relative shrink-0">
                {currentImage ? (
                  <>
                    <img
                      src={currentImage}
                      alt="Chairman"
                      className="w-32 h-32 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                    />
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        title="Remove selected image"
                      >
                        <FiX className="text-xs" />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-2">
                    <FiUser className="text-slate-400 text-2xl" />
                    <span className="text-xs text-slate-400">No photo</span>
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="flex flex-col gap-3 justify-center">
                <p className="text-sm text-slate-600 max-w-xs">
                  Upload a clear portrait photo. JPG, PNG, or GIF — max 10 MB.
                  {profileData?.image_url && !previewUrl && (
                    <span className="block text-xs text-emerald-600 mt-1">
                      ✓ Current photo saved
                    </span>
                  )}
                  {previewUrl && (
                    <span className="block text-xs text-amber-600 mt-1">
                      New photo selected — save to apply
                    </span>
                  )}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleImageChange}
                  className="hidden"
                  id="chairman-image-input"
                />
                <label
                  htmlFor="chairman-image-input"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 cursor-pointer transition-colors w-fit shadow-sm"
                >
                  <FiUpload className="text-sm text-indigo-600" />
                  Choose Photo
                </label>
              </div>
            </div>
          </div>

          {/* Text fields card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <FiUser className="text-indigo-600 text-sm" />
              </div>
              <h2 className="text-base font-semibold text-slate-800">
                Profile Details
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {FIELD_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.fields.map((f) => (
                      <div key={f.name}>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                          {f.label}
                        </label>
                        <input
                          type="text"
                          name={f.name}
                          value={form[f.name]}
                          onChange={handleChange}
                          placeholder={f.placeholder}
                          className="form-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={save.isPending}
              className="btn-primary gap-2"
            >
              <FiSave className="text-sm" />
              {save.isPending ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
