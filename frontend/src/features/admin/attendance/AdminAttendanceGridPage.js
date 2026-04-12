"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import {
  FiSearch,
  FiUserCheck,
  FiUser,
  FiClock,
  FiUsers,
  FiFilter,
} from "react-icons/fi";

const STATUS_CONFIG = {
  present: {
    label: "Present",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  absent: {
    label: "Absent",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  late: {
    label: "Late",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
};

function StatusBadge({ status }) {
  const key = status?.toLowerCase();
  const cfg = STATUS_CONFIG[key] ?? {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, colorClass, bgClass }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass}`}
      >
        <Icon className={`text-xl ${colorClass}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="h-4 bg-slate-200 rounded w-48 animate-pulse" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100">
          <div className="h-4 bg-slate-100 rounded w-8 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded flex-1 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-24 animate-pulse" />
          <div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function AdminAttendanceGridPage() {
  const t = useTranslations("admin.attendance");

  const [filter, setFilter] = useState({ className: "", section: "" });
  const [submitted, setSubmitted] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.attendance.all,
    queryFn: attendanceService.getAll,
    select: (d) => (Array.isArray(d) ? d : (d?.data ?? [])),
    enabled: !!submitted,
  });

  const allFiltered = useMemo(() => {
    if (!submitted || !data) return [];
    return data.filter(
      (r) =>
        r.ClassName === submitted.className && r.Section === submitted.section,
    );
  }, [data, submitted]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return allFiltered;
    return allFiltered.filter((r) => r.Status?.toLowerCase() === statusFilter);
  }, [allFiltered, statusFilter]);

  const stats = useMemo(
    () => ({
      total: allFiltered.length,
      present: allFiltered.filter((r) => r.Status?.toLowerCase() === "present")
        .length,
      absent: allFiltered.filter((r) => r.Status?.toLowerCase() === "absent")
        .length,
      late: allFiltered.filter((r) => r.Status?.toLowerCase() === "late")
        .length,
    }),
    [allFiltered],
  );

  const handleSearch = () => {
    if (filter.className.trim() && filter.section.trim()) {
      setSubmitted({ ...filter });
      setStatusFilter("all");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "–";

  const hasResults = submitted && !isLoading;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("subtitle") ||
            "Search and view student attendance records by class and section."}
        </p>
      </div>

      {/* Search panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiFilter className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            {t("filterRecords") || "Filter Records"}
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("class") || "Class"}
              </label>
              <input
                type="text"
                value={filter.className}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, className: e.target.value }))
                }
                onKeyDown={handleKeyDown}
                className="form-input"
                placeholder={t("classPlaceholder") || "e.g. Class 8"}
              />
            </div>
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("section") || "Section"}
              </label>
              <input
                type="text"
                value={filter.section}
                onChange={(e) =>
                  setFilter((p) => ({ ...p, section: e.target.value }))
                }
                onKeyDown={handleKeyDown}
                className="form-input"
                placeholder={t("sectionPlaceholder") || "e.g. A"}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={
                !filter.className.trim() || !filter.section.trim() || isLoading
              }
              className="btn-primary gap-2"
            >
              <FiSearch className="text-xs" />
              {isLoading
                ? t("loading") || "Searching…"
                : t("search") || "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && <TableSkeleton />}

      {/* Results */}
      {hasResults && allFiltered.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FiUsers}
              label={t("totalRecords") || "Total Records"}
              value={stats.total}
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50"
            />
            <StatCard
              icon={FiUserCheck}
              label={t("present") || "Present"}
              value={stats.present}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />
            <StatCard
              icon={FiUser}
              label={t("absent") || "Absent"}
              value={stats.absent}
              colorClass="text-red-600"
              bgClass="bg-red-50"
            />
            <StatCard
              icon={FiClock}
              label={t("late") || "Late"}
              value={stats.late}
              colorClass="text-amber-600"
              bgClass="bg-amber-50"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
              <div>
                <span className="font-semibold text-slate-800">
                  {submitted.className} &mdash; {t("section") || "Section"}{" "}
                  {submitted.section}
                </span>
                <span className="ml-2 text-sm text-slate-400">
                  ({filtered.length} {t("records") || "records"})
                </span>
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {[
                  { key: "all", label: t("all") || "All", count: stats.total },
                  {
                    key: "present",
                    label: t("present") || "Present",
                    count: stats.present,
                  },
                  {
                    key: "absent",
                    label: t("absent") || "Absent",
                    count: stats.absent,
                  },
                  {
                    key: "late",
                    label: t("late") || "Late",
                    count: stats.late,
                  },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      statusFilter === tab.key
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                        statusFilter === tab.key
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="table-header w-12">#</th>
                    <th className="table-header">
                      {t("student") || "Student"}
                    </th>
                    <th className="table-header">{t("date") || "Date"}</th>
                    <th className="table-header">{t("status") || "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}
                    >
                      <td className="table-cell text-slate-400 text-xs">
                        {i + 1}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                            {(r.StudentName || String(r.StudentID || "?"))
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">
                            {r.StudentName || r.StudentID}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell text-slate-600 whitespace-nowrap">
                        {fmtDate(r.AttendanceDate || r.ClassDate)}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={r.Status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-sm">
                {t("noRecordsForFilter") ||
                  "No records match the selected filter."}
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state after search */}
      {hasResults && allFiltered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <FiSearch className="text-slate-400 text-xl" />
          </div>
          <p className="font-medium text-slate-700">
            {t("noRecords") || "No records found"}
          </p>
          <p className="text-sm text-slate-400">
            {t("noRecordsHint") ||
              `No attendance records found for ${submitted.className} – Section ${submitted.section}.`}
          </p>
        </div>
      )}

      {/* Initial state */}
      {!submitted && !isLoading && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
            <FiUserCheck className="text-indigo-400 text-xl" />
          </div>
          <p className="font-medium text-slate-600">
            {t("searchPrompt") || "Search to view attendance records"}
          </p>
          <p className="text-sm text-slate-400">
            {t("searchPromptHint") ||
              "Enter a class and section above, then click Search."}
          </p>
        </div>
      )}
    </div>
  );
}
