"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examsService } from "@/services/exams.service";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";

const EMPTY = { ExamType: "", ExamName: "", ClassName: "", SectionName: "", ExamDate: "" };

export default function AdminPage() {
  const qc = useQueryClient();
  const t = useTranslations("admin.exams");

  const { data: exams = [], isLoading } = useQuery({
    queryKey: queryKeys.exams.all,
    queryFn: examsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });
  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: classesService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  const create = useMutation({
    mutationFn: examsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.exams.all }); flash(t("examAdded")); reset(); },
  });
  const update = useMutation({
    mutationFn: ({ id, data }) => examsService.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.exams.all }); flash(t("examUpdated")); reset(); },
  });
  const remove = useMutation({
    mutationFn: examsService.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.exams.all }); flash(t("deleted")); },
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

  const TABLE_HEADERS = [t("name"), t("examType"), t("class"), t("date"), t("actions")];
  const EXAM_TYPES = [t("halfYearly"), t("annual"), t("unitTest"), t("monthly")];
  const EXAM_TYPE_VALUES = ["Half Yearly", "Annual", "Unit Test", "Monthly"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          {editId ? t("editExam") : t("addExam")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("examType")}</label>
            <select name="ExamType" value={form.ExamType} onChange={handleChange} className="form-input">
              <option value="">{t("selectType")}</option>
              {EXAM_TYPE_VALUES.map((tp, i) => (
                <option key={tp} value={tp}>{EXAM_TYPES[i]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("examName")}</label>
            <input type="text" name="ExamName" value={form.ExamName} onChange={handleChange} className="form-input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("class")}</label>
            <select name="ClassName" value={form.ClassName} onChange={handleChange} className="form-input">
              <option value="">{t("selectClass")}</option>
              {[...new Set(classes.map((c) => c.className || c.ClassName))].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("section")}</label>
            <input type="text" name="SectionName" value={form.SectionName} onChange={handleChange} className="form-input" placeholder={t("sectionPlaceholder")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("examDate")}</label>
            <input type="date" name="ExamDate" value={form.ExamDate} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="submit" className="btn-primary">{editId ? t("updateExam") : t("addExam")}</button>
          {editId && <button type="button" onClick={reset} className="btn-secondary">{t("cancel")}</button>}
        </div>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700">
            {t("allExams")} ({exams.length})
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
                {exams.map((ex) => (
                  <tr key={ex.ExamID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{ex.ExamName}</td>
                    <td className="table-cell">
                      <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                        {ex.ExamType}
                      </span>
                    </td>
                    <td className="table-cell">{ex.ClassName}{ex.SectionName && ` – ${ex.SectionName}`}</td>
                    <td className="table-cell">{ex.ExamDate ? new Date(ex.ExamDate).toLocaleDateString() : "–"}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => {
                          setEditId(ex.ExamID);
                          setForm({
                            ExamType: ex.ExamType || "",
                            ExamName: ex.ExamName || "",
                            ClassName: ex.ClassName || "",
                            SectionName: ex.SectionName || "",
                            ExamDate: ex.ExamDate?.split("T")[0] || "",
                          });
                        }}
                        className="text-blue-600 bg-transparent border-none cursor-pointer text-sm font-medium hover:text-blue-800 mr-3 transition-colors"
                      >
                        {t("editExam")}
                      </button>
                      <button
                        onClick={() => { if (window.confirm(t("deleteConfirm"))) remove.mutate(ex.ExamID); }}
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
