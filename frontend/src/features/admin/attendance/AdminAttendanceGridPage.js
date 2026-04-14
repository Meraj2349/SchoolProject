"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

// Status cycle: clicking a cell rotates through Present → Absent → Late
const STATUS_CYCLE = ["Present", "Absent", "Late"];

const STATUS_CONFIG = {
  Present: {
    label: "P",
    bg: "bg-emerald-100 hover:bg-emerald-200",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  Absent: {
    label: "A",
    bg: "bg-red-100 hover:bg-red-200",
    text: "text-red-700",
    border: "border-red-300",
  },
  Late: {
    label: "L",
    bg: "bg-amber-100 hover:bg-amber-200",
    text: "text-amber-700",
    border: "border-amber-300",
  },
};

const EMPTY_CONFIG = {
  label: "–",
  bg: "bg-slate-50 hover:bg-slate-100",
  text: "text-slate-400",
  border: "border-slate-200",
};

function getMonthRange(year, month) {
  const end = new Date(year, month + 1, 0);
  const pad = (n) => String(n).padStart(2, "0");
  return {
    startDate: `${year}-${pad(month + 1)}-01`,
    endDate: `${year}-${pad(month + 1)}-${pad(end.getDate())}`,
  };
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
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3 px-4 py-3 border-b border-slate-100">
          <div className="h-4 bg-slate-100 rounded w-10 animate-pulse shrink-0" />
          <div className="h-4 bg-slate-100 rounded w-32 animate-pulse shrink-0" />
          {[...Array(8)].map((__, j) => (
            <div
              key={j}
              className="h-6 bg-slate-100 rounded w-7 animate-pulse shrink-0"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AdminAttendanceGridPage() {
  const t = useTranslations("admin.attendance");
  const qc = useQueryClient();

  const today = new Date();
  const [filter, setFilter] = useState({ className: "", section: "" });
  const [submitted, setSubmitted] = useState(null);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const { startDate, endDate } = useMemo(
    () => getMonthRange(year, month),
    [year, month],
  );

  const queryKey = useMemo(
    () =>
      submitted
        ? queryKeys.attendance.grid(
            submitted.className,
            submitted.section,
            startDate,
            endDate,
          )
        : null,
    [submitted, startDate, endDate],
  );

  const { data, isLoading } = useQuery({
    queryKey: queryKey ?? ["attendance", "grid", "noop"],
    queryFn: () =>
      attendanceService.getGrid(
        submitted.className,
        submitted.section,
        startDate,
        endDate,
      ),
    select: (d) => d?.data ?? d,
    enabled: !!submitted,
  });

  const students = useMemo(() => data?.students ?? [], [data]);
  const dates = useMemo(() => data?.dates ?? [], [data]);

  // useMutation to upsert a single cell
  const upsert = useMutation({
    mutationFn: ({ studentId, classDate, status }) =>
      attendanceService.upsertCell(studentId, classDate, status),
    onSuccess: () => {
      if (queryKey) qc.invalidateQueries({ queryKey });
    },
  });

  const handleCellClick = useCallback(
    (studentId, date, currentStatus) => {
      const idx = STATUS_CYCLE.indexOf(currentStatus);
      const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      upsert.mutate({ studentId, classDate: date, status: nextStatus });
    },
    [upsert],
  );

  const handleSearch = () => {
    if (filter.className.trim() && filter.section.trim()) {
      setSubmitted({ ...filter });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Compute summary stats from the loaded grid
  const stats = useMemo(() => {
    let present = 0,
      absent = 0,
      late = 0,
      total = 0;
    for (const student of students) {
      for (const date of dates) {
        const status = student.attendance?.[date];
        if (!status) continue;
        total++;
        if (status === "Present") present++;
        else if (status === "Absent") absent++;
        else if (status === "Late") late++;
      }
    }
    return { total, present, absent, late };
  }, [students, dates]);

  const hasResults = submitted && !isLoading && students.length > 0;
  const hasNoResults = submitted && !isLoading && students.length === 0;

  // Format date column header: show day number only
  const fmtColHeader = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return String(d.getDate()).padStart(2, "0");
  };

  // Day-of-week abbreviation for column sub-header
  const fmtDayName = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()];
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("subtitle") ||
            "View and edit monthly attendance for any class and section. Click a cell to cycle through Present / Absent / Late."}
        </p>
      </div>

      {/* Search + month navigation panel */}
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
            {/* Class input */}
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

            {/* Section input */}
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

            {/* Month navigator */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Month
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="btn-icon edit p-2"
                  title="Previous month"
                >
                  <FiChevronLeft />
                </button>
                <span className="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg min-w-32 text-center">
                  {MONTH_NAMES[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="btn-icon edit p-2"
                  title="Next month"
                >
                  <FiChevronRight />
                </button>
              </div>
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
                ? t("loading") || "Loading…"
                : t("search") || "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && <TableSkeleton />}

      {/* Stats row */}
      {hasResults && (
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
      )}

      {/* Attendance grid table */}
      {hasResults && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="font-semibold text-slate-800">
                {submitted.className} &mdash; Section {submitted.section}
              </span>
              <span className="ml-2 text-sm text-slate-400">
                &bull; {MONTH_NAMES[month]} {year} &bull; {students.length}{" "}
                students &bull; {dates.length} days recorded
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {["Present", "Absent", "Late"].map((s) => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <span key={s} className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>
                    <span>{s}</span>
                  </span>
                );
              })}
              <span className="text-slate-400">
                (click cell to change)
              </span>
            </div>
          </div>

          {dates.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No attendance records for {MONTH_NAMES[month]} {year}. Use the
              Mark Attendance page to add records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs" style={{ minWidth: "100%" }}>
                <thead>
                  <tr className="bg-slate-50">
                    <th className="table-header sticky left-0 bg-slate-50 z-10 min-w-8 text-center">
                      #
                    </th>
                    <th className="table-header sticky left-8 bg-slate-50 z-10 min-w-36 text-left">
                      Student
                    </th>
                    <th className="table-header sticky bg-slate-50 z-10 min-w-12 text-center">
                      Roll
                    </th>
                    {dates.map((d) => (
                      <th
                        key={d}
                        className="table-header text-center min-w-8 px-1"
                      >
                        <div className="font-bold">{fmtColHeader(d)}</div>
                        <div className="text-slate-400 font-normal text-[10px]">
                          {fmtDayName(d)}
                        </div>
                      </th>
                    ))}
                    <th className="table-header text-center min-w-16">
                      Present
                    </th>
                    <th className="table-header text-center min-w-14">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student, i) => {
                    const presentCount = dates.filter(
                      (d) => student.attendance?.[d] === "Present",
                    ).length;
                    const totalDays = dates.filter(
                      (d) => student.attendance?.[d],
                    ).length;
                    const pct =
                      totalDays > 0
                        ? Math.round((presentCount / totalDays) * 100)
                        : null;

                    return (
                      <tr
                        key={student.StudentID}
                        className={`hover:bg-indigo-50/20 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}
                      >
                        {/* Row number */}
                        <td className="table-cell text-center text-slate-400 sticky left-0 bg-inherit">
                          {i + 1}
                        </td>

                        {/* Student name */}
                        <td className="table-cell sticky font-medium text-slate-800 bg-inherit">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                              {student.FirstName?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="truncate max-w-28">
                              {student.FirstName} {student.LastName}
                            </span>
                          </div>
                        </td>

                        {/* Roll number */}
                        <td className="table-cell text-center text-slate-500 font-mono bg-inherit sticky">
                          {student.RollNumber}
                        </td>

                        {/* Attendance cells */}
                        {dates.map((date) => {
                          const status = student.attendance?.[date] ?? null;
                          const cfg = status
                            ? STATUS_CONFIG[status] ?? EMPTY_CONFIG
                            : EMPTY_CONFIG;
                          return (
                            <td
                              key={date}
                              className="px-0.5 py-1 text-center"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleCellClick(
                                    student.StudentID,
                                    date,
                                    status ?? "Late",
                                  )
                                }
                                disabled={upsert.isPending}
                                title={`${student.FirstName} ${student.LastName} — ${date}: ${status ?? "not set"}`}
                                className={`w-7 h-7 rounded border text-xs font-bold cursor-pointer transition-colors ${cfg.bg} ${cfg.text} ${cfg.border} disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {cfg.label}
                              </button>
                            </td>
                          );
                        })}

                        {/* Present count */}
                        <td className="table-cell text-center">
                          <span className="font-semibold text-slate-700">
                            {presentCount}
                            <span className="text-slate-400 font-normal">
                              /{totalDays}
                            </span>
                          </span>
                        </td>

                        {/* Percentage */}
                        <td className="table-cell text-center">
                          {pct !== null ? (
                            <span
                              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                                pct >= 80
                                  ? "bg-emerald-100 text-emerald-700"
                                  : pct >= 60
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-slate-300">–</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty state: no records found for this class/section/month */}
      {hasNoResults && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <FiSearch className="text-slate-400 text-xl" />
          </div>
          <p className="font-medium text-slate-700">
            {t("noRecords") || "No records found"}
          </p>
          <p className="text-sm text-slate-400 text-center max-w-sm">
            No students found for {submitted.className} – Section{" "}
            {submitted.section}. Verify the class name and section, or add
            students first.
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
            {t("searchPrompt") || "Search to view the attendance grid"}
          </p>
          <p className="text-sm text-slate-400 text-center max-w-sm">
            {t("searchPromptHint") ||
              "Enter a class and section, choose a month, then click Search. Each cell shows P (Present), A (Absent), or L (Late). Click any cell to update it."}
          </p>
        </div>
      )}
    </div>
  );
}
