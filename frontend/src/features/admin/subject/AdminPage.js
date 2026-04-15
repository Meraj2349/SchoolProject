"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectsService } from "@/services/subjects.service";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import { useBranchStore } from "@/store/branchStore";
import { FiEdit2, FiTrash2, FiBook, FiPlusCircle, FiX } from "react-icons/fi";

const EMPTY = { SubjectName: "", ClassID: "" };

export default function AdminPage() {
  const qc = useQueryClient();
  const t = useTranslations("admin.subjects");
  const tCommon = useTranslations("common");
  const branchId = useBranchStore((s) => s.currentBranchId);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: queryKeys.subjects.all(branchId),
    queryFn: subjectsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });
  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.classes.all(branchId),
    queryFn: classesService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  const create = useMutation({
    mutationFn: subjectsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subjects.all(branchId) });
      flash(t("subjectAdded"));
      reset();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => subjectsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subjects.all(branchId) });
      flash(t("subjectUpdated"));
      reset();
    },
  });
  const remove = useMutation({
    mutationFn: subjectsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subjects.all(branchId) });
      flash(t("deleted"));
    },
  });

  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ error: null, success: null });
  const [filterClassId, setFilterClassId] = useState("");

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
    } catch (err) {
      flash(err.message || t("operationFailed"), true);
    }
  };

  // Client-side filter by class
  const filtered = useMemo(() => {
    if (!filterClassId) return subjects;
    return subjects.filter((s) => String(s.ClassID) === filterClassId);
  }, [subjects, filterClassId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage subjects assigned to classes
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiPlusCircle className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {editId ? t("editSubject") : t("addSubject")}
          </h2>
        </div>
        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("subjectName")}
              </label>
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
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("className")}
              </label>
              <select
                name="ClassID"
                value={form.ClassID}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">{t("selectClass")}</option>
                {classes.map((c) => (
                  <option key={c.ClassID} value={c.ClassID}>
                    {c.ClassName} – {c.Section}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
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
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <FiBook className="text-slate-600 text-sm" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {t("allSubjects")}
              </h2>
              <p className="text-xs text-slate-400">
                {filterClassId
                  ? `${filtered.length} of ${subjects.length} subjects`
                  : `${subjects.length} total subjects`}
              </p>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-52">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Filter by Class
              </label>
              <select
                value={filterClassId}
                onChange={(e) => setFilterClassId(e.target.value)}
                className="form-input"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.ClassID} value={String(c.ClassID)}>
                    {c.ClassName} – {c.Section}
                  </option>
                ))}
              </select>
            </div>
            {filterClassId && (
              <button
                onClick={() => setFilterClassId("")}
                className="btn-secondary flex items-center gap-1.5"
                title="Clear filter"
              >
                <FiX className="text-xs" />
                Clear
              </button>
            )}
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
                  <th className="table-header">{t("name")}</th>
                  <th className="table-header">{t("className")}</th>
                  <th className="table-header">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="table-cell text-center text-slate-400 py-12">
                      {filterClassId
                        ? "No subjects found for the selected class"
                        : "No subjects found"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((s, i) => (
                    <tr
                      key={s.SubjectID}
                      className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                    >
                      <td className="table-cell font-semibold text-slate-800">
                        {s.SubjectName}
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                          {s.ClassName ? `${s.ClassName} – ${s.Section}` : s.ClassID}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditId(s.SubjectID);
                              setForm({
                                SubjectName: s.SubjectName,
                                ClassID: s.ClassID || "",
                              });
                            }}
                            className="btn-icon edit"
                            title={tCommon("edit")}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(t("deleteConfirm")))
                                remove.mutate(s.SubjectID);
                            }}
                            className="btn-icon delete"
                            title={tCommon("delete")}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
