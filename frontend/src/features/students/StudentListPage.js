"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import BranchBadge from "@/components/ui/BranchBadge";
import { studentsService } from "@/services/students.service";
import { imagesService } from "@/services/images.service";
import { useBranchStore } from "@/store/branchStore";
import { useTranslations } from "@/store/languageStore";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";
import Image from "next/image";

const EMERALD = "#059669";
const EMERALD_DARK = "#047857";
const EMERALD_MID = "#10b981";
const EMERALD_LIGHT = "#a7f3d0";
const TEXT_DARK = "#064e3b";

function StudentAvatar({ studentId, firstName, lastName }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    let cancelled = false;
    imagesService
      .getByStudent(studentId)
      .then((res) => {
        const imgs = Array.isArray(res) ? res : [];
        if (!cancelled && imgs.length > 0) setUrl(imgs[0].ImagePath);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [studentId]);

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
      className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-[1.2rem] font-bold"
      style={{
        background: `linear-gradient(135deg, ${EMERALD_MID} 0%, ${EMERALD} 100%)`,
        color: "#ffffff",
        border: `3px solid ${EMERALD_DARK}`,
        boxShadow: "0 4px 12px rgba(5,150,105,0.25)",
      }}
    >
      {firstName?.charAt(0)}
      {lastName?.charAt(0)}
    </div>
  );
}

const EMPTY = { firstName: "", rollNumber: "", className: "", section: "" };

const fieldCls =
  "w-full px-3.5 py-[11px] border-[1.5px] border-gray-200 rounded-lg text-[0.95rem] bg-gray-50 transition-all duration-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)] placeholder:text-gray-400";

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

  useEffect(() => {
    setStudents([]);
    setError("");
    setSearched(false);
  }, [currentBranchId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const handleClassDropdown = (e) => {
    const val = e.target.value;
    setFilters((p) => ({ ...p, className: val, section: "" }));
    setStudents([]);
    setError("");
    setSearched(false);
  };

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
        Class: filters.className.trim(),
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

  const labelCls =
    "text-xs font-bold uppercase tracking-[0.06em] mb-1.5 text-emerald-800";

  return (
    <div className="font-sans bg-[#f0fdf4] min-h-screen">
      <Navbar />
      <LatestUpdatesNotice />

      {/* Hero */}
      <div
        className="text-center px-6 py-14 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${EMERALD_DARK} 0%, ${EMERALD} 50%, ${EMERALD_MID} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 70%),
                       radial-gradient(ellipse 40% 60% at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[4px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${EMERALD_LIGHT}, #ffffff, ${EMERALD_LIGHT}, transparent)`,
          }}
        />
        <h1
          className="relative z-[1] m-0 mb-3 text-white font-extrabold tracking-tight"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "-0.02em",
          }}
        >
          {t("pageTitle")}
        </h1>
        <p className="relative z-[1] m-0 text-emerald-50 opacity-90 font-normal text-[1.05rem]">
          {t("pageSubtitle")}
        </p>
        {currentBranchId != null && (
          <div
            className="relative z-[1] inline-flex items-center gap-1.5 mt-3.5 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1.5px solid rgba(255,255,255,0.5)",
              color: "#ffffff",
            }}
          >
            <span>🏫</span>
            <span>{currentBranchName}</span>
          </div>
        )}
      </div>

      {/* Search form — all fields on one line */}
      <div
        className="max-w-[1100px] mx-auto -mt-px bg-white rounded-b-2xl px-6 py-6 border border-gray-200"
        style={{
          borderTop: `3px solid ${EMERALD_MID}`,
          boxShadow: "0 6px 24px rgba(5,150,105,0.12)",
        }}
      >
        <form onSubmit={handleSearch}>
          <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-lg px-4 py-3 mb-5 text-emerald-800 text-sm leading-relaxed">
            <p className="m-0 font-medium">{t("allFieldsRequired")}</p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            {/* Class */}
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className={labelCls}>{t("className") || "Class"} *</label>
              <select
                value={filters.className}
                onChange={handleClassDropdown}
                className={fieldCls}
                style={{ color: TEXT_DARK, cursor: "pointer" }}
              >
                <option value="">{t("selectClass") || "Select Class"}</option>
                {classNames.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div className="flex flex-col flex-1 min-w-[150px]">
              <label className={labelCls}>{t("section") || "Section"} *</label>
              <select
                value={filters.section}
                onChange={handleSectionDropdown}
                disabled={!filters.className}
                className={fieldCls}
                style={{
                  color: TEXT_DARK,
                  cursor: !filters.className ? "not-allowed" : "pointer",
                  opacity: !filters.className ? 0.5 : 1,
                }}
              >
                <option value="">
                  {t("selectSection") || "Select Section"}
                </option>
                {sections.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {/* First name */}
            <div className="flex flex-col flex-1 min-w-[170px]">
              <label htmlFor="firstName" className={labelCls}>
                {t("firstName")} *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={filters.firstName}
                onChange={handleChange}
                placeholder={t("firstNamePlaceholder")}
                className={fieldCls}
                style={{ color: TEXT_DARK }}
                required
              />
            </div>

            {/* Roll number */}
            <div className="flex flex-col flex-1 min-w-[140px]">
              <label htmlFor="rollNumber" className={labelCls}>
                {t("rollNumber")} *
              </label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                value={filters.rollNumber}
                onChange={handleChange}
                placeholder={t("rollNumberPlaceholder")}
                className={fieldCls}
                style={{ color: TEXT_DARK }}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 items-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-[11px] border-none rounded-lg text-white font-bold text-[0.9rem] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
                style={{
                  background: `linear-gradient(135deg, ${EMERALD_MID} 0%, ${EMERALD} 100%)`,
                  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                }}
              >
                {loading ? t("searching") : t("searchBtn")}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-[11px] bg-white border-[1.5px] border-emerald-200 rounded-lg font-bold text-[0.9rem] cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:text-emerald-700 text-emerald-800 whitespace-nowrap"
              >
                {t("resetBtn")}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border-[1.5px] border-red-300 text-red-700 rounded-lg flex items-center gap-2.5 font-medium">
            <span className="text-[1.1rem] flex-shrink-0">⚠</span> {error}
          </div>
        )}
      </div>

      {/* Results */}
      {searched && (
        <div
          className="max-w-[1100px] mx-auto my-7 mb-10 bg-white rounded-2xl px-8 py-7 border border-gray-200"
          style={{ boxShadow: "0 6px 24px rgba(5,150,105,0.12)" }}
        >
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 max-sm:flex-col max-sm:gap-3 max-sm:text-center">
            <h2
              className="text-[1.4rem] font-bold m-0"
              style={{ color: TEXT_DARK }}
            >
              {t("searchResults")}
            </h2>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <BranchBadge />
              <span
                className="text-[0.85rem] font-bold px-4 py-1.5 rounded-full text-white"
                style={{
                  background: `linear-gradient(135deg, ${EMERALD_MID} 0%, ${EMERALD} 100%)`,
                }}
              >
                {students.length}{" "}
                {students.length !== 1 ? t("studentsFound") : t("studentFound")}
              </span>
            </div>
          </div>

          {students.length > 0 ? (
            <div className="flex flex-col items-center gap-0">
              {students.map((s) => (
                <div
                  key={s.StudentID}
                  className="w-full max-w-[700px] mx-auto mb-5 bg-white border border-gray-200 rounded-2xl p-7 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-400 max-sm:p-4"
                  style={{ boxShadow: "0 2px 8px rgba(5,150,105,0.08)" }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[4px]"
                    style={{
                      background: `linear-gradient(90deg, ${EMERALD_MID}, ${EMERALD_DARK})`,
                    }}
                  />
                  <div
                    className="flex items-center gap-5 mb-5.5 pb-4.5 border-b border-gray-200 max-sm:flex-col max-sm:text-center"
                    style={{ marginBottom: "22px", paddingBottom: "18px" }}
                  >
                    <div className="flex-shrink-0">
                      <StudentAvatar
                        studentId={s.StudentID}
                        firstName={s.FirstName}
                        lastName={s.LastName}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-[1.3rem] font-bold m-0 mb-1.5"
                        style={{ color: TEXT_DARK }}
                      >
                        {s.FirstName} {s.LastName}
                      </h3>
                      <p
                        className="font-semibold text-[0.95rem] m-0 mb-1"
                        style={{ color: EMERALD }}
                      >
                        {t("class")} {s.ClassName} – {t("section")} {s.Section}
                      </p>
                      <p className="text-sm m-0 mb-0.5 text-gray-500">
                        {t("rollNumberLabel")} {s.RollNumber}
                      </p>
                      <p className="text-[0.82rem] m-0 text-gray-400">
                        {t("studentIdLabel")} {s.StudentID}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { icon: "👤", label: t("gender"), value: s.Gender },
                      {
                        icon: "📅",
                        label: t("dateOfBirth"),
                        value: fmtDate(s.DateOfBirth),
                      },
                      s.ParentContact
                        ? {
                            icon: "📞",
                            label: t("parentContact"),
                            value: s.ParentContact,
                          }
                        : null,
                    ]
                      .filter(Boolean)
                      .map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 px-3.5 py-3 bg-emerald-50/40 border border-emerald-100 rounded-lg"
                        >
                          <span className="text-[18px] flex-shrink-0">
                            {item.icon}
                          </span>
                          <div className="flex flex-col gap-0.5 flex-1">
                            <span className="text-[0.72rem] text-gray-500 font-bold uppercase tracking-[0.04em]">
                              {item.label}
                            </span>
                            <span
                              className="font-semibold text-[0.9rem]"
                              style={{ color: TEXT_DARK }}
                            >
                              {item.value}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center px-6 py-12 bg-white rounded-2xl border border-gray-200 mx-auto max-w-[480px]">
              <div className="text-[3.5rem] mb-3 opacity-60">🔍</div>
              <h3
                className="font-semibold text-[1.2rem] m-0"
                style={{ color: TEXT_DARK }}
              >
                {t("noStudents")}
              </h3>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
}
