"use client";

import { useState } from "react";
import { attendanceService } from "@/services/attendance.service";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useTranslations } from "@/store/languageStore";
import { useBranchStore } from "@/store/branchStore";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";
import "@/styles/listcss/attendancelist.css";

const CLASS_DROPDOWN_STYLE = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1.5px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  cursor: "pointer",
  outline: "none",
};

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

  const handleClassChange = (e) => {
    setClassName(e.target.value);
    setSection("");
    setResults(null);
    setError("");
  };

  const handleSectionChange = (e) => {
    setSection(e.target.value);
    setResults(null);
    setError("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!className || !section) {
      setError(t("fillAllFields") || "Please select class and section.");
      return;
    }
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
    <div className="attendance-page-container">
      <Navbar />
      <LatestUpdatesNotice />
      <div className="attendance-header">
        <h1>{t("pageTitle")}</h1>
        <p>{t("pageSubtitle")}</p>
        {currentBranchId != null && (
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
      <div className="attendance-search-section">
        <form onSubmit={handleSearch} className="attendance-search-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t("className")}</label>
              <select
                value={className}
                onChange={handleClassChange}
                required
                style={CLASS_DROPDOWN_STYLE}
              >
                <option value="">{t("selectClass") || "Select Class"}</option>
                {classNames.map((cn) => (
                  <option key={cn} value={cn}>{cn}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t("section")}</label>
              <select
                value={section}
                onChange={handleSectionChange}
                required
                disabled={!className}
                style={{ ...CLASS_DROPDOWN_STYLE, opacity: className ? 1 : 0.5, cursor: className ? "pointer" : "not-allowed" }}
              >
                <option value="">{t("selectSection") || "Select Section"}</option>
                {sections.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-search" disabled={loading || !className || !section}>
            {loading ? t("searching") : t("searchBtn")}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>

      {results !== null && (
        <div className="attendance-results">
          <div className="attendance-summary">
            <div className="summary-card">
              <span className="summary-value">{total}</span>
              <span className="summary-label">{t("totalRecords")}</span>
            </div>
            <div className="summary-card">
              <span className="summary-value">{present}</span>
              <span className="summary-label">{t("present")}</span>
            </div>
            <div className="summary-card">
              <span className="summary-value">{total - present}</span>
              <span className="summary-label">{t("absent")}</span>
            </div>
            <div className="summary-card">
              <span className="summary-value">{pct}%</span>
              <span className="summary-label">{t("attendanceRate")}</span>
            </div>
          </div>
          {results.length > 0 ? (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>{t("student")}</th>
                  <th>{t("date")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>
                      {r.StudentName ||
                        `${r.FirstName} ${r.LastName}` ||
                        r.StudentID}
                    </td>
                    <td>
                      {r.AttendanceDate
                        ? new Date(r.AttendanceDate).toLocaleDateString()
                        : r.ClassDate || "–"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${r.Status?.toLowerCase()}`}
                      >
                        {r.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">{t("noRecords")}</p>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
}
