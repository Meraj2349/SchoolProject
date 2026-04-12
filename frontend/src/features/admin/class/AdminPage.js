"use client";

import { useState } from "react";
import {
  useClasses,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
} from "@/hooks/useClasses";
import { useTranslations } from "@/store/languageStore";

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
  const reset = () => { setForm(EMPTY); setEditId(null); };
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

  const TABLE_HEADERS = [t("className"), t("section"), t("teacherName"), t("teacherEmail"), t("actions")];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editId ? t("editClass") : t("addClass")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map(([n, l]) => (
            <div key={n}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{l}</label>
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
        <div className="flex gap-2 mt-4">
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

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">
            {t("allClasses")} ({classes.length})
          </h2>
        </div>
        {isLoading ? (
          <p className="p-6 text-gray-500">{t("loading")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.ClassID || c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">{c.className || c.ClassName}</td>
                    <td className="table-cell">{c.section || c.Section}</td>
                    <td className="table-cell">{c.teacherName || c.TeacherName || "–"}</td>
                    <td className="table-cell">{c.teacherEmail || c.TeacherEmail || "–"}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => {
                          setEditId(c.ClassID || c.id);
                          setForm({
                            className: c.className || c.ClassName || "",
                            section: c.section || c.Section || "",
                            teacherName: c.teacherName || c.TeacherName || "",
                            teacherEmail: c.teacherEmail || c.TeacherEmail || "",
                          });
                        }}
                        className="text-blue-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-blue-800 mr-3 transition-colors"
                      >
                        {t("editClass")}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t("deleteConfirm")))
                            remove.mutate(c.ClassID || c.id);
                        }}
                        className="text-red-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-red-800 transition-colors"
                      >
                        {t("deleted")}
                      </button>
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
