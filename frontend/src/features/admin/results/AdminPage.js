"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resultsService } from "@/services/results.service";
import { examsService } from "@/services/exams.service";
import { subjectsService } from "@/services/subjects.service";
import { classesService } from "@/services/classes.service";
import { studentsService } from "@/services/students.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import {
  FiAward,
  FiSearch,
  FiX,
  FiList,
  FiEdit2,
  FiTrash2,
  FiSave,
} from "react-icons/fi";

const RESULT_FILTER_EMPTY = { className: "", section: "", search: "" };
const RESULTS_QK = ["results", "all"];

export default function AdminPage() {
  const qc = useQueryClient();
  const t = useTranslations("admin.results");
  const tCommon = useTranslations("common");

  /* ── add form state ── */
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

  /* ── edit modal state ── */
  const [editRow, setEditRow] = useState(null); // full result row being edited
  const [editMarks, setEditMarks] = useState("");

  const [status, setStatus] = useState({ error: null, success: null });
  const [resultFilters, setResultFilters] = useState(RESULT_FILTER_EMPTY);

  /* ── data queries ── */
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
  const { data: classes = [] } = useQuery({
    queryKey: queryKeys.classes.all,
    queryFn: classesService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });
  const { data: allResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: RESULTS_QK,
    queryFn: () => resultsService.search({}).then((r) => r?.data ?? r ?? []),
  });

  // Load students for the selected class+section to power the student picker
  const canFetchStudents = Boolean(form.className && form.section);
  const { data: classStudents = [], isFetching: studentsLoading } = useQuery({
    queryKey: queryKeys.students.byClassSection(form.className, form.section),
    queryFn: () =>
      studentsService
        .getByClassSection(form.className, form.section)
        .then((r) => r?.data ?? r ?? []),
    enabled: canFetchStudents,
  });

  /* ── mutations ── */
  const add = useMutation({
    mutationFn: resultsService.createByDetails,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESULTS_QK });
      flash(t("resultAdded"));
      setForm((p) => ({ ...p, firstName: "", rollNumber: "", marksObtained: "" }));
    },
    onError: (err) => flash(err.message || t("failed"), true),
  });

  const edit = useMutation({
    mutationFn: ({ id, marks }) =>
      resultsService.update(id, { MarksObtained: Number(marks) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESULTS_QK });
      flash(t("resultUpdated") || "Result updated");
      setEditRow(null);
    },
    onError: (err) => flash(err.message || t("failed"), true),
  });

  const remove = useMutation({
    mutationFn: resultsService.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESULTS_QK });
      flash(t("deleted") || "Result deleted");
    },
    onError: (err) => flash(err.message || t("failed"), true),
  });

  /* ── helpers ── */
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

  /* ── section options based on selected class in add form ── */
  const sectionsForClass = useMemo(() => {
    if (!form.className) return [];
    return classes
      .filter((c) => c.ClassName === form.className)
      .map((c) => c.Section);
  }, [classes, form.className]);

  const uniqueClassNames = useMemo(
    () => [...new Set(classes.map((c) => c.ClassName))].sort(),
    [classes],
  );

  /* ── exam / subject options filtered by class ── */
  const filteredExams = form.className
    ? exams.filter(
        (ex) => ex.ClassName?.toLowerCase() === form.className.toLowerCase(),
      )
    : exams;

  const filteredSubjects = form.className
    ? subjects.filter(
        (s) => s.ClassName?.toLowerCase() === form.className.toLowerCase(),
      )
    : subjects;

  /* ── add form submit ── */
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

  /* ── results viewer filter logic ── */
  const classOptions = useMemo(
    () => [...new Set(allResults.map((r) => r.ClassName).filter(Boolean))].sort(),
    [allResults],
  );
  const sectionOptions = useMemo(
    () => [...new Set(allResults.map((r) => r.Section).filter(Boolean))].sort(),
    [allResults],
  );

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
        const name = (
          r.StudentName ||
          `${r.FirstName || ""} ${r.LastName || ""}`
        ).toLowerCase();
        const roll = (r.RollNumber || "").toLowerCase();
        if (!name.includes(search) && !roll.includes(search)) return false;
      }
      return true;
    });
  }, [allResults, resultFilters]);

  const isFiltered =
    resultFilters.className || resultFilters.section || resultFilters.search;

  /* ── open edit modal ── */
  const openEdit = (row) => {
    setEditRow(row);
    setEditMarks(String(row.MarksObtained));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Record and review student examination results
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      {/* ── Add result form ── */}
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
            {/* Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("className")}
              </label>
              <select
                name="className"
                value={form.className}
                onChange={(e) => {
                  setForm((p) => ({
                    ...p,
                    className: e.target.value,
                    section: "",
                    examId: "",
                    subjectId: "",
                    firstName: "",
                    rollNumber: "",
                  }));
                }}
                className="form-input"
                required
              >
                <option value="">Select class</option>
                {uniqueClassNames.map((cn) => (
                  <option key={cn} value={cn}>{cn}</option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("section")}
              </label>
              <select
                name="section"
                value={form.section}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    section: e.target.value,
                    firstName: "",
                    rollNumber: "",
                  }))
                }
                className="form-input"
                required
              >
                <option value="">Select section</option>
                {sectionsForClass.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Student picker — shown once class+section are selected */}
            {canFetchStudents && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Student
                  {studentsLoading && (
                    <span className="ml-2 text-indigo-400 normal-case font-normal">
                      loading…
                    </span>
                  )}
                </label>
                <select
                  value={
                    form.rollNumber
                      ? classStudents.findIndex(
                          (s) => s.RollNumber === form.rollNumber,
                        )
                      : ""
                  }
                  onChange={(e) => {
                    const idx = e.target.value;
                    if (idx === "") {
                      setForm((p) => ({ ...p, firstName: "", rollNumber: "" }));
                      return;
                    }
                    const s = classStudents[Number(idx)];
                    if (s)
                      setForm((p) => ({
                        ...p,
                        firstName: s.FirstName,
                        rollNumber: s.RollNumber,
                      }));
                  }}
                  className="form-input"
                  required
                >
                  <option value="">
                    {studentsLoading
                      ? "Loading students…"
                      : classStudents.length === 0
                      ? "No students in this class/section"
                      : "Select student"}
                  </option>
                  {classStudents.map((s, idx) => (
                    <option key={s.StudentID} value={idx}>
                      {s.FirstName} {s.LastName} — Roll {s.RollNumber}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fallback manual inputs when no class+section selected */}
            {!canFetchStudents && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    {t("firstName")}
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Select class & section first"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    {t("rollNumber")}
                  </label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={form.rollNumber}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Select class & section first"
                    disabled
                  />
                </div>
              </>
            )}

            {/* Exam */}
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

            {/* Subject */}
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
                {filteredSubjects.map((s) => (
                  <option key={s.SubjectID} value={s.SubjectID}>
                    {s.SubjectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Marks obtained */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("marksObtained")}
              </label>
              <input
                type="number"
                name="marksObtained"
                value={form.marksObtained}
                onChange={handleChange}
                className="form-input"
                min={0}
                max={100}
                required
              />
            </div>

            {/* Total marks */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("totalMarks")}
              </label>
              <input
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={handleChange}
                className="form-input"
                min={1}
                required
              />
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

      {/* ── Results viewer ── */}
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
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="table-cell text-center text-slate-400 py-12"
                    >
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
                        key={r.ResultID ?? i}
                        className={`hover:bg-indigo-50/30 transition-colors ${
                          i % 2 === 0 ? "" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="table-cell text-slate-400 text-xs">
                          {i + 1}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                              {(
                                r.StudentName ||
                                r.FirstName ||
                                "?"
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800">
                              {r.StudentName ||
                                `${r.FirstName || ""} ${r.LastName || ""}`}
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
                        <td className="table-cell text-slate-600">
                          {r.Section}
                        </td>
                        <td className="table-cell text-slate-600 text-xs">
                          {r.ExamName}
                        </td>
                        <td className="table-cell text-slate-600 text-xs">
                          {r.SubjectName}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {r.MarksObtained}
                              {r.TotalMarks ? (
                                <span className="text-slate-400 font-normal">
                                  /{r.TotalMarks}
                                </span>
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
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(r)}
                              className="btn-icon edit"
                              title={tCommon("edit")}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    t("deleteConfirm") ||
                                      "Delete this result?",
                                  )
                                )
                                  remove.mutate(r.ResultID);
                              }}
                              className="btn-icon delete"
                              title={tCommon("delete")}
                              disabled={!r.ResultID}
                            >
                              <FiTrash2 />
                            </button>
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

      {/* ── Edit modal ── */}
      {editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FiEdit2 className="text-indigo-600 text-sm" />
                </div>
                <h2 className="text-base font-semibold text-slate-800">
                  Edit Result
                </h2>
              </div>
              <button
                onClick={() => setEditRow(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FiX />
              </button>
            </div>

            {/* Info */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-700">Student:</span>{" "}
                {editRow.StudentName ||
                  `${editRow.FirstName || ""} ${editRow.LastName || ""}`}{" "}
                <span className="font-mono text-xs text-slate-400">
                  (Roll: {editRow.RollNumber})
                </span>
              </p>
              <p>
                <span className="font-medium text-slate-700">Class:</span>{" "}
                {editRow.ClassName} – {editRow.Section}
              </p>
              <p>
                <span className="font-medium text-slate-700">Exam:</span>{" "}
                {editRow.ExamName}
              </p>
              <p>
                <span className="font-medium text-slate-700">Subject:</span>{" "}
                {editRow.SubjectName}
              </p>
            </div>

            {/* Marks input */}
            <div className="px-6 py-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Marks Obtained
              </label>
              <input
                type="number"
                value={editMarks}
                onChange={(e) => setEditMarks(e.target.value)}
                className="form-input"
                min={0}
                max={100}
                autoFocus
              />
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                className="btn-primary flex items-center gap-2"
                disabled={edit.isPending || !editRow.ResultID}
                onClick={() =>
                  edit.mutate({ id: editRow.ResultID, marks: editMarks })
                }
              >
                <FiSave className="text-sm" />
                {edit.isPending ? "Saving…" : "Save Changes"}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setEditRow(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
