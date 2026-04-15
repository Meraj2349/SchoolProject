"use client";

import { useState, useRef, useCallback } from "react";
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from "@/hooks/useBranches";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "@/store/languageStore";
import { toast } from "react-toastify";
import {
  FiEdit2,
  FiTrash2,
  FiPlusCircle,
  FiGrid,
  FiAlertTriangle,
} from "react-icons/fi";
import { FaCodeBranch } from "react-icons/fa";

// ─────────────────────────────────────────────────────────────────────────────
// Empty form state
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name_en: "",
  name_bn: "",
  address_en: "",
  address_bn: "",
  description_en: "",
  description_bn: "",
  is_proposed: false,
  established_date: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const role = useAuthStore((s) => s.role);
  const t = useTranslations("admin.branches");

  const { data: branches = [], isLoading } = useBranches();
  const create = useCreateBranch();
  const update = useUpdateBranch();
  const remove = useDeleteBranch();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const formRef = useRef(null);

  // Must be declared before any conditional return (Rules of Hooks)
  const reset = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setConfirmDeleteId(null);
  }, []);

  // Guard — only super_admin may use this page
  if (role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <FiAlertTriangle className="text-5xl mb-4 text-amber-400" />
        <p className="text-base font-medium">{t("superAdminOnly")}</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name_en.trim() && !form.name_bn.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    const payload = {
      name_en: form.name_en.trim() || null,
      name_bn: form.name_bn.trim() || null,
      address_en: form.address_en.trim() || null,
      address_bn: form.address_bn.trim() || null,
      description_en: form.description_en.trim() || null,
      description_bn: form.description_bn.trim() || null,
      is_proposed: form.is_proposed,
      established_date: form.established_date || null,
    };

    try {
      if (editId) {
        await update.mutateAsync({ id: editId, data: payload });
        toast.success(t("branchUpdated"));
      } else {
        await create.mutateAsync(payload);
        toast.success(t("branchAdded"));
      }
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.response?.data?.error || err.message || t("operationFailed"));
    }
  };

  const handleEdit = (branch) => {
    setEditId(branch.id);
    setConfirmDeleteId(null);
    setForm({
      name_en: branch.name_en || "",
      name_bn: branch.name_bn || "",
      address_en: branch.address_en || "",
      address_bn: branch.address_bn || "",
      description_en: branch.description_en || "",
      description_bn: branch.description_bn || "",
      is_proposed: !!branch.is_proposed,
      established_date: branch.established_date
        ? branch.established_date.split("T")[0]
        : "",
    });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleDeleteRequest = (id) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = (id) => {
    remove.mutate(id, {
      onSuccess: () => {
        toast.success(t("deleted"));
        setConfirmDeleteId(null);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || err.message || t("operationFailed"));
        setConfirmDeleteId(null);
      },
    });
  };

  const isBusy = create.isPending || update.isPending;

  const TABLE_HEADERS = [
    t("nameEn"),
    t("nameBn"),
    t("addressEn"),
    t("status"),
    t("establishedDate"),
    t("actions"),
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create, edit and delete school branches
        </p>
      </div>

      {/* ── Form card ────────────────────────────────────────────────────── */}
      <div
        ref={formRef}
        className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-colors ${
          editId ? "border-2 border-amber-400" : "border border-slate-200"
        }`}
      >
        <div
          className={`px-6 py-4 border-b flex items-center gap-3 ${
            editId ? "bg-amber-50 border-amber-100" : "border-slate-100"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              editId ? "bg-amber-100" : "bg-indigo-50"
            }`}
          >
            <FiPlusCircle
              className={`text-sm ${editId ? "text-amber-600" : "text-indigo-600"}`}
            />
          </div>
          <h2 className="text-base font-semibold text-slate-800 flex-1">
            {editId ? t("editBranch") : t("addBranch")}
          </h2>
          {editId && (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6">
          {/* Row 1: Name fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("nameEn")} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name_en"
                value={form.name_en}
                onChange={handleChange}
                placeholder="e.g. Natiapara Branch"
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("nameBn")} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name_bn"
                value={form.name_bn}
                onChange={handleChange}
                placeholder="যেমন: নাটিয়াপাড়া শাখা"
                className="form-input"
              />
            </div>
          </div>

          {/* Row 2: Address fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("addressEn")}
              </label>
              <input
                type="text"
                name="address_en"
                value={form.address_en}
                onChange={handleChange}
                placeholder="e.g. Natiapara, Delduar, Tangail"
                className="form-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("addressBn")}
              </label>
              <input
                type="text"
                name="address_bn"
                value={form.address_bn}
                onChange={handleChange}
                placeholder="যেমন: নাটিয়াপাড়া, দেলদুয়ার, টাঙ্গাইল"
                className="form-input"
              />
            </div>
          </div>

          {/* Row 3: Description fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("descriptionEn")}
              </label>
              <textarea
                name="description_en"
                value={form.description_en}
                onChange={handleChange}
                rows={2}
                placeholder="Brief description in English"
                className="form-input resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("descriptionBn")}
              </label>
              <textarea
                name="description_bn"
                value={form.description_bn}
                onChange={handleChange}
                rows={2}
                placeholder="বাংলায় সংক্ষিপ্ত বিবরণ"
                className="form-input resize-none"
              />
            </div>
          </div>

          {/* Row 4: Date + proposed toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("establishedDate")}
              </label>
              <input
                type="date"
                name="established_date"
                value={form.established_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                name="is_proposed"
                id="is_proposed"
                checked={form.is_proposed}
                onChange={handleChange}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
              <label
                htmlFor="is_proposed"
                className="text-sm text-slate-700 cursor-pointer font-medium"
              >
                {t("isProposed")}
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              type="submit"
              disabled={isBusy}
              className="btn-primary disabled:opacity-60"
            >
              {isBusy ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : editId ? (
                t("updateBranch")
              ) : (
                t("addBranch")
              )}
            </button>
            {editId && (
              <button type="button" onClick={reset} className="btn-secondary">
                {t("cancel")}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Table card ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiGrid className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allBranches")}
            </h2>
            <p className="text-xs text-slate-400">{branches.length} total branches</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {t("loading")}
          </div>
        ) : branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <FaCodeBranch className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">{t("noBranches")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="table-header">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {branches.map((branch, i) => (
                  <tr
                    key={branch.id}
                    className={`hover:bg-indigo-50/30 transition-colors ${
                      i % 2 === 0 ? "" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="table-cell">
                      <span className="font-semibold text-slate-800">
                        {branch.name_en || "—"}
                      </span>
                    </td>
                    <td className="table-cell text-slate-700">
                      {branch.name_bn || "—"}
                    </td>
                    <td className="table-cell text-slate-600 text-sm max-w-50 truncate">
                      {branch.address_en || branch.address_bn || "—"}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          branch.is_proposed
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {branch.is_proposed ? t("proposed") : t("active")}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600 text-sm">
                      {branch.established_date
                        ? new Date(branch.established_date).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    <td className="table-cell">
                      {confirmDeleteId === branch.id ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-red-700 font-medium">
                            {t("deleteConfirm")}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => confirmDelete(branch.id)}
                              disabled={remove.isPending}
                              className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(branch)}
                            className="btn-icon edit"
                            title={t("editBranch")}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(branch.id)}
                            className="btn-icon delete"
                            title={t("deleteConfirm")}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      )}
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
