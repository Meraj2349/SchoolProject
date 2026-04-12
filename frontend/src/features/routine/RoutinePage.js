"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, Download, Filter, Search, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useRoutines, useRoutineFilterOptions } from "@/hooks/useRoutines";
import { useTranslations } from "@/store/languageStore";
import "@/styles/RoutinList.css";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

function isPDF(type, url = "") {
  return type === "pdf" || url.toLowerCase().endsWith(".pdf");
}
function isImage(type, url = "") {
  if (type === "image") return true;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

const PER_PAGE = 12;

export default function RoutinePage() {
  const { data: allRoutines = [], isLoading, isError, refetch } = useRoutines();
  const { data: filterOptions = { classes: [], sections: [] } } =
    useRoutineFilterOptions();
  const t = useTranslations("routine");

  const [selClass, setSelClass] = useState("");
  const [selSection, setSelSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...allRoutines];
    if (selClass) list = list.filter((r) => r.ClassName === selClass);
    if (selSection) list = list.filter((r) => r.Section === selSection);
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.RoutineTitle?.toLowerCase().includes(s) ||
          r.Description?.toLowerCase().includes(s) ||
          r.ClassName?.toLowerCase().includes(s) ||
          r.Section?.toLowerCase().includes(s),
      );
    }
    return list.sort(
      (a, b) => new Date(b.RoutineDate) - new Date(a.RoutineDate),
    );
  }, [allRoutines, selClass, selSection, searchTerm]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const clearFilters = () => {
    setSelClass("");
    setSelSection("");
    setSearchTerm("");
    setPage(1);
  };

  if (isLoading)
    return (
      <div className="routine-list-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>{t("loadingRoutines")}</p>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="routine-list-page">
      <Navbar />
      <LatestUpdatesNotice />
      <section className="routine-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              <Calendar className="hero-icon" />
              {t("pageTitle")}
            </h1>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle" />
          <div className="decoration-dots" />
        </div>
      </section>
      <div className="routine-content">
        <div className="routine-container">
          <div className="filter-section">
            <div className="search-container">
              <div className="search-box">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="search-input"
                />
              </div>
              <button
                className={`filter-toggle ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters((v) => !v)}
              >
                <Filter className="filter-icon" /> {t("filters")}
              </button>
            </div>
            {showFilters && (
              <div className="filter-controls">
                <div className="filter-row">
                  <div className="filter-group">
                    <label>{t("class")}</label>
                    <select
                      value={selClass}
                      onChange={(e) => {
                        setSelClass(e.target.value);
                        setPage(1);
                      }}
                      className="filter-select"
                    >
                      <option value="">{t("allClasses")}</option>
                      {filterOptions.classes.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>{t("section")}</label>
                    <select
                      value={selSection}
                      onChange={(e) => {
                        setSelSection(e.target.value);
                        setPage(1);
                      }}
                      className="filter-select"
                    >
                      <option value="">{t("allSections")}</option>
                      {filterOptions.sections.map((s, i) => (
                        <option key={i} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button onClick={clearFilters} className="clear-filters-btn">
                    {t("clearFilters")}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="results-header">
            <h2>
              {filtered.length}{" "}
              {filtered.length !== 1 ? t("routinesFound") : t("routineFound")}
            </h2>
          </div>

          {isError && (
            <div className="error-message">
              <p>{t("failedToLoad")}</p>
              <button onClick={refetch} className="retry-btn">
                {t("tryAgain")}
              </button>
            </div>
          )}

          {paged.length > 0 ? (
            <>
              <div className="routines-grid">
                {paged.map((r) => (
                  <div key={r.RoutineID} className="routine-card">
                    <div className="routine-card-header">
                      <div className="routine-card-title">
                        <h3>{r.RoutineTitle}</h3>
                        {r.FileURL && isPDF(r.FileType, r.FileURL) && (
                          <div className="file-type-badge pdf">
                            <span>PDF</span>
                          </div>
                        )}
                        {r.FileURL && isImage(r.FileType, r.FileURL) && (
                          <div className="file-type-badge image">
                            <span>IMG</span>
                          </div>
                        )}
                      </div>
                      <div className="routine-card-class">
                        <Users className="class-icon" />
                        <span>
                          {r.ClassName} – {r.Section}
                        </span>
                      </div>
                    </div>
                    <div className="routine-card-content">
                      <div className="routine-date">
                        <Calendar className="date-icon" />
                        <span>{fmtDate(r.RoutineDate)}</span>
                      </div>
                      {r.Description && (
                        <div className="routine-description">
                          <p>{r.Description}</p>
                        </div>
                      )}
                      {r.FileURL && (
                        <div className="routine-file">
                          <a
                            href={r.FileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-link"
                          >
                            <Download className="download-icon" />
                            <span>
                              {isPDF(r.FileType, r.FileURL)
                                ? t("viewPDF")
                                : t("viewImage")}
                            </span>
                          </a>
                        </div>
                      )}
                      <div className="routine-card-footer">
                        <div className="created-date">
                          <Clock className="time-icon" />
                          <span>
                            {t("added")} {fmtDate(r.CreatedDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="pagination-btn prev"
                  >
                    {t("previous")}
                  </button>
                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`pagination-number ${page === p ? "active" : ""}`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="pagination-btn next"
                  >
                    {t("next")}
                  </button>
                </div>
              )}
            </>
          ) : (
            !isLoading &&
            !isError && (
              <div className="no-routines">
                <Calendar className="no-routines-icon" />
                <h3>{t("noRoutinesFound")}</h3>
                <p>
                  {selClass || selSection || searchTerm
                    ? t("tryAdjustFilters")
                    : t("noRoutinesPublished")}
                </p>
                {(selClass || selSection || searchTerm) && (
                  <button onClick={clearFilters} className="clear-btn">
                    {t("clearAllFilters")}
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
