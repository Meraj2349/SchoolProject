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
import "@/styles/StudentListpage.css";

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

export default function ResultsPage() {
  const [filters, setFilters] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(null);
  const t = useTranslations("results");
  const { currentBranchId: branchId, currentBranchName } = useBranchStore();

  const { data: classNames = [] } = useClassNames();
  const { data: sections = [] } = useStandardSections();

  // Public endpoint — returns distinct exam names for the datalist autocomplete
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

  // When class dropdown changes, update filters.className and reset section
  const handleClassDropdown = (e) => {
    const val = e.target.value;
    setFilters((p) => ({ ...p, className: val, section: "" }));
    setSubmitted(null);
  };

  // When section dropdown changes, update filters.section
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

  return (
    <div className="student-search-container">
      <Navbar />
      <LatestUpdatesNotice />
      <div className="search-header">
        <h1 className="search-title">{t("pageTitle")}</h1>
        <p className="search-subtitle">{t("pageSubtitle")}</p>
        {branchId != null && (
          <div className="branch-badge">
            <span>🏫</span>
            <span>{currentBranchName}</span>
          </div>
        )}
      </div>

      {/* Class & Section filter bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">
            {t("className") || "Class"} <span className="required">*</span>
          </label>
          <select value={filters.className} onChange={handleClassDropdown}>
            <option value="">{t("selectClass") || "Select Class"}</option>
            {classNames.map((cn) => (
              <option key={cn} value={cn}>{cn}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">
            {t("section") || "Section"} <span className="required">*</span>
          </label>
          <select
            value={filters.section}
            onChange={handleSectionDropdown}
            disabled={!filters.className}
          >
            <option value="">{t("selectSection") || "Select Section"}</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-form-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-grid">
            {/* First Name */}
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                {t("firstName")} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={filters.firstName}
                onChange={handleChange}
                placeholder={t("firstNamePlaceholder")}
                className="form-input"
                required
              />
            </div>
            {/* Roll Number */}
            <div className="form-group">
              <label htmlFor="rollNumber" className="form-label">
                {t("rollNumber")} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={filters.rollNumber}
                onChange={handleChange}
                placeholder={t("rollNumberPlaceholder")}
                className="form-input"
                required
              />
            </div>
            {/* Class — synced with dropdown above but still editable */}
            <div className="form-group">
              <label htmlFor="className" className="form-label">
                {t("className")} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="className"
                name="className"
                value={filters.className}
                onChange={handleChange}
                placeholder={t("classNamePlaceholder")}
                className="form-input"
                required
              />
            </div>
            {/* Section — synced with dropdown above but still editable */}
            <div className="form-group">
              <label htmlFor="section" className="form-label">
                {t("section")} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="section"
                name="section"
                value={filters.section}
                onChange={handleChange}
                placeholder={t("sectionPlaceholder")}
                className="form-input"
                required
              />
            </div>
            {/* Exam name with autocomplete */}
            <div className="form-group">
              <label htmlFor="examName" className="form-label">
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
                className="form-input"
              />
              <datalist id="exam-suggestions">
                {examNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-search">
              {t("searchBtn")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-reset"
            >
              {t("resetBtn")}
            </button>
          </div>
        </form>
      </div>

      {submitted && (
        <div className="results-container">
          {isLoading && (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#5a6580" }}>
              {t("loading")}
            </div>
          )}
          {isError && (
            <div className="error-message">
              <span className="error-icon">⚠</span> {t("failedToFetch")}
            </div>
          )}
          {results && results.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">📋</div>
              <h3>{t("noResultsFound")}</h3>
            </div>
          )}
          {results && results.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table className="results-table">
                <thead>
                  <tr>
                    {TABLE_HEADERS.map((h) => (
                      <th key={h}>{h}</th>
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
                        ? { bg: "#dcfce7", color: "#166534", border: "#86efac" }
                        : grade === "B+" || grade === "B"
                        ? { bg: "#fef9c3", color: "#854d0e", border: "#fde047" }
                        : grade === "C+" || grade === "C"
                        ? { bg: "#ffedd5", color: "#9a3412", border: "#fdba74" }
                        : { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
                    return (
                      <tr key={i}>
                        <td>{r.FirstName} {r.LastName}</td>
                        <td>{r.ClassName} – {r.Section}</td>
                        <td>{r.SubjectName || r.Subject}</td>
                        <td>{r.ExamName}</td>
                        <td style={{ fontWeight: 700 }}>
                          {r.MarksObtained ?? r.marksObtained}
                        </td>
                        <td>{r.TotalMarks ?? r.totalMarks ?? 100}</td>
                        <td>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 44,
                            padding: "4px 10px",
                            borderRadius: 999,
                            fontSize: "0.82rem",
                            fontWeight: 800,
                            background: gradeColor.bg,
                            color: gradeColor.color,
                            border: `1px solid ${gradeColor.border}`,
                          }}>
                            {grade}
                          </span>
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
      <Footer />
    </div>
  );
}
