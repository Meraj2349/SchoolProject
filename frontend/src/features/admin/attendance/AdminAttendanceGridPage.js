"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { classesService } from "@/services/classes.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
import {
  FiSearch,
  FiUserCheck,
  FiUser,
  FiUsers,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiPrinter,
  FiAlertTriangle,
  FiCalendar,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_CONFIG = {
  Present: {
    label: "P",
    cell: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    count: "text-emerald-700",
  },
  Absent: {
    label: "A",
    cell: "bg-red-100 hover:bg-red-200 text-red-700 border-red-200",
    badge: "bg-red-100 text-red-700",
    count: "text-red-600",
  },
  Late: {
    label: "L",
    cell: "bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    count: "text-amber-600",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate all YYYY-MM-DD strings for the given month */
function generateMonthDays(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const pad = (n) => String(n).padStart(2, "0");
  return Array.from({ length: daysInMonth }, (_, i) =>
    `${year}-${pad(month + 1)}-${pad(i + 1)}`
  );
}

function getMonthRange(year, month) {
  const pad = (n) => String(n).padStart(2, "0");
  const endDay = new Date(year, month + 1, 0).getDate();
  return {
    startDate: `${year}-${pad(month + 1)}-01`,
    endDate: `${year}-${pad(month + 1)}-${pad(endDay)}`,
  };
}

/** Bangladesh weekends: Friday (5) and Saturday (6) */
function isWeekend(dateStr) {
  const day = new Date(dateStr + "T00:00:00").getDay();
  return day === 5 || day === 6;
}

function getDayAbbr(dateStr) {
  const day = new Date(dateStr + "T00:00:00").getDay();
  return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][day];
}

function getLocalDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, colorClass, bgClass, warn }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 ${warn ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bgClass}`}>
        <Icon className={`text-xl ${colorClass}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-bold leading-tight ${warn ? "text-red-700" : "text-slate-800"}`}>
          {value}
        </p>
        <p className="text-sm text-slate-500 truncate">{label}</p>
        {sub != null && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
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
        <div key={i} className="flex gap-2 px-4 py-2.5 border-b border-slate-100">
          <div className="h-4 bg-slate-100 rounded w-8 animate-pulse shrink-0" />
          <div className="h-4 bg-slate-100 rounded w-36 animate-pulse shrink-0" />
          {[...Array(12)].map((__, j) => (
            <div key={j} className="h-6 bg-slate-100 rounded w-7 animate-pulse shrink-0" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminAttendanceGridPage() {
  const t = useTranslations("admin.attendance");

  const todayStr = getLocalDateStr();
  const todayDate = new Date();

  const [filter, setFilter] = useState({ className: "", section: "" });
  const [submitted, setSubmitted] = useState(null);
  const [month, setMonth] = useState(todayDate.getMonth());
  const [year, setYear] = useState(todayDate.getFullYear());
  const [nameSearch, setNameSearch] = useState("");

  // ── Distinct classes for dropdowns ────────────────────────────────────
  const { data: distinctClasses = [] } = useQuery({
    queryKey: queryKeys.classes.distinct,
    queryFn: classesService.getDistinct,
    select: (d) => d?.data ?? d ?? [],
  });

  const classNames = useMemo(
    () => [...new Set(distinctClasses.map((c) => c.ClassName))].sort(),
    [distinctClasses],
  );

  const availableSections = useMemo(
    () =>
      distinctClasses
        .filter((c) => c.ClassName === filter.className)
        .map((c) => c.Section)
        .sort(),
    [distinctClasses, filter.className],
  );

  // ── Month / date helpers ──────────────────────────────────────────────
  const { startDate, endDate } = useMemo(
    () => getMonthRange(year, month),
    [year, month],
  );
  const allDays = useMemo(() => generateMonthDays(year, month), [year, month]);
  const schoolDays = useMemo(
    () => allDays.filter((d) => !isWeekend(d)),
    [allDays],
  );

  // ── Grid data query ───────────────────────────────────────────────────
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

  // ── Filtered student list (name / roll search) ────────────────────────
  const filteredStudents = useMemo(() => {
    if (!nameSearch.trim()) return students;
    const q = nameSearch.toLowerCase();
    return students.filter(
      (s) =>
        `${s.FirstName} ${s.LastName}`.toLowerCase().includes(q) ||
        (s.RollNumber ?? "").toLowerCase().includes(q),
    );
  }, [students, nameSearch]);

  // ── Summary stats (top cards) ─────────────────────────────────────────
  const summaryStats = useMemo(() => {
    if (!students.length) return null;

    const todayInMonth = todayStr >= startDate && todayStr <= endDate;
    const presentToday = todayInMonth
      ? students.filter((s) => s.attendance?.[todayStr] === "Present").length
      : null;
    const absentToday = todayInMonth
      ? students.filter((s) => s.attendance?.[todayStr] === "Absent").length
      : null;

    // Monthly average: total present school-day records / (students × school days)
    let totalPresent = 0;
    for (const s of students) {
      for (const d of schoolDays) {
        if (s.attendance?.[d] === "Present") totalPresent++;
      }
    }
    const avgPct =
      schoolDays.length > 0
        ? Math.round(
            (totalPresent / (students.length * schoolDays.length)) * 100,
          )
        : null;

    return { presentToday, absentToday, avgPct };
  }, [students, todayStr, startDate, endDate, schoolDays]);

  // ── Per-student summary ───────────────────────────────────────────────
  const studentSummary = (student) => {
    const present = schoolDays.filter(
      (d) => student.attendance?.[d] === "Present",
    ).length;
    const absent = schoolDays.filter(
      (d) => student.attendance?.[d] === "Absent",
    ).length;
    const late = schoolDays.filter(
      (d) => student.attendance?.[d] === "Late",
    ).length;
    const marked = present + absent + late;
    const pct = marked > 0 ? Math.round((present / marked) * 100) : null;
    return { present, absent, late, marked, pct };
  };

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleClassChange = (e) => {
    const cls = e.target.value;
    const sections = distinctClasses
      .filter((c) => c.ClassName === cls)
      .map((c) => c.Section)
      .sort();
    setFilter({ className: cls, section: sections.length === 1 ? sections[0] : "" });
    setSubmitted(null);
    setNameSearch("");
  };

  const handleSectionChange = (e) => {
    setFilter((p) => ({ ...p, section: e.target.value }));
    setSubmitted(null);
    setNameSearch("");
  };

  const handleSearch = () => {
    if (filter.className && filter.section) {
      setSubmitted({ ...filter });
      setNameSearch("");
    }
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  // ── Export: Excel ─────────────────────────────────────────────────────
  const exportExcel = async () => {
    const [XLSX, { saveAs }] = await Promise.all([
      import("xlsx").then((m) => m),
      import("file-saver"),
    ]);

    const dayHeaders = allDays.map((d) => {
      const date = new Date(d + "T00:00:00");
      return `${date.getDate()}(${getDayAbbr(d)})`;
    });

    const headers = [
      "#", "Roll", "Student Name",
      ...dayHeaders,
      "Present", "Absent", "Late", "Marked Days", "Attendance %",
    ];

    const rows = filteredStudents.map((s, i) => {
      const cells = allDays.map((d) => {
        if (isWeekend(d)) return "WE";
        const status = s.attendance?.[d];
        return status ? status.charAt(0) : "–";
      });
      const { present, absent, late, marked, pct } = studentSummary(s);
      return [
        i + 1,
        s.RollNumber,
        `${s.FirstName} ${s.LastName}`,
        ...cells,
        present,
        absent,
        late,
        marked,
        pct !== null ? `${pct}%` : "–",
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Column widths
    ws["!cols"] = [
      { wch: 4 }, { wch: 10 }, { wch: 24 },
      ...allDays.map(() => ({ wch: 5 })),
      { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `Attendance_${submitted.className.replace(/\s+/g, "_")}_Sec${submitted.section}_${MONTH_NAMES[month]}_${year}.xlsx`,
    );
  };

  // ── Export: Print / PDF ───────────────────────────────────────────────
  const handlePrint = () => {
    const dayColsHtml = allDays
      .map((d) => {
        const date = new Date(d + "T00:00:00");
        const we = isWeekend(d);
        return `<th style="background:${we ? "#e5e7eb" : "#f8fafc"};padding:3px 2px;font-size:9px;min-width:22px;text-align:center">
          ${date.getDate()}<br/><span style="color:#9ca3af;font-weight:normal">${getDayAbbr(d)}</span>
        </th>`;
      })
      .join("");

    const rowsHtml = filteredStudents
      .map((s, i) => {
        const { present, absent, late, pct } = studentSummary(s);
        const isLow = pct !== null && pct < 75;
        const cellsHtml = allDays
          .map((d) => {
            const we = isWeekend(d);
            const status = s.attendance?.[d];
            let bg = "white";
            if (we) bg = "#e5e7eb";
            else if (status === "Present") bg = "#d1fae5";
            else if (status === "Absent") bg = "#fee2e2";
            else if (status === "Late") bg = "#fef3c7";
            const label = we ? "–" : (status ? status.charAt(0) : "–");
            return `<td style="background:${bg};text-align:center;font-size:9px;padding:2px;${we ? "color:#9ca3af" : ""}">${label}</td>`;
          })
          .join("");
        return `
          <tr style="background:${i % 2 ? "#f9fafb" : "white"}">
            <td style="padding:3px 5px;font-size:9px;text-align:center">${i + 1}</td>
            <td style="padding:3px 5px;font-size:9px;font-family:monospace">${s.RollNumber}</td>
            <td style="padding:3px 8px;font-size:9px;white-space:nowrap">${s.FirstName} ${s.LastName}</td>
            ${cellsHtml}
            <td style="text-align:center;font-size:9px;color:#059669;font-weight:600">${present}</td>
            <td style="text-align:center;font-size:9px;color:#dc2626;font-weight:600">${absent}</td>
            <td style="text-align:center;font-size:9px;color:#d97706;font-weight:600">${late}</td>
            <td style="text-align:center;font-size:9px;font-weight:700;${isLow ? "color:red" : pct >= 85 ? "color:#059669" : "color:#d97706"}">
              ${pct !== null ? pct + "%" : "–"}
            </td>
          </tr>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html><head>
      <title>Attendance – ${submitted.className} ${submitted.section} – ${MONTH_NAMES[month]} ${year}</title>
      <style>
        body{font-family:Arial,sans-serif;margin:0;padding:12px}
        h2{font-size:13px;margin:0 0 2px;color:#1e293b}
        .meta{font-size:10px;color:#64748b;margin-bottom:10px}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #d1d5db}
        .legend{margin-top:10px;font-size:8px;color:#9ca3af}
        @page{size:landscape;margin:1cm}
      </style>
    </head><body>
      <h2>Attendance Register – ${submitted.className}, Section ${submitted.section}</h2>
      <p class="meta">
        ${MONTH_NAMES[month]} ${year} &nbsp;|&nbsp; ${filteredStudents.length} students
        &nbsp;|&nbsp; ${schoolDays.length} school days (excl. Fri &amp; Sat)
        &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString()}
      </p>
      <table>
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:4px 5px;font-size:9px;text-align:center;min-width:18px">#</th>
            <th style="padding:4px 5px;font-size:9px;text-align:left;min-width:40px">Roll</th>
            <th style="padding:4px 8px;font-size:9px;text-align:left;min-width:100px">Student Name</th>
            ${dayColsHtml}
            <th style="padding:4px 3px;font-size:9px;background:#d1fae5;min-width:20px;text-align:center">P</th>
            <th style="padding:4px 3px;font-size:9px;background:#fee2e2;min-width:20px;text-align:center">A</th>
            <th style="padding:4px 3px;font-size:9px;background:#fef3c7;min-width:20px;text-align:center">L</th>
            <th style="padding:4px 3px;font-size:9px;background:#f8fafc;min-width:32px;text-align:center">%</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p class="legend">
        P = Present &nbsp;|&nbsp; A = Absent &nbsp;|&nbsp; L = Late &nbsp;|&nbsp;
        – = No record &nbsp;|&nbsp; WE = Weekend (shaded) &nbsp;|&nbsp;
        Red % = below 75% attendance
      </p>
    </body></html>`;

    const win = window.open("", "_blank", "width=1400,height=900");
    if (!win) { alert("Please allow popups to print."); return; }
    win.document.write(html);
    win.document.close();
    win.addEventListener("load", () => setTimeout(() => win.print(), 400));
  };

  // ── Render state flags ────────────────────────────────────────────────
  const hasResults = submitted && !isLoading && students.length > 0;
  const hasNoResults = submitted && !isLoading && students.length === 0;

  return (
    <div className="space-y-6">
      {/* ── Page header ───────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <p className="text-sm text-slate-500 mt-1">
          View monthly attendance by class and section. Use{" "}
          <span className="font-medium text-slate-600">Mark Attendance</span> to
          record daily attendance. Fri &amp; Sat are weekends (gray).
        </p>
      </div>

      {/* ── Filter panel ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FiFilter className="text-indigo-600 text-sm" />
          </div>
          <h2 className="text-base font-semibold text-slate-800">
            Select Class &amp; Month
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Class dropdown */}
            <div className="flex-1 min-w-36">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t("class")}
              </label>
              <select
                value={filter.className}
                onChange={handleClassChange}
                className="form-input"
              >
                <option value="">Select class</option>
                {classNames.map((cn) => (
                  <option key={cn} value={cn}>{cn}</option>
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
                <option value="">Select section</option>
                {availableSections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
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
                <span className="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg min-w-36 text-center">
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
              disabled={!filter.className || !filter.section || isLoading}
              className="btn-primary gap-2"
            >
              <FiSearch className="text-xs" />
              {isLoading ? t("loading") : t("search")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ───────────────────────────────────────────── */}
      {isLoading && <TableSkeleton />}

      {/* ── Top summary cards ─────────────────────────────────────────── */}
      {hasResults && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={FiUsers}
            label="Total Students"
            value={students.length}
            sub={`${submitted.className} – Sec ${submitted.section}`}
            colorClass="text-indigo-600"
            bgClass="bg-indigo-50"
          />
          <StatCard
            icon={FiUserCheck}
            label="Present Today"
            value={
              summaryStats?.presentToday !== null
                ? summaryStats.presentToday
                : "–"
            }
            sub={
              summaryStats?.presentToday === null
                ? "Outside selected month"
                : `of ${students.length} students`
            }
            colorClass="text-emerald-600"
            bgClass="bg-emerald-50"
          />
          <StatCard
            icon={FiUser}
            label="Absent Today"
            value={
              summaryStats?.absentToday !== null
                ? summaryStats.absentToday
                : "–"
            }
            sub={
              summaryStats?.absentToday === null
                ? "Outside selected month"
                : `of ${students.length} students`
            }
            colorClass="text-red-500"
            bgClass="bg-red-50"
          />
          <StatCard
            icon={FiTrendingUp}
            label={`Avg. Attendance — ${MONTH_NAMES[month]}`}
            value={
              summaryStats?.avgPct !== null
                ? `${summaryStats.avgPct}%`
                : "–"
            }
            sub={`${schoolDays.length} school days`}
            colorClass="text-violet-600"
            bgClass="bg-violet-50"
            warn={
              summaryStats?.avgPct !== null && summaryStats.avgPct < 75
            }
          />
        </div>
      )}

      {/* ── Search bar + export buttons ───────────────────────────────── */}
      {hasResults && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <input
              type="text"
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="Search by student name or roll number…"
              className="form-input pl-9 pr-8"
            />
            {nameSearch && (
              <button
                type="button"
                onClick={() => setNameSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FiX className="text-sm" />
              </button>
            )}
          </div>
          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors shadow-sm"
          >
            <FiDownload className="text-sm text-emerald-600" />
            Export Excel
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors shadow-sm"
          >
            <FiPrinter className="text-sm text-indigo-600" />
            Print / PDF
          </button>
        </div>
      )}

      {/* ── Attendance grid ────────────────────────────────────────────── */}
      {hasResults && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Grid header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="font-semibold text-slate-800">
                {submitted.className} &mdash; Section {submitted.section}
              </span>
              <span className="ml-2 text-sm text-slate-400">
                &bull; {MONTH_NAMES[month]} {year} &bull;{" "}
                {filteredStudents.length !== students.length
                  ? `${filteredStudents.length} of ${students.length}`
                  : students.length}{" "}
                students &bull; {schoolDays.length} school days
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                <span key={s} className="flex items-center gap-1">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded border text-xs font-bold ${cfg.cell.split(" ").slice(0, 3).join(" ")}`}
                  >
                    {cfg.label}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </span>
              ))}
              <span className="flex items-center gap-1">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded border text-xs font-bold bg-slate-200 text-slate-400 border-slate-300">
                  –
                </span>
                <span className="hidden sm:inline">Weekend</span>
              </span>
              <span className="flex items-center gap-1">
                <FiAlertTriangle className="text-red-500 text-xs" />
                <span className="hidden sm:inline text-red-500">&lt;75%</span>
              </span>
            </div>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table
              className="border-collapse text-xs"
              style={{ minWidth: "max-content" }}
            >
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {/* Fixed columns */}
                  <th className="table-header sticky left-0 z-20 bg-slate-50 text-center w-8 min-w-8">
                    #
                  </th>
                  <th className="table-header sticky left-8 z-20 bg-slate-50 min-w-44 text-left">
                    Student
                  </th>
                  <th className="table-header z-10 bg-slate-50 min-w-12 text-center">
                    Roll
                  </th>

                  {/* Day columns */}
                  {allDays.map((d) => {
                    const we = isWeekend(d);
                    return (
                      <th
                        key={d}
                        className={`table-header text-center px-0.5 min-w-8 ${we ? "bg-slate-200" : "bg-slate-50"}`}
                        title={we ? `${d} (Weekend)` : d}
                      >
                        <div className="font-bold">
                          {new Date(d + "T00:00:00").getDate()}
                        </div>
                        <div
                          className={`text-[10px] font-normal ${we ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {getDayAbbr(d)}
                        </div>
                      </th>
                    );
                  })}

                  {/* Summary columns */}
                  <th className="table-header text-center bg-emerald-50 min-w-10 font-bold text-emerald-700">
                    P
                  </th>
                  <th className="table-header text-center bg-red-50 min-w-10 font-bold text-red-600">
                    A
                  </th>
                  <th className="table-header text-center bg-amber-50 min-w-10 font-bold text-amber-600">
                    L
                  </th>
                  <th className="table-header text-center bg-slate-50 min-w-16">
                    %
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, i) => {
                  const { present, absent, late, pct } = studentSummary(student);
                  const isLow = pct !== null && pct < 75;

                  return (
                    <tr
                      key={student.StudentID}
                      className={`transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/40"} hover:bg-indigo-50/30`}
                    >
                      {/* Row # */}
                      <td className="table-cell text-center text-slate-400 sticky left-0 bg-inherit z-10">
                        {i + 1}
                      </td>

                      {/* Student name */}
                      <td className="table-cell sticky left-8 bg-inherit z-10">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                            {student.FirstName?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800 truncate max-w-32">
                            {student.FirstName} {student.LastName}
                          </span>
                          {isLow && (
                            <FiAlertTriangle
                              className="text-red-500 text-xs shrink-0"
                              title={`Below 75% attendance (${pct}%)`}
                            />
                          )}
                        </div>
                      </td>

                      {/* Roll */}
                      <td className="table-cell text-center text-slate-500 font-mono bg-inherit">
                        {student.RollNumber}
                      </td>

                      {/* Day cells */}
                      {allDays.map((date) => {
                        const we = isWeekend(date);
                        const status = student.attendance?.[date] ?? null;

                        if (we) {
                          return (
                            <td
                              key={date}
                              className="px-0.5 py-1 text-center bg-slate-100/80"
                            >
                              <span className="inline-flex w-7 h-7 items-center justify-center rounded border text-[10px] font-medium bg-slate-200 text-slate-400 border-slate-300 select-none">
                                –
                              </span>
                            </td>
                          );
                        }

                        const cfg = status ? STATUS_CONFIG[status] : null;
                        return (
                          <td key={date} className="px-0.5 py-1 text-center">
                            <span
                              title={`${student.FirstName} ${student.LastName} — ${date}: ${status ?? "not marked"}`}
                              className={`inline-flex w-7 h-7 items-center justify-center rounded border text-xs font-bold select-none ${
                                cfg
                                  ? cfg.cell.replace(/ hover:\S+/g, "")
                                  : "bg-white text-slate-300 border-slate-200"
                              }`}
                            >
                              {cfg ? cfg.label : "–"}
                            </span>
                          </td>
                        );
                      })}

                      {/* Summary cells */}
                      <td className="table-cell text-center bg-emerald-50/30">
                        <span className="font-semibold text-emerald-700">{present}</span>
                      </td>
                      <td className="table-cell text-center bg-red-50/30">
                        <span className="font-semibold text-red-600">{absent}</span>
                      </td>
                      <td className="table-cell text-center bg-amber-50/30">
                        <span className="font-semibold text-amber-600">{late}</span>
                      </td>
                      <td className="table-cell text-center">
                        {pct !== null ? (
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                              isLow
                                ? "bg-red-100 text-red-700"
                                : pct >= 85
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {pct}%
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">–</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Search no-match state */}
          {filteredStudents.length === 0 && nameSearch && (
            <div className="py-8 text-center">
              <p className="text-slate-500 text-sm">
                No students match &ldquo;{nameSearch}&rdquo;
              </p>
              <button
                onClick={() => setNameSearch("")}
                className="mt-2 text-xs text-indigo-500 hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── No students for this class ────────────────────────────────── */}
      {hasNoResults && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
            <FiSearch className="text-slate-400 text-xl" />
          </div>
          <p className="font-medium text-slate-700">{t("noRecords")}</p>
          <p className="text-sm text-slate-400 text-center max-w-sm">
            No students found for {submitted.className} – Section{" "}
            {submitted.section}. Verify the class and section or add students
            first.
          </p>
        </div>
      )}

      {/* ── Initial state ─────────────────────────────────────────────── */}
      {!submitted && !isLoading && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
            <FiCalendar className="text-indigo-400 text-xl" />
          </div>
          <p className="font-medium text-slate-600">
            Select a class and section to view the attendance grid
          </p>
          <p className="text-sm text-slate-400 text-center max-w-sm">
            Choose a class, section and month above, then click{" "}
            <span className="font-medium text-slate-500">Search</span>. Use
            Export or Print to download the attendance register.
          </p>
        </div>
      )}
    </div>
  );
}
