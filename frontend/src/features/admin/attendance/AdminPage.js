"use client";

import { useState } from "react";
import { attendanceService } from "@/services/attendance.service";
import { studentsService } from "@/services/students.service";
import { useTranslations } from "@/store/languageStore";
import "@/styles/AttendancePage.css";

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
    <div className="admin-attendance-page">
      <h1>{t("markTitle")}</h1>
      {status.error && <div className="error-message">{status.error}</div>}
      {status.success && (
        <div className="success-message">{status.success}</div>
      )}
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {FIELDS.map(([n, l, type]) => (
            <div key={n}>
              <label
                style={{ fontSize: 14, fontWeight: 500, display: "block" }}
              >
                {l}
              </label>
              <input
                type={type}
                value={filter[n]}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, [n]: e.target.value }))
                }
                className="form-input"
                style={{ marginTop: 4 }}
                placeholder={l}
              />
            </div>
          ))}
          <button
            onClick={loadStudents}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? t("loading") : t("loadStudents")}
          </button>
        </div>
      </div>
      {students.length > 0 && (
        <div
          style={{
            background: "#fff",
            padding: 24,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2>
              {students.length} {t("student")} – {filter.className} {filter.section} –{" "}
              {filter.date}
            </h2>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={saving}
            >
              {saving ? t("saving") : t("saveAttendance")}
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th className="table-header">{t("roll")}</th>
                <th className="table-header">{t("name")}</th>
                <th className="table-header">{t("present")}</th>
                <th className="table-header">{t("absent")}</th>
                <th className="table-header">{t("late")}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.StudentID}>
                  <td className="table-cell">{s.RollNumber}</td>
                  <td className="table-cell">
                    {s.FirstName} {s.LastName}
                  </td>
                  {["Present", "Absent", "Late"].map((stat) => (
                    <td
                      key={stat}
                      className="table-cell"
                      style={{ textAlign: "center" }}
                    >
                      <input
                        type="radio"
                        name={`att-${s.StudentID}`}
                        value={stat}
                        checked={attendance[s.StudentID] === stat}
                        onChange={() =>
                          setAttendance((p) => ({ ...p, [s.StudentID]: stat }))
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
