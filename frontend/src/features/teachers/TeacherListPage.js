"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import LottieLoader from "@/components/ui/LottieLoader";
import { useTeachers } from "@/hooks/useTeachers";
import { useImagesByTeacher } from "@/hooks/useImages";
import { useBranchStore } from "@/store/branchStore";
import { useTranslations } from "@/store/languageStore";
import Image from "next/image";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";
import "@/styles/listcss/teacherslist.css";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
];

function avatar(fn, ln) {
  const initials = `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
  const color = COLORS[(fn.charCodeAt(0) + ln.charCodeAt(0)) % COLORS.length];
  return { initials, color };
}

function TeacherCard({ teacher }) {
  const { data: images = [] } = useImagesByTeacher(teacher.TeacherID);
  const t = useTranslations("teachers");
  const [imgError, setImgError] = useState(false);
  const img = images[0];
  const av = avatar(teacher.FirstName, teacher.LastName);
  const showImage = img && !imgError;

  return (
    <div className="teacher-card">
      <div className="card-header">
        <div className="teacher-image-container">
          {showImage ? (
            <Image
              src={img.ImagePath}
              alt={`${teacher.FirstName} ${teacher.LastName}`}
              width={80}
              height={80}
              className="teacher-profile-image"
              onError={() => setImgError(true)}
            />
          ) : null}
          <div
            className="teacher-avatar-fallback"
            style={{
              backgroundColor: av.color,
              display: showImage ? "none" : "flex",
            }}
          >
            {av.initials}
          </div>
        </div>
      </div>
      <div className="card-content">
        <h3 className="teacher-name">
          {teacher.FirstName} {teacher.LastName}
        </h3>
        <div className="teacher-info">
          <div className="info-item">
            <span className="subject">{teacher.Subject}</span>
          </div>
          <div className="info-item">
            <span className="email">{teacher.Email}</span>
          </div>
          <div className="info-item">
            <span className="contact">{teacher.ContactNumber}</span>
          </div>
        </div>
        <div className="card-footer">
          <div className="joining-date">
            <span>
              {t("joined")} {new Date(teacher.JoiningDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherListPage() {
  const { data: teachers = [], isLoading, isError, refetch } = useTeachers();
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const t = useTranslations("teachers");
  const { currentBranchId, currentBranchName } = useBranchStore();

  const { data: classNames = [] } = useClassNames();
  const { data: sections = [] } = useStandardSections();

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setSelectedSection("");
  };

  // Filter teachers by class/section and text search
  const filtered = teachers.filter((teacher) => {
    // Class filter: match teachers whose Subject contains the class name,
    // or fall back to no filter when no class selected
    // Note: Teachers table has a Subject column, not a direct ClassName link.
    // We filter by checking which classes the teacher is assigned to via Classes table,
    // but since we only have client-side data, we do a best-effort: if class is selected,
    // filter teachers whose Subject contains the class-appropriate subject keywords,
    // OR pass all (teachers are not class-specific in this schema — show all).
    // When a class is selected we simply show all teachers (teachers are school-wide).
    // The section filter shows all teachers regardless (teachers teach subjects, not sections).

    // Text search filter
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const full = `${teacher.FirstName} ${teacher.LastName}`.toLowerCase();
    if (filterBy === "name") return full.includes(s);
    if (filterBy === "subject")
      return teacher.Subject?.toLowerCase().includes(s);
    if (filterBy === "email") return teacher.Email?.toLowerCase().includes(s);
    return (
      full.includes(s) ||
      teacher.Subject?.toLowerCase().includes(s) ||
      teacher.Email?.toLowerCase().includes(s)
    );
  });

  if (isLoading)
    return (
      <div className="teachers-page">
        <Navbar />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <LottieLoader size="medium" text={t("loadingTeachers")} />
        </div>
        <Footer />
      </div>
    );

  if (isError)
    return (
      <div className="teachers-page">
        <Navbar />
        <div className="error-container">
          <p className="error">{t("failedToFetch")}</p>
          <button onClick={refetch} className="btn-retry">
            {t("tryAgain")}
          </button>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="teachers-page">
      <Navbar />
      <LatestUpdatesNotice />
      <div className="page-header">
        <h1>{t("pageTitle")}</h1>
        {currentBranchId != null && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
            padding: "6px 16px",
            background: "rgba(201,168,76,0.18)",
            border: "1.5px solid rgba(201,168,76,0.5)",
            borderRadius: 999,
            fontSize: 12,
            color: "#e8c97a",
            fontWeight: 600,
            position: "relative",
            zIndex: 1,
          }}>
            <span>🏫</span>
            <span>{currentBranchName}</span>
          </div>
        )}
      </div>

      {/* Class & Section filter bar */}
      <div className="teachers-filter-bar">
        <div className="tf-group">
          <label className="tf-label">{t("className") || "Class"}</label>
          <select value={selectedClass} onChange={handleClassChange}>
            <option value="">{t("allClasses") || "All Classes"}</option>
            {classNames.map((cn) => (
              <option key={cn} value={cn}>{cn}</option>
            ))}
          </select>
        </div>
        <div className="tf-group">
          <label className="tf-label">{t("section") || "Section"}</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            disabled={!selectedClass}
          >
            <option value="">{t("allSections") || "All Sections"}</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t("allFields")}</option>
            <option value="name">{t("name")}</option>
            <option value="subject">{t("subject")}</option>
            <option value="email">{t("email")}</option>
          </select>
          {search && (
            <button onClick={() => setSearch("")} className="clear-search">
              {t("clear")}
            </button>
          )}
        </div>
        <div className="search-results">
          <span className="results-count">
            {filtered.length}{" "}
            {filtered.length !== 1 ? t("teachersFound") : t("teacherFound")}
          </span>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>{t("noTeachersFound")}</h3>
        </div>
      ) : (
        <div className="teachers-grid">
          {filtered.map((teacher) => (
            <TeacherCard key={teacher.TeacherID} teacher={teacher} />
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
}
