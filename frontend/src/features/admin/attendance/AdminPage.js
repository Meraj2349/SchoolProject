"use client";

import { useState } from "react";
import { attendanceService } from "@/services/attendance.service";
import { studentsService } from "@/services/students.service";
import { useTranslations } from "@/store/languageStore";

export default function AdminPage() {
  const t = useTranslations("admin.attendance");

  const [filter, setFilter] = useState({
    className: "", section: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ error: "", success: "" });

  const flash = (m, e = false) => {
    setStatus(e ? { error: m, success: "" } : { error: "", success: m });
    setTimeout(() => setStatus({ error: "", success: "" }), 4000);
  };

  const loadStudents = async () => {
    if (!filter.className || !filter.section) {
      flash(t("classAndSectionRequired"), true);
      return;
    }
    setLoading(true);
    try {
      const res = await studentsService.getByClassSection(filter.className, filter.section);
      const list = res?.data ?? res ?? [];
      setStudents(list);
      const init = {};
      list.forEach((s) => { init[s.StudentID] = "Present"; });
      setAttendance(init);
    } catch (err) {
      flash(err.message || t("loadFailed"), true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (students.length === 0) { flash(t("noStudentsLoaded"), true); return; }
    setSaving(true);
    try {
      const records = students.map((s) => ({
        StudentID: s.StudentID,
        Status: attendance[s.StudentID] || "Absent",
        AttendanceDate: filter.date,
        ClassName: filter.className,
        Section: filter.section,
      }));
      await attendanceService.bulkCreate(records);
      flash(t("attendanceSaved"));
    } catch (err) {
      flash(err.message || t("saveFailed"), true);
    } finally {
      setSaving(false);
    }
  };

  const FIELDS = [
    ["className", t("className"), "text"],
    ["section", t("section"), "text"],
    ["date", t("date"), "date"],
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("markTitle")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && <div className="success-message">{status.success}</div>}

      {/* Filter form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {FIELDS.map(([n, l, type]) => (
            <div key={n}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{l}</label>
              <input
                type={type}
                value={filter[n]}
                onChange={(e) => setFilter((p) => ({ ...p, [n]: e.target.value }))}
                className="form-input"
                placeholder={l}
              />
            </div>
          ))}
          <button onClick={loadStudents} className="btn-primary" disabled={loading}>
            {loading ? t("loading") : t("loadStudents")}
          </button>
        </div>
      </div>

      {/* Attendance table */}
      {students.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-700">
              {students.length} {t("student")} – {filter.className} {filter.section} – {filter.date}
            </h2>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
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
                {students.map((s) => (
                  <tr key={s.StudentID} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">{s.RollNumber}</td>
                    <td className="table-cell font-medium">{s.FirstName} {s.LastName}</td>
                    {["Present", "Absent", "Late"].map((stat) => (
                      <td key={stat} className="table-cell text-center">
                        <input
                          type="radio"
                          name={`att-${s.StudentID}`}
                          value={stat}
                          checked={attendance[s.StudentID] === stat}
                          onChange={() => setAttendance((p) => ({ ...p, [s.StudentID]: stat }))}
                          className="w-4 h-4 accent-blue-600 cursor-pointer"
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
    </div>
  );
}
