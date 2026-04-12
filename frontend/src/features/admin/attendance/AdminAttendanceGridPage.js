"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";

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
      return r.ClassName === submitted.className && r.Section === submitted.section;
    }) ?? [];

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "present": return "bg-green-100 text-green-700";
      case "absent": return "bg-red-100 text-red-700";
      case "late": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("title")}</h1>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("class")}</label>
            <input
              type="text"
              value={filter.className}
              onChange={(e) => setFilter((p) => ({ ...p, className: e.target.value }))}
              className="form-input"
              placeholder={t("className")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{t("section")}</label>
            <input
              type="text"
              value={filter.section}
              onChange={(e) => setFilter((p) => ({ ...p, section: e.target.value }))}
              className="form-input"
              placeholder={t("section")}
            />
          </div>
          <button onClick={() => setSubmitted({ ...filter })} className="btn-primary">
            {t("search")}
          </button>
        </div>
      </div>

      {isLoading && <p className="text-gray-500">{t("loading")}</p>}

      {filtered.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="table-header">{t("student")}</th>
                  <th className="table-header">{t("date")}</th>
                  <th className="table-header">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{r.StudentName || r.StudentID}</td>
                    <td className="table-cell">
                      {r.AttendanceDate
                        ? new Date(r.AttendanceDate).toLocaleDateString()
                        : r.ClassDate || "–"}
                    </td>
                    <td className="table-cell">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor(r.Status)}`}>
                        {r.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        submitted && !isLoading && (
          <p className="text-center py-8 text-gray-500">{t("noRecords")}</p>
        )
      )}
    </div>
  );
}
