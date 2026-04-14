"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { studentsService } from "@/services/students.service";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import { FiSearch, FiSave, FiUsers } from "react-icons/fi";

export default function AdminPage() {
  const t = useTranslations("admin.attendance");

  const [filter, setFilter] = useState({
    className: "",
    section: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ error: "", success: "" });

  // Load distinct classes for dropdowns
  const { data: distinctClasses = [] } = useQuery({
    queryKey: queryKeys.classes.distinct,
    queryFn: classesService.getDistinct,
    select: (d) => d?.data ?? d ?? [],
  });

  // Unique class names for the class dropdown
  const classNames = useMemo(
    () => [...new Set(distinctClasses.map((c) => c.ClassName))].sort(),
    [distinctClasses],
  );

  // Sections available for the selected class
  const availableSections = useMemo(
    () =>
      distinctClasses
        .filter((c) => c.ClassName === filter.className)
        .map((c) => c.Section)
        .sort(),
    [distinctClasses, filter.className],
  );

  const flash = (m, e = false) => {
    setStatus(e ? { error: m, success: "" } : { error: "", success: m });
    setTimeout(() => setStatus({ error: "", success: "" }), 4000);
  };

  const handleClassChange = (e) => {
    const cls = e.target.value;
    const sections = distinctClasses
      .filter((c) => c.ClassName === cls)
      .map((c) => c.Section)
      .sort();
    setFilter((p) => ({
      ...p,
      className: cls,
      section: sections.length === 1 ? sections[0] : "",
    }));
    setStudents([]);
    setAttendance({});
  };

  const handleSectionChange = (e) => {
    setFilter((p) => ({ ...p, section: e.target.value }));
    setStudents([]);
    setAttendance({});
  };

  const loadStudents = async () => {
    if (!filter.className || !filter.section) {
      flash(t("classAndSectionRequired"), true);
      return;
    }
    setLoading(true);
    try {
      const res = await studentsService.getByClassSection(
        filter.className,
        filter.section,
      );
      const list = res?.data ?? res ?? [];
      setStudents(list);
      const init = {};
      list.forEach((s) => {
        init[s.StudentID] = "Present";
      });
      setAttendance(init);
    } catch (err) {
      flash(err.message || t("loadFailed"), true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (students.length === 0) {
      flash(t("noStudentsLoaded"), true);
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        students.map((s) =>
          attendanceService.upsertCell(
            s.StudentID,
            filter.date,
            attendance[s.StudentID] || "Absent",
          ),
        ),
      );
      flash(t("attendanceSaved"));
    } catch (err) {
      flash(err.message || t("saveFailed"), true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("markTitle")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Mark daily attendance for a class and section
        </p>
      </div>

      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}

      {/* Filter form card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiSearch className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {t("loadStudents")}
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Class dropdown */}
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("className")}
              </label>
              <select
                value={filter.className}
                onChange={handleClassChange}
                className="form-input"
              >
                <option value="">{t("className")}</option>
                {classNames.map((cn) => (
                  <option key={cn} value={cn}>
                    {cn}
                  </option>
                ))}
              </select>
            </div>

            {/* Section dropdown */}
            <div className="flex-1 min-w-28">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("section")}
              </label>
              <select
                value={filter.section}
                onChange={handleSectionChange}
                className="form-input"
                disabled={!filter.className}
              >
                <option value="">{t("section")}</option>
                {availableSections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Date input */}
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("date")}
              </label>
              <input
                type="date"
                value={filter.date}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, date: e.target.value }))
                }
                className="form-input"
              />
            </div>

            <button
              onClick={loadStudents}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? t("loading") : t("loadStudents")}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance table card */}
      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <FiUsers className="text-slate-600 text-sm" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  {filter.className} &mdash; {filter.section}
                </h2>
                <p className="text-xs text-slate-400">
                  {students.length} {t("student")} &bull; {filter.date}
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={saving}
            >
              <FiSave className="text-sm" />
              {saving ? t("saving") : t("saveAttendance")}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="table-header">{t("roll")}</th>
                  <th className="table-header">{t("name")}</th>
                  <th className="table-header text-center">{t("present")}</th>
                  <th className="table-header text-center">{t("absent")}</th>
                  <th className="table-header text-center">{t("late")}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr
                    key={s.StudentID}
                    className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                  >
                    <td className="table-cell font-mono text-slate-500 text-xs">
                      {s.RollNumber}
                    </td>
                    <td className="table-cell font-medium text-slate-800">
                      {s.FirstName} {s.LastName}
                    </td>
                    {["Present", "Absent", "Late"].map((stat) => (
                      <td key={stat} className="table-cell text-center">
                        <input
                          type="radio"
                          name={`att-${s.StudentID}`}
                          value={stat}
                          checked={attendance[s.StudentID] === stat}
                          onChange={() =>
                            setAttendance((p) => ({
                              ...p,
                              [s.StudentID]: stat,
                            }))
                          }
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {students.length === 0 && filter.className && filter.section && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <FiUsers className="mx-auto text-4xl text-slate-300 mb-3" />
          <p className="text-slate-500 text-sm">
            Click &ldquo;{t("loadStudents")}&rdquo; to load students for{" "}
            {filter.className} &mdash; {filter.section}
          </p>
        </div>
      )}
    </div>
  );
}
