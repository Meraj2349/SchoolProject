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

const NAVY = "#1a2744";
const NAVY_DARK = "#111b33";
const NAVY_MID = "#243156";
const GOLD = "#c9a84c";
const GOLD_LIGHT = "#e8c97a";

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
      className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-[1.2rem] font-bold"
      style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_MID} 100%)`,
        color: GOLD_LIGHT,
        border: `3px solid ${GOLD}`,
        boxShadow: "0 4px 12px rgba(26,39,68,0.25)",
      }}
    >
      {firstName?.charAt(0)}
      {lastName?.charAt(0)}
    </div>
  );
}

const EMPTY = { firstName: "", rollNumber: "", className: "", section: "" };

const inputCls =
  "w-full px-3.5 py-[11px] border-[1.5px] border-gray-200 rounded-lg text-[0.95rem] bg-gray-50 transition-all duration-200 focus:outline-none focus:bg-white placeholder:text-gray-400 placeholder:italic";

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

  const selectStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid #e2e6f0",
    fontSize: 14,
    background: "#f8f9fc",
    color: NAVY,
    cursor: "pointer",
    outline: "none",
  };

  return (
    <div className="font-sans bg-[#f0f2f8] min-h-screen">
      <Navbar />
      <LatestUpdatesNotice />

      {/* Hero */}
      <div
        className="text-center px-6 py-14 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 50%, ${NAVY_MID} 100%)`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 20% 50%, rgba(201,168,76,0.15) 0%, transparent 70%),
                       radial-gradient(ellipse 40% 60% at 80% 20%, rgba(201,168,76,0.1) 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[4px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, transparent)`,
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
        <p className="relative z-[1] m-0 text-slate-300 opacity-85 font-normal text-[1.05rem]">
          {t("pageSubtitle")}
        </p>
        {currentBranchId != null && (
          <div
            className="relative z-[1] inline-flex items-center gap-1.5 mt-3.5 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(201,168,76,0.18)",
              border: "1.5px solid rgba(201,168,76,0.5)",
              color: GOLD_LIGHT,
            }}
          >
            <span>🏫</span>
            <span>{currentBranchName}</span>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div
        className="max-w-[740px] mx-auto -mt-px grid grid-cols-1 sm:grid-cols-2 gap-5 px-7 py-6 bg-white rounded-b-2xl"
        style={{
          borderTop: `3px solid ${GOLD}`,
          boxShadow: "0 6px 24px rgba(26,39,68,0.12)",
        }}
      >
        {[
          {
            label: `${t("className") || "Class"} *`,
            value: filters.className,
            onChange: handleClassDropdown,
            disabled: false,
            options: classNames,
            placeholder: t("selectClass") || "Select Class",
          },
          {
            label: `${t("section") || "Section"} *`,
            value: filters.section,
            onChange: handleSectionDropdown,
            disabled: !filters.className,
            options: sections,
            placeholder: t("selectSection") || "Select Section",
          },
        ].map((f, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold uppercase tracking-[0.06em]"
              style={{ color: NAVY }}
            >
              {f.label}
            </label>
            <select
              value={f.value}
              onChange={f.onChange}
              disabled={f.disabled}
              style={{
                ...selectStyle,
                opacity: f.disabled ? 0.5 : 1,
                cursor: f.disabled ? "not-allowed" : "pointer",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = GOLD;
                e.target.style.boxShadow = "0 0 0 3px rgba(201,168,76,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e6f0";
                e.target.style.boxShadow = "";
              }}
            >
              <option value="">{f.placeholder}</option>
              {f.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Search form */}
      <div
        className="max-w-[740px] mx-auto my-7 bg-white rounded-2xl px-8 py-8 border border-gray-200"
        style={{ boxShadow: "0 6px 24px rgba(26,39,68,0.12)" }}
      >
        <form onSubmit={handleSearch}>
          <div className="bg-[#fdf6e3] border-l-4 border-[#c9a84c] rounded-lg px-4 py-3 mb-6 text-[#7a5c10] text-sm leading-relaxed">
            <p className="m-0 font-medium">{t("allFieldsRequired")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {[
              {
                id: "firstName",
                label: `${t("firstName")} *`,
                placeholder: t("firstNamePlaceholder"),
              },
              {
                id: "rollNumber",
                label: `${t("rollNumber")} *`,
                placeholder: t("rollNumberPlaceholder"),
              },
            ].map((f) => (
              <div key={f.id} className="flex flex-col">
                <label
                  htmlFor={f.id}
                  className="text-xs font-bold uppercase tracking-[0.06em] mb-1.5"
                  style={{ color: NAVY }}
                >
                  {f.label}
                </label>
                <input
                  type="text"
                  id={f.id}
                  name={f.id}
                  value={filters[f.id]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className={inputCls}
                  style={{ color: NAVY }}
                  onFocus={(e) => {
                    e.target.style.borderColor = GOLD;
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(201,168,76,0.15)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "";
                    e.target.style.boxShadow = "";
                    e.target.style.transform = "";
                  }}
                  required
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center flex-wrap max-sm:flex-col">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 border-none rounded-full text-white font-bold text-[0.95rem] cursor-pointer transition-all duration-[250ms] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 max-sm:w-full"
              style={{
                background: NAVY,
                boxShadow: "0 4px 14px rgba(26,39,68,0.3)",
              }}
            >
              {loading ? t("searching") : t("searchBtn")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-8 py-3 bg-transparent border-2 border-gray-200 rounded-full font-bold text-[0.95rem] cursor-pointer transition-all duration-[250ms] hover:-translate-y-0.5 max-sm:w-full"
              style={{ color: NAVY }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = GOLD;
                e.target.style.color = GOLD;
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.color = NAVY;
              }}
            >
              {t("resetBtn")}
            </button>
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
          className="max-w-[740px] mx-auto mb-10 bg-white rounded-2xl px-8 py-7 border border-gray-200"
          style={{ boxShadow: "0 6px 24px rgba(26,39,68,0.12)" }}
        >
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 max-sm:flex-col max-sm:gap-3 max-sm:text-center">
            <h2 className="text-[1.4rem] font-bold m-0" style={{ color: NAVY }}>
              {t("searchResults")}
            </h2>
            <span
              className="text-[0.85rem] font-bold px-4 py-1.5 rounded-full"
              style={{ background: NAVY, color: GOLD_LIGHT }}
            >
              {students.length}{" "}
              {students.length !== 1 ? t("studentsFound") : t("studentFound")}
            </span>
          </div>

          {students.length > 0 ? (
            <div className="flex flex-col items-center gap-0">
              {students.map((s) => (
                <div
                  key={s.StudentID}
                  className="w-full max-w-[700px] mx-auto mb-5 bg-white border border-gray-200 rounded-2xl p-7 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl max-sm:p-4"
                  style={{ boxShadow: "0 2px 8px rgba(26,39,68,0.08)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = GOLD)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#e2e6f0")
                  }
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[4px]"
                    style={{
                      background: `linear-gradient(90deg, ${NAVY}, ${GOLD})`,
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
                        style={{ color: NAVY }}
                      >
                        {s.FirstName} {s.LastName}
                      </h3>
                      <p
                        className="font-semibold text-[0.95rem] m-0 mb-1"
                        style={{ color: GOLD }}
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
                          className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-lg"
                        >
                          <span className="text-[18px] flex-shrink-0">
                            {item.icon}
                          </span>
                          <div className="flex flex-col gap-0.5 flex-1">
                            <span className="text-[0.72rem] text-gray-400 font-bold uppercase tracking-[0.04em]">
                              {item.label}
                            </span>
                            <span
                              className="font-semibold text-[0.9rem]"
                              style={{ color: NAVY }}
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
                style={{ color: NAVY }}
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
