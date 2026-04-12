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

const EMPTY = { RoutineTitle: "", ClassID: "", RoutineDate: "", Description: "" };

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
    try { return new Date(d).toLocaleDateString(); } catch { return d; }
  };

  const TABLE_HEADERS = [t("titleCol"), t("classCol"), t("dateCol"), t("fileCol"), t("actionsCol")];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editId ? t("editRoutine") : t("addRoutine")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("routineTitle")}</label>
            <input type="text" name="RoutineTitle" value={form.RoutineTitle} onChange={handleChange} className="form-input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("class")}</label>
            <select name="ClassID" value={form.ClassID} onChange={handleChange} className="form-input">
              <option value="">{t("selectClass")}</option>
              {classes.map((c) => (
                <option key={c.ClassID || c.id} value={c.ClassID || c.id}>
                  {c.className || c.ClassName} – {c.section || c.Section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("date")}</label>
            <input type="date" name="RoutineDate" value={form.RoutineDate} onChange={handleChange} className="form-input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("file")}</label>
            <input
              type="file"
              ref={fileRef}
              accept=".pdf,image/*"
              className="block mt-1 text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("description")}</label>
            <textarea name="Description" value={form.Description} onChange={handleChange} rows={3} className="form-input" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn-primary" disabled={create.isPending || update.isPending}>
            {editId ? t("updateRoutine") : t("addRoutine")}
          </button>
          {editId && <button type="button" onClick={reset} className="btn-secondary">{t("cancel")}</button>}
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">
            {t("allRoutines")} ({routines.length})
          </h2>
        </div>
        {isLoading ? (
          <p className="p-6 text-gray-500">{t("loading")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>{TABLE_HEADERS.map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody>
                {routines.map((r) => (
                  <tr key={r.RoutineID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{r.RoutineTitle}</td>
                    <td className="table-cell">{r.ClassName} – {r.Section}</td>
                    <td className="table-cell">{fmtDate(r.RoutineDate)}</td>
                    <td className="table-cell">
                      {r.FileURL ? (
                        <a href={r.FileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          {t("view")}
                        </a>
                      ) : "–"}
                    </td>
                    <td className="table-cell">
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
                        className="text-blue-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-blue-800 mr-3 transition-colors"
                      >
                        {t("editRoutine")}
                      </button>
                      <button
                        onClick={() => { if (window.confirm(t("deleteConfirm"))) remove.mutate(r.RoutineID); }}
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
