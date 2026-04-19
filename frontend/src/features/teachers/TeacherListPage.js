"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import LottieLoader from "@/components/ui/LottieLoader";
import BranchBadge from "@/components/ui/BranchBadge";
import { useTeachers } from "@/hooks/useTeachers";
import { useImagesByTeacher } from "@/hooks/useImages";
import { useTranslations } from "@/store/languageStore";
import Image from "next/image";
import { useClassNames, useStandardSections } from "@/hooks/useClasses";

const NAVY = "#059669";
const NAVY_DARK = "#047857";
const NAVY_MID = "#10b981";
const GOLD = "#10b981";
const GOLD_LIGHT = "#a7f3d0";

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
    <div
      className="bg-white rounded-[18px] overflow-hidden border border-gray-200 transition-all duration-[350ms] hover:-translate-y-2 hover:shadow-2xl relative"
      style={{ boxShadow: "0 4px 20px rgba(5,150,105,0.1)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e6f0")}
    >
      {/* Card header */}
      <div
        className="relative overflow-hidden px-5 py-7 text-center"
        style={{
          background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 60%, ${NAVY_MID} 100%)`,
          borderBottom: `3px solid ${GOLD}`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative w-[88px] h-[88px] mx-auto z-[1]">
          {showImage ? (
            <Image
              src={img.ImagePath}
              alt={`${teacher.FirstName} ${teacher.LastName}`}
              width={88}
              height={88}
              className="w-full h-full object-cover rounded-full transition-transform duration-300 hover:scale-105"
              style={{
                border: `3px solid ${GOLD}`,
                boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              }}
              onError={() => setImgError(true)}
            />
          ) : null}
          <div
            className="absolute top-0 left-0 w-full h-full rounded-full flex items-center justify-center text-3xl font-extrabold text-white"
            style={{
              backgroundColor: av.color,
              border: `3px solid ${GOLD}`,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              display: showImage ? "none" : "flex",
            }}
          >
            {av.initials}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="px-5.5 py-5" style={{ padding: "20px 22px" }}>
        <h3
          className="font-bold text-[1.15rem] text-center m-0 mb-3.5"
          style={{ color: NAVY }}
        >
          {teacher.FirstName} {teacher.LastName}
        </h3>
        <div className="flex flex-col gap-2 mb-3.5">
          {[
            {
              value: teacher.Subject,
              cls: "font-bold text-[0.9rem]",
              style: { color: NAVY },
            },
            {
              value: teacher.Email,
              cls: "text-gray-500 text-[0.88rem] break-all",
            },
            {
              value: teacher.ContactNumber,
              cls: "text-gray-500 text-[0.88rem]",
            },
          ].map((item, i) =>
            item.value ? (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 transition-colors hover:bg-emerald-50"
              >
                <span className={item.cls} style={item.style}>
                  {item.value}
                </span>
              </div>
            ) : null,
          )}
        </div>
        <div className="pt-3 border-t border-gray-200 flex items-center justify-center gap-1.5 text-gray-400 text-[0.82rem]">
          {t("joined")} {new Date(teacher.JoiningDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

const NavyHeader = ({ children }) => (
  <div
    className="text-center flex flex-col items-center justify-center px-6 py-14 relative overflow-hidden"
    style={{
      background: `linear-gradient(135deg, ${NAVY_DARK} 0%, ${NAVY} 50%, ${NAVY_MID} 100%)`,
    }}
  >
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 60% 50% at 20% 50%, rgba(16,185,129,0.15) 0%, transparent 70%),
                   radial-gradient(ellipse 40% 60% at 80% 20%, rgba(16,185,129,0.1) 0%, transparent 60%)`,
      }}
    />
    <div
      className="absolute bottom-0 left-0 right-0 h-[4px]"
      style={{
        background: `linear-gradient(90deg, transparent, ${GOLD}, ${GOLD_LIGHT}, ${GOLD}, transparent)`,
      }}
    />
    {children}
  </div>
);

export default function TeacherListPage() {
  const { data: teachers = [], isLoading, isError, refetch } = useTeachers();
  const [search, setSearch] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const t = useTranslations("teachers");

  const { data: classNames = [] } = useClassNames();
  const { data: sections = [] } = useStandardSections();

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
    setSelectedSection("");
  };

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

  const selectStyle = {
    padding: "10px 14px",
    borderRadius: 8,
    border: `1.5px solid #e2e6f0`,
    fontSize: 14,
    background: "#f8f9fc",
    color: NAVY,
    cursor: "pointer",
    outline: "none",
    width: "100%",
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#f0fdf4] font-sans">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <LottieLoader size="medium" text={t("loadingTeachers")} />
        </div>
        <Footer />
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen bg-[#f0fdf4] font-sans">
        <Navbar />
        <div className="text-center px-6 py-12 bg-white rounded-2xl shadow-lg max-w-[500px] mx-auto mt-10 border border-gray-200">
          <p className="text-red-700 text-[1.1rem] mb-5">
            {t("failedToFetch")}
          </p>
          <button
            onClick={refetch}
            className="border-none px-7 py-3 rounded-full cursor-pointer text-[0.95rem] font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
            style={{ background: NAVY }}
          >
            {t("tryAgain")}
          </button>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f0fdf4] font-sans">
      <Navbar />
      <LatestUpdatesNotice />

      <NavyHeader>
        <h1
          className="relative z-[1] text-white font-extrabold m-0 mb-2 tracking-tight"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            letterSpacing: "-0.02em",
          }}
        >
          {t("pageTitle")}
        </h1>
        <div className="relative z-[1] mt-3.5 inline-block">
          <BranchBadge />
        </div>
      </NavyHeader>

      {/* Class & Section filter bar */}
      <div
        className="max-w-[920px] mx-auto -mt-px grid grid-cols-1 sm:grid-cols-2 gap-5 px-7 py-5.5 bg-white rounded-b-2xl"
        style={{
          padding: "22px 28px",
          borderTop: `3px solid ${GOLD}`,
          boxShadow: "0 6px 24px rgba(5,150,105,0.12)",
        }}
      >
        {[
          {
            label: t("className") || "Class",
            value: selectedClass,
            onChange: handleClassChange,
            disabled: false,
            options: classNames,
            placeholder: t("allClasses") || "All Classes",
          },
          {
            label: t("section") || "Section",
            value: selectedSection,
            onChange: (e) => setSelectedSection(e.target.value),
            disabled: !selectedClass,
            options: sections,
            placeholder: t("allSections") || "All Sections",
          },
        ].map((field, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <label
              className="text-xs font-bold uppercase tracking-[0.06em]"
              style={{ color: NAVY }}
            >
              {field.label}
            </label>
            <select
              value={field.value}
              onChange={field.onChange}
              disabled={field.disabled}
              style={{
                ...selectStyle,
                opacity: field.disabled ? 0.5 : 1,
                cursor: field.disabled ? "not-allowed" : "pointer",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = GOLD;
                e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e6f0";
                e.target.style.boxShadow = "";
              }}
            >
              <option value="">{field.placeholder}</option>
              {field.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Search section */}
      <div
        className="max-w-[920px] mx-auto my-7 bg-white px-7 py-6 rounded-2xl border border-gray-200"
        style={{ boxShadow: "0 6px 24px rgba(5,150,105,0.1)" }}
      >
        <div className="flex gap-3 items-center flex-wrap mb-3.5 max-sm:flex-col max-sm:items-stretch">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border-[1.5px] border-gray-200 rounded-full text-[0.95rem] bg-gray-50 transition-all duration-200 focus:outline-none focus:bg-white"
              style={{ color: NAVY }}
              onFocus={(e) => {
                e.target.style.borderColor = GOLD;
                e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e6f0";
                e.target.style.boxShadow = "";
              }}
            />
          </div>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-3 border-[1.5px] border-gray-200 rounded-full text-[0.95rem] bg-gray-50 cursor-pointer min-w-[140px]"
            style={{ color: NAVY }}
            onFocus={(e) => {
              e.target.style.borderColor = GOLD;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e6f0";
            }}
          >
            <option value="all">{t("allFields")}</option>
            <option value="name">{t("name")}</option>
            <option value="subject">{t("subject")}</option>
            <option value="email">{t("email")}</option>
          </select>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="border-none px-5 py-3 rounded-full cursor-pointer text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 max-sm:w-full"
              style={{ background: NAVY }}
            >
              {t("clear")}
            </button>
          )}
        </div>
        <div className="text-right pt-2.5 border-t border-gray-200">
          <span
            className="text-[0.82rem] font-bold px-3.5 py-1.5 rounded-full inline-block"
            style={{ background: NAVY, color: GOLD_LIGHT }}
          >
            {filtered.length}{" "}
            {filtered.length !== 1 ? t("teachersFound") : t("teacherFound")}
          </span>
        </div>
      </div>

      {/* Grid or empty state */}
      {filtered.length === 0 ? (
        <div
          className="text-center px-6 py-12 bg-white rounded-2xl shadow-md mx-auto mb-12 max-w-[480px] border border-gray-200"
          style={{ margin: "0 auto 48px" }}
        >
          <div className="text-[3.5rem] mb-3.5 opacity-55">🔍</div>
          <h3
            className="font-semibold text-[1.2rem] m-0"
            style={{ color: NAVY }}
          >
            {t("noTeachersFound")}
          </h3>
        </div>
      ) : (
        <div
          className="grid gap-6 max-w-[1300px] mx-auto mb-12 px-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {filtered.map((teacher) => (
            <TeacherCard key={teacher.TeacherID} teacher={teacher} />
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
