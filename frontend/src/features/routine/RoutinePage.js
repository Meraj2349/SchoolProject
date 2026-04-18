"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, Download, Filter, Search, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useRoutines, useRoutineFilterOptions } from "@/hooks/useRoutines";
import { useTranslations } from "@/store/languageStore";
import { useBranchStore } from "@/store/branchStore";

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch { return d; }
}

function isPDF(type, url = "") { return type === "pdf" || url.toLowerCase().endsWith(".pdf"); }
function isImage(type, url = "") {
  if (type === "image") return true;
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
}

const PER_PAGE = 12;

const greenGrad = { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" };

export default function RoutinePage() {
  const { data: allRoutines = [], isLoading, isError, refetch } = useRoutines();
  const { data: filterOptions = { classes: [], sections: [] } } = useRoutineFilterOptions();
  const t = useTranslations("routine");
  const { currentBranchId, currentBranchName } = useBranchStore();

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
    return list.sort((a, b) => new Date(b.RoutineDate) - new Date(a.RoutineDate));
  }, [allRoutines, selClass, selSection, searchTerm]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const clearFilters = () => { setSelClass(""); setSelSection(""); setSearchTerm(""); setPage(1); };

  const selectCls = "px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-sm transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:bg-white";
  const paginBtnCls = "px-5 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:border-emerald-500 hover:text-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed";

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-600">{t("loadingRoutines")}</p>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans">
      <Navbar />
      <LatestUpdatesNotice />

      {/* Hero */}
      <section className="relative overflow-hidden py-16 pb-10 text-white" style={greenGrad}>
        <div className="max-w-[1200px] mx-auto px-5 relative z-[2]">
          <div className="max-w-[600px] mx-auto text-center">
            <h1 className="flex items-center justify-center gap-3 text-[2.5rem] font-semibold m-0 mb-4 text-white">
              <Calendar className="w-10 h-10" />
              {t("pageTitle")}
            </h1>
            {currentBranchId != null && (
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-green-900"
                style={{ background: "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)", border: "1.5px solid #10b981" }}>
                <span>🏫</span>
                <span>{currentBranchName}</span>
              </div>
            )}
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute right-[-100px] top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <div className="w-[400px] h-[400px] border-[3px] border-white rounded-full" />
        </div>
      </section>

      {/* Content */}
      <div className="py-16">
        <div className="max-w-[1200px] mx-auto px-5">

          {/* Filters */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200/80 mb-10">
            <div className="flex gap-5 items-center mb-5 max-sm:flex-col">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="w-full pl-12 pr-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
                />
              </div>
              <button
                className={`flex items-center gap-2 px-6 py-4 text-white border-none rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 max-sm:w-full max-sm:justify-center ${showFilters ? "opacity-90" : ""}`}
                style={{ ...greenGrad, boxShadow: "0 4px 15px rgba(16,185,129,0.3)" }}
                onClick={() => setShowFilters((v) => !v)}
              >
                <Filter className="w-[18px] h-[18px]" /> {t("filters")}
              </button>
            </div>

            {showFilters && (
              <div className="border-t border-gray-200 pt-5">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-5 items-end">
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700 text-sm">{t("class")}</label>
                    <select value={selClass} onChange={(e) => { setSelClass(e.target.value); setPage(1); }} className={selectCls}>
                      <option value="">{t("allClasses")}</option>
                      {filterOptions.classes.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-semibold text-gray-700 text-sm">{t("section")}</label>
                    <select value={selSection} onChange={(e) => { setSelSection(e.target.value); setPage(1); }} className={selectCls}>
                      <option value="">{t("allSections")}</option>
                      {filterOptions.sections.map((s, i) => <option key={i} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={clearFilters}
                    className="px-5 py-3 text-white border-none rounded-lg cursor-pointer font-medium transition-all duration-300 hover:-translate-y-0.5 max-sm:w-full"
                    style={{ ...greenGrad, boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}
                  >
                    {t("clearFilters")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Results header */}
          <div className="mb-8">
            <h2 className="text-[1.8rem] text-gray-900 m-0 font-bold">
              {filtered.length} {filtered.length !== 1 ? t("routinesFound") : t("routineFound")}
            </h2>
          </div>

          {/* Error */}
          {isError && (
            <div className="bg-red-50 text-red-800 p-5 rounded-xl text-center mb-8 border border-red-200">
              <p className="m-0 mb-2">{t("failedToLoad")}</p>
              <button onClick={refetch} className="mt-2 px-4 py-2 bg-red-700 text-white border-none rounded-lg cursor-pointer font-medium">
                {t("tryAgain")}
              </button>
            </div>
          )}

          {/* Grid */}
          {paged.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 mb-10">
                {paged.map((r) => (
                  <div
                    key={r.RoutineID}
                    className="bg-white rounded-2xl p-6 shadow-md border border-gray-200/80 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:outline-2 focus-within:outline-emerald-500 focus-within:outline-offset-1"
                  >
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 w-full h-1" style={greenGrad} />

                    <div className="mb-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-[1.25rem] font-bold text-gray-900 m-0 leading-snug flex-1">{r.RoutineTitle}</h3>
                        {r.FileURL && isPDF(r.FileType, r.FileURL) && (
                          <span className="px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-yellow-100 text-yellow-800 flex-shrink-0">PDF</span>
                        )}
                        {r.FileURL && isImage(r.FileType, r.FileURL) && (
                          <span className="px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 flex-shrink-0">IMG</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm">
                        <Users className="w-4 h-4" />
                        <span>{r.ClassName} – {r.Section}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>{fmtDate(r.RoutineDate)}</span>
                      </div>
                      {r.Description && <p className="text-gray-500 leading-relaxed m-0">{r.Description}</p>}
                      {r.FileURL && (
                        <a
                          href={r.FileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-emerald-500 no-underline font-medium px-4 py-2 border-2 border-gray-200 rounded-lg transition-all duration-300 bg-gray-50 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 hover:-translate-y-0.5 focus:outline-2 focus:outline-emerald-500 focus:outline-offset-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>{isPDF(r.FileType, r.FileURL) ? t("viewPDF") : t("viewImage")}</span>
                        </a>
                      )}
                      <div className="pt-4 mt-2 border-t border-gray-100 flex items-center gap-1.5 text-gray-400 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t("added")} {fmtDate(r.CreatedDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-10 flex-wrap">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className={paginBtnCls}>
                    {t("previous")}
                  </button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-11 h-11 flex items-center justify-center border-2 rounded-lg cursor-pointer font-medium transition-all duration-300 ${
                          page === p
                            ? "text-white border-transparent"
                            : "bg-white text-gray-700 border-gray-200 hover:border-emerald-500 hover:text-emerald-500"
                        }`}
                        style={page === p ? greenGrad : {}}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} className={paginBtnCls}>
                    {t("next")}
                  </button>
                </div>
              )}
            </>
          ) : (
            !isLoading && !isError && (
              <div className="text-center py-16 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-5 text-gray-300" />
                <h3 className="text-2xl text-gray-700 m-0 mb-3">{t("noRoutinesFound")}</h3>
                <p className="text-base leading-relaxed m-0 mb-5">
                  {selClass || selSection || searchTerm ? t("tryAdjustFilters") : t("noRoutinesPublished")}
                </p>
                {(selClass || selSection || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 text-white border-none rounded-lg cursor-pointer font-semibold transition-all duration-300 hover:-translate-y-0.5"
                    style={greenGrad}
                  >
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
