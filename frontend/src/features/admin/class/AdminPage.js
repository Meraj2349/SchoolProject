"use client";

import { useState } from "react";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from "@/hooks/useClasses";
import { useTranslations } from "@/store/languageStore";
import { FiEdit2, FiTrash2, FiPlusCircle, FiGrid } from "react-icons/fi";

const EMPTY = { className: "", section: "", teacherName: "", teacherEmail: "" };

export default function AdminPage() {
  const { data: classes = [], isLoading } = useClasses();
  const create = useCreateClass();
  const update = useUpdateClass();
  const remove = useDeleteClass();
  const t = useTranslations("admin.classes");

  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ error: null, success: null });

  const flash = (m, e = false) => {
    setStatus(e ? { error: m, success: null } : { error: null, success: m });
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };
  const reset = () => {
    setForm(EMPTY);
    setEditId(null);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) await update.mutateAsync({ id: editId, data: form });
      else await create.mutateAsync(form);
      flash(editId ? t("classUpdated") : t("classAdded"));
      reset();
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const FIELDS = [
    ["className", t("className")],
    ["section", t("section")],
    ["teacherName", t("teacherName")],
    ["teacherEmail", t("teacherEmail")],
  ];

  const TABLE_HEADERS = [
    t("className"),
    t("section"),
    t("teacherName"),
    t("teacherEmail"),
    t("actions"),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage class sections and assigned teachers
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiPlusCircle className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {editId ? t("editClass") : t("addClass")}
          </h2>
        </div>
        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FIELDS.map(([n, l]) => (
              <div key={n}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {l}
                </label>
                <input
                  type="text"
                  name={n}
                  value={form[n]}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button type="submit" className="btn-primary">
              {editId ? t("updateClass") : t("addClass")}
            </button>
            {editId && (
              <button type="button" onClick={reset} className="btn-secondary">
                {t("cancel")}
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiGrid className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allClasses")}
            </h2>
            <p className="text-xs text-slate-400">
              {classes.length} total classes
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            {t("loading")}
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
                {classes.map((c, i) => (
                  <tr
                    key={c.ClassID || c.id}
                    className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="table-cell">
                      <span className="font-semibold text-slate-800">
                        {c.className || c.ClassName}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                        {c.section || c.Section}
                      </span>
                    </td>
                    <td className="table-cell text-slate-700">
                      {c.teacherName || c.TeacherName || "–"}
                    </td>
                    <td className="table-cell text-slate-500 text-xs">
                      {c.teacherEmail || c.TeacherEmail || "–"}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditId(c.ClassID || c.id);
                            setForm({
                              className: c.className || c.ClassName || "",
                              section: c.section || c.Section || "",
                              teacherName: c.teacherName || c.TeacherName || "",
                              teacherEmail:
                                c.teacherEmail || c.TeacherEmail || "",
                            });
                          }}
                          className="btn-icon edit"
                          title={t("editClass")}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t("deleteConfirm")))
                              remove.mutate(c.ClassID || c.id);
                          }}
                          className="btn-icon delete"
                          title={t("deleted")}
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
