"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { resultsService } from "@/services/results.service";
import { examsService } from "@/services/exams.service";
import { subjectsService } from "@/services/subjects.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import { FiAward } from "react-icons/fi";

export default function AdminPage() {
  const [form, setForm] = useState({
    className: "",
    section: "",
    examId: "",
    subjectId: "",
    firstName: "",
    rollNumber: "",
    marksObtained: "",
    totalMarks: "100",
  });
  const [status, setStatus] = useState({ error: null, success: null });
  const t = useTranslations("admin.results");

  const { data: exams = [] } = useQuery({
    queryKey: queryKeys.exams.all,
    queryFn: examsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });
  const { data: subjects = [] } = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: subjectsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  const add = useMutation({
    mutationFn: resultsService.createByDetails,
    onSuccess: () => {
      flash(t("resultAdded"));
      setForm((p) => ({
        ...p,
        firstName: "",
        rollNumber: "",
        marksObtained: "",
      }));
    },
    onError: (err) => flash(err.message || t("failed"), true),
  });

  const flash = (m, e = false) => {
    setStatus(e ? { error: m, success: null } : { error: null, success: m });
    setTimeout(() => setStatus({ error: null, success: null }), 4000);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await add.mutateAsync({
      firstName: form.firstName,
      rollNumber: form.rollNumber,
      className: form.className,
      section: form.section,
      examId: form.examId,
      subjectId: form.subjectId,
      marksObtained: Number(form.marksObtained),
      totalMarks: Number(form.totalMarks),
    });
  };

  const filteredExams = form.className
    ? exams.filter(
        (ex) => ex.ClassName?.toLowerCase() === form.className.toLowerCase(),
      )
    : exams;

  const TEXT_FIELDS = [
    ["className", t("className"), "text", true],
    ["section", t("section"), "text", true],
    ["firstName", t("firstName"), "text", true],
    ["rollNumber", t("rollNumber"), "text", true],
    ["marksObtained", t("marksObtained"), "number", true],
    ["totalMarks", t("totalMarks"), "number", true],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Record student examination results
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiAward className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {t("addResult")}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEXT_FIELDS.map(([name, label, type, req]) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  className="form-input"
                  required={req}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("exam")}
              </label>
              <select
                name="examId"
                value={form.examId}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">{t("selectExam")}</option>
                {filteredExams.map((ex) => (
                  <option key={ex.ExamID} value={ex.ExamID}>
                    {ex.ExamName} – {ex.ExamType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("subject")}
              </label>
              <select
                name="subjectId"
                value={form.subjectId}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">{t("selectSubject")}</option>
                {subjects.map((s) => (
                  <option key={s.SubjectID} value={s.SubjectID}>
                    {s.SubjectName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="submit"
              className="btn-primary"
              disabled={add.isPending}
            >
              {add.isPending ? t("saving") : t("addResult")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
