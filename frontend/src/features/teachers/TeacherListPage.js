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
  const img = images[0];
  const av = avatar(teacher.FirstName, teacher.LastName);

  return (
    <div className="teacher-card">
      <div className="card-header">
        <div className="teacher-image-container">
          {img ? (
            <img
              src={img.ImagePath}
              alt={`${teacher.FirstName} ${teacher.LastName}`}
              className="teacher-profile-image"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="teacher-avatar-fallback"
            style={{
              backgroundColor: av.color,
              display: img ? "none" : "flex",
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
  const t = useTranslations("teachers");
  const { currentBranchId, currentBranchName } = useBranchStore();

  const filtered = teachers.filter((teacher) => {
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
        <LottieLoader size="medium" text={t("loadingTeachers")} />
      </div>
    );

  if (isError)
    return (
      <div className="teachers-page">
        <div className="error-container">
          <p className="error">{t("failedToFetch")}</p>
          <button onClick={refetch} className="btn-retry">
            {t("tryAgain")}
          </button>
        </div>
      </div>
    );

  return (
    <div className="teachers-page">
      <Navbar />
      <LatestUpdatesNotice />
      <div className="page-header">
        <h1>{t("pageTitle")}</h1>
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
