"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { studentsService } from "@/services/students.service";
import { imagesService } from "@/services/images.service";
import { useBranchStore } from "@/store/branchStore";
import { useTranslations } from "@/store/languageStore";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";
import Image from "next/image";
import "@/styles/StudentListpage.css";

function StudentAvatar({ studentId, firstName, lastName }) {
  const [url, setUrl] = useState(null);

  useState(() => {
    if (!studentId) return;
    imagesService
      .getByStudent(studentId)
      .then((res) => {
        const imgs = Array.isArray(res) ? res : [];
        if (imgs.length > 0) setUrl(imgs[0].ImagePath);
      })
      .catch(() => {});
  });

  return url ? (
    <Image
      src={url}
      alt={`${firstName} ${lastName}`}
      width={60}
      height={60}
      style={{
        objectFit: "cover",
        borderRadius: "50%",
        border: "2px solid #e5e7eb",
      }}
      onError={() => setUrl(null)}
    />
  ) : (
    <div
      className="avatar-placeholder"
      style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        color: "#6b7280",
        fontSize: "1.2rem",
        fontWeight: "bold",
      }}
    >
      {firstName?.charAt(0)}
      {lastName?.charAt(0)}
    </div>
  );
}

const EMPTY = { firstName: "", rollNumber: "", className: "", section: "" };

export default function StudentListPage() {
  const [filters, setFilters] = useState(EMPTY);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const t = useTranslations("students");
  const { currentBranchId, currentBranchName } = useBranchStore();

  const { data: classNames = [] } = useClassNames();
  const { data: sections = [] } = useStandardSections();

  // Reset results whenever the active branch changes so stale results are cleared
  useEffect(() => {
    setStudents([]);
    setError("");
    setSearched(false);
  }, [currentBranchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  // When class dropdown changes, update filters.className and reset section
  const handleClassDropdown = (e) => {
    const val = e.target.value;
    setFilters((p) => ({ ...p, className: val, section: "" }));
    setStudents([]);
    setError("");
    setSearched(false);
  };

  // When section dropdown changes, update filters.section
  const handleSectionDropdown = (e) => {
    const val = e.target.value;
    setFilters((p) => ({ ...p, section: val }));
    setStudents([]);
    setError("");
    setSearched(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (Object.values(filters).some((v) => !v.trim())) {
      setError(t("fillAllFields"));
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await studentsService.search({
        FirstName: filters.firstName.trim(),
        RollNumber: filters.rollNumber.trim(),
        ClassName: filters.className.trim(),
        Section: filters.section.trim(),
      });
      if (res.success) {
        const found = (res.data || []).filter(
          (s) =>
            s.FirstName?.toLowerCase().trim() ===
              filters.firstName.toLowerCase().trim() &&
            s.RollNumber?.toString().trim() === filters.rollNumber.trim() &&
            s.ClassName?.toLowerCase().trim() ===
              filters.className.toLowerCase().trim() &&
            s.Section?.toLowerCase().trim() ===
              filters.section.toLowerCase().trim(),
        );
        if (found.length === 0) setError(t("noStudentsFound"));
        setStudents(found);
      } else {
        setError(res.message || t("searchFailed"));
        setStudents([]);
      }
    } catch (err) {
      setError(err.message || t("searchError"));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(EMPTY);
    setStudents([]);
    setError("");
    setSearched(false);
  };
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");

  return (
    <div className="student-search-container">
      <Navbar />
      <LatestUpdatesNotice />
      <div className="search-header">
        <h1 className="search-title">{t("pageTitle")}</h1>
        <p className="search-subtitle">{t("pageSubtitle")}</p>
        {currentBranchId != null && (
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
          <select
            value={filters.className}
            onChange={handleClassDropdown}
          >
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
          <div className="search-instruction">
            <p>{t("allFieldsRequired")}</p>
          </div>
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
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-search" disabled={loading}>
              {loading ? t("searching") : t("searchBtn")}
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
        {error && (
          <div className="error-message">
            <i className="error-icon">⚠</i> {error}
          </div>
        )}
      </div>

      {searched && (
        <div className="results-container">
          <div className="results-header">
            <h2 className="results-title">{t("searchResults")}</h2>
            <span className="results-count">
              {students.length}{" "}
              {students.length !== 1 ? t("studentsFound") : t("studentFound")}
            </span>
          </div>
          {students.length > 0 ? (
            <div
              className="students-grid"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {students.map((s) => (
                <div
                  key={s.StudentID}
                  className="student-profile-card"
                  style={{
                    width: "100%",
                    maxWidth: 700,
                    margin: "0 auto 1rem",
                  }}
                >
                  <div className="profile-header">
                    <div className="profile-avatar">
                      <StudentAvatar
                        studentId={s.StudentID}
                        firstName={s.FirstName}
                        lastName={s.LastName}
                      />
                    </div>
                    <div className="profile-info">
                      <h3 className="student-name">
                        {s.FirstName} {s.LastName}
                      </h3>
                      <p className="student-details">
                        {t("class")} {s.ClassName} – {t("section")} {s.Section}
                      </p>
                      <p className="student-roll">
                        {t("rollNumberLabel")} {s.RollNumber}
                      </p>
                      <p className="student-id">
                        {t("studentIdLabel")} {s.StudentID}
                      </p>
                    </div>
                  </div>
                  <div className="profile-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-icon">👤</span>
                        <div className="detail-content">
                          <span className="detail-label">{t("gender")}</span>
                          <span className="detail-value">{s.Gender}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <div className="detail-content">
                          <span className="detail-label">
                            {t("dateOfBirth")}
                          </span>
                          <span className="detail-value">
                            {fmtDate(s.DateOfBirth)}
                          </span>
                        </div>
                      </div>
                      {s.ParentContact && (
                        <div className="detail-item">
                          <span className="detail-icon">📞</span>
                          <div className="detail-content">
                            <span className="detail-label">
                              {t("parentContact")}
                            </span>
                            <span className="detail-value">
                              {s.ParentContact}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>{t("noStudents")}</h3>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
}
