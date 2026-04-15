"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examsService } from "@/services/exams.service";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import { useBranchStore } from "@/store/branchStore";
import { FiEdit2, FiTrash2, FiFileText, FiPlusCircle } from "react-icons/fi";

// Must match DB ENUM exactly
const EXAM_TYPE_OPTIONS = [
  { value: "Monthly",     label: "Monthly" },
  { value: "Quarterly",   label: "Quarterly" },
  { value: "Half-Yearly", label: "Half-Yearly" },
  { value: "Annual",      label: "Annual" },
  { value: "Final",       label: "Final" },
];

const EMPTY = {
  ExamType: "",
  ExamName: "",
  ClassName: "",
  SectionName: "",
  ExamDate: "",
};

export default function AdminPage() {
  const qc = useQueryClient();
  const t = useTranslations("admin.exams");
  const branchId = useBranchStore((s) => s.currentBranchId);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: queryKeys.exams.all(branchId),
    queryFn: examsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });
  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.classes.all(branchId),
    queryFn: classesService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  const create = useMutation({
    mutationFn: examsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams.all(branchId) });
      flash(t("examAdded"));
      reset();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => examsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams.all(branchId) });
      flash(t("examUpdated"));
      reset();
    },
  });
  const remove = useMutation({
    mutationFn: examsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.exams.all(branchId) });
      flash(t("deleted"));
    },
  });

  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [status, setStatus] = useState({ error: null, success: null });

  const uniqueClassNames = useMemo(
    () => [...new Set(classes.map((c) => c.ClassName))].sort(),
    [classes],
  );
  const sectionsForClass = useMemo(() => {
    if (!form.ClassName) return [];
    return classes
      .filter((c) => c.ClassName === form.ClassName)
      .map((c) => c.Section);
  }, [classes, form.ClassName]);

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

  const TABLE_HEADERS = [
    t("name"),
    t("examType"),
    t("class"),
    t("date"),
    t("actions"),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Schedule and track examinations
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
            {editId ? t("editExam") : t("addExam")}
          </h2>
        </div>
        <form onSubmit={handleSave} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Exam Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("examType")}
              </label>
              <select
                name="ExamType"
                value={form.ExamType}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">{t("selectType")}</option>
                {EXAM_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("examName")}
              </label>
              <input
                type="text"
                name="ExamName"
                value={form.ExamName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("class")}
              </label>
              <select
                name="ClassName"
                value={form.ClassName}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    ClassName: e.target.value,
                    SectionName: "",
                  }))
                }
                className="form-input"
                required
              >
                <option value="">{t("selectClass")}</option>
                {uniqueClassNames.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("section")}
              </label>
              <select
                name="SectionName"
                value={form.SectionName}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Select section</option>
                {sectionsForClass.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Exam Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("examDate")}
              </label>
              <input
                type="date"
                name="ExamDate"
                value={form.ExamDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button type="submit" className="btn-primary">
              {editId ? t("updateExam") : t("addExam")}
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
            <FiFileText className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("allExams")}
            </h2>
            <p className="text-xs text-slate-400">{exams.length} total exams</p>
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
                {exams.map((ex, i) => (
                  <tr
                    key={ex.ExamID}
                    className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="table-cell font-semibold text-slate-800">
                      {ex.ExamName}
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                        {ex.ExamType}
                      </span>
                    </td>
                    <td className="table-cell text-slate-600">
                      {ex.ClassName}
                      {ex.Section && ` – ${ex.Section}`}
                    </td>
                    <td className="table-cell text-slate-600 whitespace-nowrap">
                      {ex.ExamDate
                        ? new Date(ex.ExamDate).toLocaleDateString()
                        : "–"}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditId(ex.ExamID);
                            setForm({
                              ExamType: ex.ExamType || "",
                              ExamName: ex.ExamName || "",
                              ClassName: ex.ClassName || "",
                              SectionName: ex.Section || "",
                              ExamDate: ex.ExamDate
                                ? String(ex.ExamDate).split("T")[0]
                                : "",
                            });
                          }}
                          className="btn-icon edit"
                          title={t("editExam")}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(t("deleteConfirm")))
                              remove.mutate(ex.ExamID);
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
