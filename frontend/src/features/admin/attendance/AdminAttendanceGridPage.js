"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import "@/styles/AttendancePageGrid.css";

export default function AdminAttendanceGridPage() {
  const t = useTranslations("admin.attendance");

  const [filter, setFilter] = useState({ className: "", section: "" });
  const [submitted, setSubmitted] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.attendance.all,
    queryFn: attendanceService.getAll,
    select: (d) => (Array.isArray(d) ? d : (d?.data ?? [])),
    enabled: !!submitted,
  });

  const filtered =
    data?.filter((r) => {
      if (!submitted) return false;
      return (
        r.ClassName === submitted.className && r.Section === submitted.section
      );
    }) ?? [];

  return (
    <div className="attendance-grid-page">
      <h1>{t("title")}</h1>
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, display: "block" }}>
              {t("class")}
            </label>
            <input
              type="text"
              value={filter.className}
              onChange={(e) =>
                setFilter((p) => ({ ...p, className: e.target.value }))
              }
              className="form-input"
              style={{ marginTop: 4 }}
              placeholder={t("className")}
            />
          </div>
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, display: "block" }}>
              {t("section")}
            </label>
            <input
              type="text"
              value={filter.section}
              onChange={(e) =>
                setFilter((p) => ({ ...p, section: e.target.value }))
              }
              className="form-input"
              style={{ marginTop: 4 }}
              placeholder={t("section")}
            />
          </div>
          <button
            onClick={() => setSubmitted({ ...filter })}
            className="btn-primary"
          >
            {t("search")}
          </button>
        </div>
      </div>
      {isLoading && <p>{t("loading")}</p>}
      {filtered.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
            }}
          >
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                <th className="table-header">{t("student")}</th>
                <th className="table-header">{t("date")}</th>
                <th className="table-header">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td className="table-cell">{r.StudentName || r.StudentID}</td>
                  <td className="table-cell">
                    {r.AttendanceDate
                      ? new Date(r.AttendanceDate).toLocaleDateString()
                      : r.ClassDate || "–"}
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${r.Status?.toLowerCase()}`}>
                      {r.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        submitted &&
        !isLoading && <p className="no-data">{t("noRecords")}</p>
      )}
    </div>
  );
}
