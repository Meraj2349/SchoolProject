"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { resultsService } from "@/services/results.service";
import { examsService } from "@/services/exams.service";
import { queryKeys } from "@/lib/queryKeys";
import { useTranslations } from "@/store/languageStore";
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

  const { data: exams = [] } = useQuery({
    queryKey: queryKeys.exams.all(),
    queryFn: examsService.getAll,
    select: (d) => d?.data ?? d ?? [],
  });

  const {
    data: results,
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.results.search(submitted),
    queryFn: () => resultsService.search(submitted),
    enabled: !!submitted,
    select: (d) => d?.data ?? d ?? [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
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

  const FIELDS = [
    {
      id: "firstName",
      labelKey: "firstName",
      placeholderKey: "firstNamePlaceholder",
    },
    {
      id: "rollNumber",
      labelKey: "rollNumber",
      placeholderKey: "rollNumberPlaceholder",
    },
    {
      id: "className",
      labelKey: "className",
      placeholderKey: "classNamePlaceholder",
    },
    {
      id: "section",
      labelKey: "section",
      placeholderKey: "sectionPlaceholder",
    },
  ];

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
      </div>
      <div className="search-form-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-grid">
            {FIELDS.map(({ id, labelKey, placeholderKey }) => (
              <div key={id} className="form-group">
                <label htmlFor={id} className="form-label">
                  {t(labelKey)} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id={id}
                  name={id}
                  value={filters[id]}
                  onChange={handleChange}
                  placeholder={t(placeholderKey)}
                  className="form-input"
                  required
                />
              </div>
            ))}
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
                {exams.map((ex) => (
                  <option key={ex.ExamID} value={ex.ExamName} />
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
