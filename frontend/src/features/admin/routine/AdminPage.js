"use client";

import { useState, useRef } from "react";
import {
  useRoutines,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
} from "@/hooks/useRoutines";
import { useClasses } from "@/hooks/useClasses";
import { useTranslations } from "@/store/languageStore";
import {
  FiEdit2,
  FiTrash2,
  FiClock,
  FiPlusCircle,
  FiExternalLink,
} from "react-icons/fi";

const EMPTY = {
  RoutineTitle: "",
  ClassID: "",
  RoutineDate: "",
  Description: "",
};

export default function AdminPage() {
  const { data: routines = [], isLoading } = useRoutines();
  const { data: classes = [] } = useClasses();
  const create = useCreateRoutine();
  const update = useUpdateRoutine();
  const remove = useDeleteRoutine();
  const t = useTranslations("admin.routine");

  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ error: null, success: null });
  const fileRef = useRef();

  const flash = (m, e = false) => {
    setStatus(e ? { error: m, success: null } : { error: null, success: m });
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };
  const reset = () => {
    setForm(EMPTY);
    setEditId(null);
    if (fileRef.current) fileRef.current.value = "";
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    try {
      if (editId) await update.mutateAsync({ id: editId, data: form, file });
      else await create.mutateAsync({ data: form, file });
      flash(editId ? t("routineUpdated") : t("routineAdded"));
      reset();
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  const TABLE_HEADERS = [
    t("titleCol"),
    t("classCol"),
    t("dateCol"),
    t("fileCol"),
    t("actionsCol"),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload and manage class routine files
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
            {editId ? t("editRoutine") : t("addRoutine")}
          </h2>
        </div>
        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("routineTitle")}
              </label>
              <input
                type="text"
                name="RoutineTitle"
                value={form.RoutineTitle}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("class")}
              </label>
              <select
                name="ClassID"
                value={form.ClassID}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">{t("selectClass")}</option>
                {classes.map((c) => (
                  <option key={c.ClassID || c.id} value={c.ClassID || c.id}>
                    {c.className || c.ClassName} – {c.section || c.Section}
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
                name="RoutineDate"
                value={form.RoutineDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("file")}
              </label>
              <input
                type="file"
                ref={fileRef}
                accept=".pdf,image/*"
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer mt-0.5"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("description")}
              </label>
              <textarea
                name="Description"
                value={form.Description}
                onChange={handleChange}
                rows={3}
                className="form-input"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button
              type="submit"
              className="btn-primary"
              disabled={create.isPending || update.isPending}
            >
              {editId ? t("updateRoutine") : t("addRoutine")}
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
            <FiClock className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allRoutines")}
            </h2>
            <p className="text-xs text-slate-400">
              {routines.length} total routines
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
                {routines.map((r, i) => (
                  <tr
                    key={r.RoutineID}
                    className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="table-cell font-semibold text-slate-800">
                      {r.RoutineTitle}
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                        {r.ClassName} – {r.Section}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600 whitespace-nowrap">
                      {fmtDate(r.RoutineDate)}
                    </td>
                    <td className="table-cell">
                      {r.FileURL ? (
                        <a
                          href={r.FileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                        >
                          <FiExternalLink className="text-xs" />
                          {t("view")}
                        </a>
                      ) : (
                        <span className="text-slate-400">–</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditId(r.RoutineID);
                            setForm({
                              RoutineTitle: r.RoutineTitle || "",
                              ClassID: r.ClassID || "",
                              RoutineDate: r.RoutineDate?.split("T")[0] || "",
                              Description: r.Description || "",
                            });
                          }}
                          className="btn-icon edit"
                          title={t("editRoutine")}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t("deleteConfirm")))
                              remove.mutate(r.RoutineID);
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
