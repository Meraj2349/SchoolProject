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

const SELECT_STYLE = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1.5px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  cursor: "pointer",
  outline: "none",
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 10,
              padding: "5px 14px",
              background: "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)",
              border: "1.5px solid #10b981",
              borderRadius: 20,
              fontSize: 12,
              color: "#065f46",
              fontWeight: 600,
            }}
          >
            <span>🏫</span>
            <span>{currentBranchName}</span>
          </div>
        )}
      </div>

      {/* Class & Section dropdowns at the top */}
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto 20px",
          padding: "16px 20px",
          background: "#f9fafb",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div>
          <label
            style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#374151" }}
          >
            {t("className") || "Class"} <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            value={filters.className}
            onChange={handleClassDropdown}
            style={SELECT_STYLE}
          >
            <option value="">{t("selectClass") || "Select Class"}</option>
            {classNames.map((cn) => (
              <option key={cn} value={cn}>{cn}</option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 6, color: "#374151" }}
          >
            {t("section") || "Section"} <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <select
            value={filters.section}
            onChange={handleSectionDropdown}
            disabled={!filters.className}
            style={{ ...SELECT_STYLE, opacity: filters.className ? 1 : 0.5, cursor: filters.className ? "pointer" : "not-allowed" }}
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
          {isLoading && <p>{t("loading")}</p>}
          {isError && <div className="error-message">{t("failedToFetch")}</div>}
          {results && results.length === 0 && (
            <p className="no-data">{t("noResultsFound")}</p>
          )}
          {results && results.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 24,
              }}
            >
              <thead style={{ background: "#f9fafb" }}>
                <tr>
                  {TABLE_HEADERS.map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        borderBottom: "1px solid #e5e7eb",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "10px 16px" }}>
                      {r.FirstName} {r.LastName}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      {r.ClassName} – {r.Section}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      {r.SubjectName || r.Subject}
                    </td>
                    <td style={{ padding: "10px 16px" }}>{r.ExamName}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 600 }}>
                      {r.MarksObtained ?? r.marksObtained}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      {r.TotalMarks ?? r.totalMarks ?? 100}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontWeight: 700,
                        color: "#2563eb",
                      }}
                    >
                      {calcGrade(
                        r.MarksObtained ?? r.marksObtained,
                        r.TotalMarks ?? r.totalMarks ?? 100,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
}
