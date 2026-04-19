"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { resultsService } from "@/services/results.service";
import { queryKeys } from "@/lib/queryKeys";
import httpClient from "@/lib/httpClient";
import { useTranslations } from "@/store/languageStore";
import { useBranchStore } from "@/store/branchStore";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";

const NAVY = "#059669";
const NAVY_DARK = "#047857";
const GOLD = "#10b981";
const GOLD_LIGHT = "#a7f3d0";

const GRADES = [
  { min: 90, grade: "A+" },
  { min: 80, grade: "A" },
  { min: 70, grade: "B+" },
  { min: 60, grade: "B" },
  { min: 50, grade: "C+" },
  { min: 40, grade: "C" },
  { min: 35, grade: "D" },
  { min: 0, grade: "F" },
];
const calcGrade = (marks, total = 100) => {
  const pct = (marks / total) * 100;
  return (GRADES.find((g) => pct >= g.min) || { grade: "F" }).grade;
};

const EMPTY = {
  firstName: "",
  rollNumber: "",
  className: "",
  section: "",
  examName: "",
};

const inputCls =
  "w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-lg bg-gray-50 text-[0.95rem] text-gray-900 transition-all duration-200 outline-none focus:bg-white";
const selectCls =
  "w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-lg bg-gray-50 text-[0.95rem] cursor-pointer outline-none transition-all duration-200 appearance-auto disabled:opacity-50 disabled:cursor-not-allowed";

export default function ResultsPage() {
  const [filters, setFilters] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(null);
  const t = useTranslations("results");
  const { currentBranchId: branchId, currentBranchName } = useBranchStore();

  const { data: classNames = [] } = useClassNames();
  const { data: sections = [] } = useStandardSections();

  const { data: examNames = [] } = useQuery({
    queryKey: ["exams", "public", "names"],
    queryFn: () =>
      httpClient.get("/exams/public/names").then((r) => r.data?.data ?? []),
  });

  const {
    data: results,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.results.search(submitted, branchId),
    queryFn: () => resultsService.search(submitted),
    enabled: !!submitted,
    select: (d) => d?.data ?? d ?? [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const handleClassDropdown = (e) => {
    const val = e.target.value;
    setFilters((p) => ({ ...p, className: val, section: "" }));
    setSubmitted(null);
  };

  const handleSectionDropdown = (e) => {
    const val = e.target.value;
    setFilters((p) => ({ ...p, section: val }));
    setSubmitted(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmitted({
      firstName: filters.firstName.trim(),
      rollNumber: filters.rollNumber.trim(),
      className: filters.className.trim(),
      section: filters.section.trim(),
      examName: filters.examName.trim() || undefined,
    });
  };

  const handleReset = () => {
    setFilters(EMPTY);
    setSubmitted(null);
  };

  const TABLE_HEADERS = [
    t("student"),
    t("class"),
    t("subjectCol"),
    t("exam"),
    t("marks"),
    t("total"),
    t("grade"),
  ];

  const focusGold = (e) => {
    e.target.style.borderColor = GOLD;
    e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.15)";
    e.target.style.backgroundColor = "white";
  };
  const blurReset = (e) => {
    e.target.style.borderColor = "";
    e.target.style.boxShadow = "";
    e.target.style.backgroundColor = "";
  };

  return (
    <div className="min-h-screen pb-12 bg-[#f0fdf4] font-sans">
      <Navbar />
      <LatestUpdatesNotice />

      {/* Header */}
      <div
        className="text-center px-6 py-14 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 50%, ${GOLD} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 70%),
                       radial-gradient(ellipse 40% 60% at 80% 20%, rgba(16,185,129,0.1) 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[4px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, transparent)`,
          }}
        />
        <h1
          className="relative z-[1] m-0 mb-2.5 text-white font-extrabold tracking-tight"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "-0.02em",
          }}
        >
          {t("pageTitle")}
        </h1>
        <p className="relative z-[1] max-w-[680px] mx-auto text-slate-300 text-[1.02rem] leading-relaxed m-0">
          {t("pageSubtitle")}
        </p>
        {branchId != null && (
          <div
            className="relative z-[1] inline-flex items-center gap-1.5 mt-3.5 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(16,185,129,0.18)",
              border: "1.5px solid rgba(16,185,129,0.5)",
              color: "#a7f3d0",
            }}
          >
            <span>🏫</span>
            <span>{currentBranchName}</span>
          </div>
        )}
      </div>

      {/* Class & Section filter bar */}
      <div className="max-w-[900px] mx-auto px-6">
        <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl shadow-sm px-6 py-4 flex flex-wrap gap-5">
          <div className="flex flex-col gap-1 min-w-[180px] flex-1">
            <label
              className="text-xs font-bold uppercase tracking-[0.06em]"
              style={{ color: NAVY }}
            >
              {t("className") || "Class"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.className}
              onChange={handleClassDropdown}
              className={selectCls}
              onFocus={focusGold}
              onBlur={blurReset}
            >
              <option value="">{t("selectClass") || "Select Class"}</option>
              {classNames.map((cn) => (
                <option key={cn} value={cn}>
                  {cn}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[180px] flex-1">
            <label
              className="text-xs font-bold uppercase tracking-[0.06em]"
              style={{ color: NAVY }}
            >
              {t("section") || "Section"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.section}
              onChange={handleSectionDropdown}
              disabled={!filters.className}
              className={selectCls}
              onFocus={focusGold}
              onBlur={blurReset}
            >
              <option value="">{t("selectSection") || "Select Section"}</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search form */}
      <div className="max-w-[900px] mx-auto px-6 mt-5">
        <form
          onSubmit={handleSearch}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg p-7"
          style={{ borderTop: `3px solid ${GOLD}` }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* First Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="firstName"
                className="text-xs font-bold uppercase tracking-[0.06em]"
                style={{ color: NAVY }}
              >
                {t("firstName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={filters.firstName}
                onChange={handleChange}
                placeholder={t("firstNamePlaceholder")}
                className={inputCls}
                onFocus={focusGold}
                onBlur={blurReset}
                required
              />
            </div>

            {/* Roll Number */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="rollNumber"
                className="text-xs font-bold uppercase tracking-[0.06em]"
                style={{ color: NAVY }}
              >
                {t("rollNumber")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={filters.rollNumber}
                onChange={handleChange}
                placeholder={t("rollNumberPlaceholder")}
                className={inputCls}
                onFocus={focusGold}
                onBlur={blurReset}
                required
              />
            </div>

            {/* Class (text, synced with dropdown) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="className"
                className="text-xs font-bold uppercase tracking-[0.06em]"
                style={{ color: NAVY }}
              >
                {t("className")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="className"
                name="className"
                value={filters.className}
                onChange={handleChange}
                placeholder={t("classNamePlaceholder")}
                className={inputCls}
                onFocus={focusGold}
                onBlur={blurReset}
                required
              />
            </div>

            {/* Section (text, synced with dropdown) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="section"
                className="text-xs font-bold uppercase tracking-[0.06em]"
                style={{ color: NAVY }}
              >
                {t("section")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="section"
                name="section"
                value={filters.section}
                onChange={handleChange}
                placeholder={t("sectionPlaceholder")}
                className={inputCls}
                onFocus={focusGold}
                onBlur={blurReset}
                required
              />
            </div>

            {/* Exam name with datalist autocomplete */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label
                htmlFor="examName"
                className="text-xs font-bold uppercase tracking-[0.06em]"
                style={{ color: NAVY }}
              >
                {t("examName")}
              </label>
              <input
                type="text"
                id="examName"
                name="examName"
                value={filters.examName}
                onChange={handleChange}
                placeholder={t("examNamePlaceholder")}
                list="exam-suggestions"
                className={inputCls}
                onFocus={focusGold}
                onBlur={blurReset}
              />
              <datalist id="exam-suggestions">
                {examNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center min-w-[150px] px-8 py-3 border-none rounded-full text-white text-[0.95rem] font-bold tracking-wide cursor-pointer transition-all duration-[250ms] hover:-translate-y-0.5 max-sm:flex-1"
              style={{
                background: NAVY,
                boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = NAVY_DARK;
                e.target.style.boxShadow = "0 8px 24px rgba(5,150,105,0.35)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = NAVY;
                e.target.style.boxShadow = "0 4px 14px rgba(5,150,105,0.3)";
              }}
            >
              {t("searchBtn")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center min-w-[120px] px-7 py-3 border-[1.5px] rounded-full text-[0.95rem] font-bold tracking-wide cursor-pointer transition-all duration-[250ms] hover:-translate-y-0.5 max-sm:flex-1"
              style={{ borderColor: GOLD, color: NAVY, background: "white" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ecfdf5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              {t("resetBtn")}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {submitted && (
        <div className="max-w-[900px] mx-auto px-6 mt-6">
          {isLoading && (
            <div className="text-center py-8 text-[#5a6580] font-medium">
              {t("loading")}
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-[1.5px] border-red-300 bg-red-50 text-red-700 font-semibold text-sm">
              <span>⚠</span> {t("failedToFetch")}
            </div>
          )}
          {results && results.length === 0 && (
            <div className="text-center py-12 px-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-600 m-0">
                {t("noResultsFound")}
              </h3>
            </div>
          )}
          {results && results.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {TABLE_HEADERS.map((h) => (
                        <th
                          key={h}
                          className="text-left text-[0.82rem] font-bold uppercase tracking-[0.06em]"
                          style={{
                            padding: "14px 18px",
                            background: NAVY,
                            color: GOLD_LIGHT,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const grade = calcGrade(
                        r.MarksObtained ?? r.marksObtained,
                        r.TotalMarks ?? r.totalMarks ?? 100,
                      );
                      const gradeColor =
                        grade === "A+" || grade === "A"
                          ? {
                              bg: "#dcfce7",
                              color: "#166534",
                              border: "#86efac",
                            }
                          : grade === "B+" || grade === "B"
                            ? {
                                bg: "#fef9c3",
                                color: "#854d0e",
                                border: "#fde047",
                              }
                            : grade === "C+" || grade === "C"
                              ? {
                                  bg: "#ffedd5",
                                  color: "#9a3412",
                                  border: "#fdba74",
                                }
                              : {
                                  bg: "#fee2e2",
                                  color: "#991b1b",
                                  border: "#fca5a5",
                                };
                      return (
                        <tr
                          key={i}
                          className="border-b border-gray-200 last:border-0 transition-colors duration-150 hover:bg-emerald-50"
                          style={{
                            background: i % 2 === 1 ? "#f0fdf4" : "white",
                          }}
                        >
                          <td
                            className="text-[0.93rem]"
                            style={{ padding: "13px 18px", color: NAVY }}
                          >
                            {r.FirstName} {r.LastName}
                          </td>
                          <td
                            className="text-[0.93rem]"
                            style={{ padding: "13px 18px", color: NAVY }}
                          >
                            {r.ClassName} – {r.Section}
                          </td>
                          <td
                            className="text-[0.93rem]"
                            style={{ padding: "13px 18px", color: NAVY }}
                          >
                            {r.SubjectName || r.Subject}
                          </td>
                          <td
                            className="text-[0.93rem]"
                            style={{ padding: "13px 18px", color: NAVY }}
                          >
                            {r.ExamName}
                          </td>
                          <td
                            className="font-bold text-[0.93rem]"
                            style={{ padding: "13px 18px", color: NAVY }}
                          >
                            {r.MarksObtained ?? r.marksObtained}
                          </td>
                          <td
                            className="text-[0.93rem]"
                            style={{ padding: "13px 18px", color: NAVY }}
                          >
                            {r.TotalMarks ?? r.totalMarks ?? 100}
                          </td>
                          <td style={{ padding: "13px 18px" }}>
                            <span
                              className="inline-flex items-center justify-center min-w-[44px] px-2.5 py-1 rounded-full text-[0.82rem] font-extrabold"
                              style={{
                                background: gradeColor.bg,
                                color: gradeColor.color,
                                border: `1px solid ${gradeColor.border}`,
                              }}
                            >
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
}
