"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { resultsService } from "@/services/results.service";
import { examsService } from "@/services/exams.service";
import { subjectsService } from "@/services/subjects.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import { FiAward, FiSearch, FiX, FiList } from "react-icons/fi";

const RESULT_FILTER_EMPTY = { className: "", section: "", search: "" };

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
  const [resultFilters, setResultFilters] = useState(RESULT_FILTER_EMPTY);
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

  // Fetch all results for the viewer table
  const { data: allResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["results", "all"],
    queryFn: () =>
      resultsService.search({}).then((r) => r?.data ?? r ?? []),
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
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setResultFilters((p) => ({ ...p, [name]: value }));
  };
  const clearResultFilters = () => setResultFilters(RESULT_FILTER_EMPTY);

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

  // Derive unique class/section options for the results viewer filter
  const classOptions = useMemo(
    () => [...new Set(allResults.map((r) => r.ClassName).filter(Boolean))].sort(),
    [allResults],
  );
  const sectionOptions = useMemo(
    () => [...new Set(allResults.map((r) => r.Section).filter(Boolean))].sort(),
    [allResults],
  );

  // Client-side filter for the results viewer
  const filteredResults = useMemo(() => {
    const search = resultFilters.search.toLowerCase().trim();
    return allResults.filter((r) => {
      if (
        resultFilters.className &&
        (r.ClassName || "").toLowerCase() !== resultFilters.className.toLowerCase()
      )
        return false;
      if (
        resultFilters.section &&
        (r.Section || "").toLowerCase() !== resultFilters.section.toLowerCase()
      )
        return false;
      if (search) {
        const name = (r.StudentName || `${r.FirstName || ""} ${r.LastName || ""}`).toLowerCase();
        const roll = (r.RollNumber || "").toLowerCase();
        if (!name.includes(search) && !roll.includes(search)) return false;
      }
      return true;
    });
  }, [allResults, resultFilters]);

  const isFiltered =
    resultFilters.className || resultFilters.section || resultFilters.search;

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
          Record and review student examination results
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      {/* Add result form */}
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

      {/* Results viewer with filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <FiList className="text-slate-600 text-sm" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">All Results</h2>
            <p className="text-xs text-slate-400">
              {isFiltered
                ? `${filteredResults.length} of ${allResults.length} records`
                : `${allResults.length} total records`}
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search by student name / roll */}
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                <input
                  type="text"
                  name="search"
                  value={resultFilters.search}
                  onChange={handleFilterChange}
                  placeholder="Student name or roll..."
                  className="form-input pl-8"
                />
              </div>
            </div>

            {/* Class filter */}
            <div className="min-w-40">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Class
              </label>
              <select
                name="className"
                value={resultFilters.className}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">All Classes</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Section filter */}
            <div className="min-w-32">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Section
              </label>
              <select
                name="section"
                value={resultFilters.section}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">All Sections</option>
                {sectionOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={clearResultFilters}
                className="btn-secondary flex items-center gap-1.5"
                title="Clear filters"
              >
                <FiX className="text-xs" />
                Clear
              </button>
            )}
          </div>
        </div>

        {resultsLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin mr-3" />
            Loading results...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="table-header">#</th>
                  <th className="table-header">Student</th>
                  <th className="table-header">Roll</th>
                  <th className="table-header">Class</th>
                  <th className="table-header">Section</th>
                  <th className="table-header">Exam</th>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Marks</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="table-cell text-center text-slate-400 py-12">
                      {isFiltered
                        ? "No results match the current filters"
                        : "No results recorded yet"}
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r, i) => {
                    const pct = r.TotalMarks
                      ? Math.round((r.MarksObtained / r.TotalMarks) * 100)
                      : null;
                    return (
                      <tr
                        key={i}
                        className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                      >
                        <td className="table-cell text-slate-400 text-xs">{i + 1}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                              {(r.StudentName || r.FirstName || "?").charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">
                              {r.StudentName || `${r.FirstName || ""} ${r.LastName || ""}`}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                            {r.RollNumber || "–"}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                            {r.ClassName}
                          </span>
                        </td>
                        <td className="table-cell text-slate-600">{r.Section}</td>
                        <td className="table-cell text-slate-600 text-xs">{r.ExamName}</td>
                        <td className="table-cell text-slate-600 text-xs">{r.SubjectName}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {r.MarksObtained}
                              {r.TotalMarks ? (
                                <span className="text-slate-400 font-normal">/{r.TotalMarks}</span>
                              ) : null}
                            </span>
                            {pct !== null && (
                              <span
                                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                                  pct >= 80
                                    ? "bg-emerald-100 text-emerald-700"
                                    : pct >= 60
                                    ? "bg-blue-100 text-blue-700"
                                    : pct >= 40
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {pct}%
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
