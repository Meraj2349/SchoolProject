"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectsService } from "@/services/subjects.service";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";

const EMPTY = { SubjectName: "", ClassID: "" };

export default function AdminPage() {
  const qc = useQueryClient();
  const t = useTranslations("admin.subjects");
  const tCommon = useTranslations("common");

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: subjectsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });
  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: classesService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  const create = useMutation({
    mutationFn: subjectsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.subjects.all }); flash(t("subjectAdded")); reset(); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => subjectsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.subjects.all }); flash(t("subjectUpdated")); reset(); },
  });
  const remove = useMutation({
    mutationFn: subjectsService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.subjects.all }); flash(t("deleted")); },
  });

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
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editId ? t("editSubject") : t("addSubject")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("subjectName")}</label>
            <input
              type="text"
              name="SubjectName"
              value={form.SubjectName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("className")}</label>
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
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn-primary">
            {editId ? t("updateSubject") : t("addSubject")}
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
          <h2 className="text-lg font-semibold text-gray-700">{t("allSubjects")}</h2>
        </div>
        {isLoading ? (
          <p className="p-6 text-gray-500">{t("loading")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="table-header">{t("name")}</th>
                  <th className="table-header">{t("className")}</th>
                  <th className="table-header">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.SubjectID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">{s.SubjectName}</td>
                    <td className="table-cell">{s.ClassName || s.ClassID}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => {
                          setEditId(s.SubjectID);
                          setForm({ SubjectName: s.SubjectName, ClassID: s.ClassID || "" });
                        }}
                        className="text-blue-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-blue-800 mr-3 transition-colors"
                      >
                        {tCommon("edit")}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t("deleteConfirm"))) remove.mutate(s.SubjectID);
                        }}
                        className="text-red-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-red-800 transition-colors"
                      >
                        {tCommon("delete")}
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
