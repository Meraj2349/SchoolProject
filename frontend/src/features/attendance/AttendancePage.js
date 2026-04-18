"use client";

import { useState } from "react";
import { attendanceService } from "@/services/attendance.service";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useTranslations } from "@/store/languageStore";
import { useBranchStore } from "@/store/branchStore";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";

const NAVY = "#1a2744";
const NAVY_DARK = "#111b33";
const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e8c97a";

const STATUS_STYLES = {
  present: { bg: "#dcfce7", color: "#166534", border: "#86efac" },
  absent:  { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
  late:    { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" },
  excused: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd" },
};

const selectCls = `w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-lg bg-gray-50 text-[0.95rem] cursor-pointer outline-none transition-all duration-200 appearance-auto focus:border-[${GOLD}] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.15)] focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed`;

export default function AttendancePage() {
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("attendance");
  const { currentBranchId, currentBranchName } = useBranchStore();

  const { data: classNames = [] } = useClassNames();
  const { data: sections = [] } = useStandardSections();

  const handleClassChange = (e) => { setClassName(e.target.value); setSection(""); setResults(null); setError(""); };
  const handleSectionChange = (e) => { setSection(e.target.value); setResults(null); setError(""); };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!className || !section) { setError(t("fillAllFields") || "Please select class and section."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await attendanceService.getByClassSection(className, section);
      setResults(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      setError(err.message || t("failedToFetch"));
    } finally {
      setLoading(false);
    }
  };

  const present = results?.filter((r) => r.Status === "Present").length ?? 0;
  const total = results?.length ?? 0;
  const pct = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen pb-12 bg-[#f0f2f8] font-sans">
      <Navbar />
      <LatestUpdatesNotice />

      {/* Header */}
      <div
        className="text-center px-6 py-14 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 50%, #243156 100%)` }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `radial-gradient(ellipse 60% 50% at 20% 50%, rgba(201,168,76,0.15) 0%, transparent 70%),
                       radial-gradient(ellipse 40% 60% at 80% 20%, rgba(201,168,76,0.1) 0%, transparent 60%)`,
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-[4px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, transparent)` }} />
        <h1 className="relative z-[1] m-0 mb-2.5 text-white font-extrabold tracking-tight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.02em" }}>
          {t("pageTitle")}
        </h1>
        <p className="relative z-[1] max-w-[680px] mx-auto text-slate-300 text-[1.02rem] leading-relaxed m-0">
          {t("pageSubtitle")}
        </p>
        {currentBranchId != null && (
          <div className="relative z-[1] inline-flex items-center gap-1.5 mt-3.5 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(201,168,76,0.18)", border: "1.5px solid rgba(201,168,76,0.5)", color: "#e8c97a" }}>
            <span>🏫</span>
            <span>{currentBranchName}</span>
          </div>
        )}
      </div>

      {/* Search form */}
      <div className="max-w-[860px] mx-auto px-6">
        <form
          onSubmit={handleSearch}
          className="bg-white border border-gray-200 rounded-b-2xl shadow-lg p-7"
          style={{ borderTop: `3px solid ${GOLD}` }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: NAVY }}>{t("className")}</label>
              <select
                value={className}
                onChange={handleClassChange}
                required
                className={selectCls}
                style={{ "--tw-border-opacity": 1 }}
                onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
              >
                <option value="">{t("selectClass") || "Select Class"}</option>
                {classNames.map((cn) => <option key={cn} value={cn}>{cn}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-[0.06em]" style={{ color: NAVY }}>{t("section")}</label>
              <select
                value={section}
                onChange={handleSectionChange}
                required
                disabled={!className}
                className={selectCls}
                onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = ""; e.target.style.boxShadow = ""; }}
              >
                <option value="">{t("selectSection") || "Select Section"}</option>
                {sections.map((sec) => <option key={sec} value={sec}>{sec}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !className || !section}
            className="mt-5 inline-flex items-center justify-center min-w-[170px] px-8 py-3 border-none rounded-full text-white text-[0.95rem] font-bold tracking-wide cursor-pointer transition-all duration-[250ms] hover:-translate-y-0.5 disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none max-sm:w-full"
            style={{ background: NAVY, boxShadow: "0 4px 14px rgba(26,39,68,0.3)" }}
            onMouseEnter={e => { if (!e.target.disabled) { e.target.style.background = NAVY_DARK; e.target.style.boxShadow = "0 8px 24px rgba(26,39,68,0.35)"; } }}
            onMouseLeave={e => { e.target.style.background = NAVY; e.target.style.boxShadow = "0 4px 14px rgba(26,39,68,0.3)"; }}
          >
            {loading ? t("searching") : t("searchBtn")}
          </button>
        </form>

        {error && (
          <div className="mt-3.5 px-4 py-3 rounded-lg border-[1.5px] border-red-300 bg-red-50 text-red-700 font-semibold text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {results !== null && (
        <div className="max-w-[860px] mx-auto px-6 mt-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
            {[
              { value: total, label: t("totalRecords") },
              { value: present, label: t("present") },
              { value: total - present, label: t("absent") },
              { value: `${pct}%`, label: t("attendanceRate") },
            ].map((card, i) => (
              <div
                key={i}
                className="relative overflow-hidden p-4.5 rounded-2xl bg-white border border-gray-200 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ padding: "18px 14px" }}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${NAVY}, ${GOLD})` }} />
                <span className="block font-extrabold leading-none" style={{ color: NAVY, fontSize: "clamp(1.6rem, 3vw, 2.2rem)" }}>{card.value}</span>
                <span className="block mt-1.5 text-[0.82rem] font-semibold uppercase tracking-[0.04em] text-gray-500">{card.label}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          {results.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {[t("student"), t("date"), t("status")].map((h) => (
                        <th key={h} className="px-4.5 py-3.5 text-left text-[0.82rem] font-bold uppercase tracking-[0.06em]"
                          style={{ padding: "14px 18px", background: NAVY, color: GOLD_LIGHT }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-200 last:border-0 transition-colors duration-150 hover:bg-[#eef1f8]"
                        style={{ background: i % 2 === 1 ? "#f8f9fc" : "white" }}
                      >
                        <td className="px-4.5 py-3.5 text-[0.93rem]" style={{ padding: "13px 18px", color: NAVY }}>
                          {r.StudentName || `${r.FirstName} ${r.LastName}` || r.StudentID}
                        </td>
                        <td className="px-4.5 py-3.5 text-[0.93rem]" style={{ padding: "13px 18px", color: NAVY }}>
                          {r.AttendanceDate ? new Date(r.AttendanceDate).toLocaleDateString() : r.ClassDate || "–"}
                        </td>
                        <td className="px-4.5 py-3.5" style={{ padding: "13px 18px" }}>
                          {(() => {
                            const s = STATUS_STYLES[r.Status?.toLowerCase()] ?? STATUS_STYLES.absent;
                            return (
                              <span
                                className="inline-flex items-center justify-center min-w-[88px] px-3 py-1.5 rounded-full text-[0.8rem] font-bold capitalize tracking-[0.02em]"
                                style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                              >
                                {r.Status}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-6 bg-white rounded-2xl border border-gray-200 text-gray-500 font-medium">
              {t("noRecords")}
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
}
