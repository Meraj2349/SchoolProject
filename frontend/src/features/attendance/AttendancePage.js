"use client";

import { useState } from "react";
import { attendanceService } from "@/services/attendance.service";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useTranslations } from "@/store/languageStore";
import "@/styles/listcss/attendancelist.css";

export default function AttendancePage() {
  const [searchData, setSearchData] = useState({
    name: "",
    roll: "",
    className: "",
    section: "",
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("attendance");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((p) => ({ ...p, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await attendanceService.getByClassSection(
        searchData.className,
        searchData.section,
      );
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
      </div>
      <div className="attendance-search-section">
        <form onSubmit={handleSearch} className="attendance-search-form">
          <div className="form-row">
            <div className="form-group">
              <label>{t("className")}</label>
              <input
                type="text"
                name="className"
                value={searchData.className}
                onChange={handleChange}
                placeholder={t("classNamePlaceholder")}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>{t("section")}</label>
              <input
                type="text"
                name="section"
                value={searchData.section}
                onChange={handleChange}
                placeholder={t("sectionPlaceholder")}
                required
                className="form-input"
              />
            </div>
          </div>
          <button type="submit" className="btn-search" disabled={loading}>
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
