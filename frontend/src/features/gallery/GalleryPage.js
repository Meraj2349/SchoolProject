"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useImages } from "@/hooks/useImages";
import { useTranslations } from "@/store/languageStore";

const CAT_BADGE_STYLES = {
  school: { bg: "#f0fdf4", color: "#10b981" },
  student: { bg: "#f0fdf4", color: "#059669" },
  teacher: { bg: "#f0fdf4", color: "#047857" },
  event: { bg: "#f8fafc", color: "#374151" },
  notice: { bg: "#f8fafc", color: "#6b7280" },
  general: { bg: "#f8f9fa", color: "#495057" },
};

export default function GalleryPage() {
  const { data: images = [], isLoading, isError, refetch } = useImages();
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const t = useTranslations("gallery");

  const CATEGORIES = [
    { value: "all", label: t("categories.all"), icon: "🖼️" },
    { value: "general", label: t("categories.general"), icon: "📸" },
    { value: "school", label: t("categories.school"), icon: "🏫" },
    { value: "student", label: t("categories.student"), icon: "🎓" },
    { value: "teacher", label: t("categories.teacher"), icon: "👨‍🏫" },
    { value: "event", label: t("categories.event"), icon: "🎉" },
    { value: "notice", label: t("categories.notice"), icon: "📢" },
  ];

  const filtered =
    category === "all"
      ? images
      : images.filter((i) => i.ImageType === category);

  const openLightbox = (img, idx) => {
    setSelected(img);
    setSelectedIdx(idx);
  };
  const closeLightbox = () => setSelected(null);
  const navigate = (dir) => {
    const next =
      dir === "next"
        ? (selectedIdx + 1) % filtered.length
        : (selectedIdx - 1 + filtered.length) % filtered.length;
    setSelectedIdx(next);
    setSelected(filtered[next]);
  };

  useEffect(() => {
    const handler = (e) => {
      if (!selected) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigate("next");
      if (e.key === "ArrowLeft") navigate("prev");
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selected, selectedIdx, filtered]);

  const catLabel = (type) =>
    CATEGORIES.find((c) => c.value === type)?.label ?? type;
  const catIcon = (type) =>
    CATEGORIES.find((c) => c.value === type)?.icon ?? "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <LatestUpdatesNotice />

      {/* Header */}
      <section
        className="py-16 text-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 55%)",
          }}
        />
        <h1
          className="relative z-[1] font-extrabold text-white m-0 text-shadow"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
        >
          {t("title")}
        </h1>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-[1400px] mx-auto px-8">
          {/* Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-[1.8rem] font-medium mb-6 text-gray-700">
              {t("browseByCategory")}
            </h2>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full cursor-pointer transition-all duration-300 text-base font-medium border-2 ${
                    category === c.value
                      ? "text-white border-transparent -translate-y-0.5"
                      : "bg-white border-gray-200 text-gray-700 shadow-md hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-500 hover:shadow-lg"
                  }`}
                  style={
                    category === c.value
                      ? {
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                          boxShadow: "0 6px 20px rgba(16,185,129,0.4)",
                        }
                      : {}
                  }
                >
                  <span className="text-xl">{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Error */}
          {isError && (
            <div className="flex justify-center my-8">
              <div className="flex items-center gap-4 px-8 py-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
                <span className="text-2xl">⚠️</span>
                <span>{t("failedToLoad")}</span>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-red-700 text-white border-none rounded-lg cursor-pointer font-medium hover:bg-red-800"
                >
                  {t("tryAgain")}
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="w-[50px] h-[50px] border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-8 p-4 bg-white/90 rounded-xl border border-gray-200 shadow-md"
              >
                <p className="m-0 text-[1.1rem] text-gray-700">
                  {t("showing")} <strong>{filtered.length}</strong>{" "}
                  {t("images")}
                  {category !== "all" && (
                    <>
                      {" "}
                      {t("in")} <strong>{catLabel(category)}</strong>
                    </>
                  )}
                </p>
              </motion.div>

              {/* No images */}
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <div className="text-center text-gray-500">
                    <span className="text-6xl block mb-4">📷</span>
                    <h3 className="text-2xl text-gray-600">{t("noImages")}</h3>
                  </div>
                </div>
              ) : (
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                  className="grid gap-8 mt-8"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(320px, 1fr))",
                  }}
                >
                  {filtered.map((img, idx) => (
                    <motion.div
                      key={img.ImageID ?? idx}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.5 },
                        },
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md border border-white/20 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group"
                      onClick={() => openLightbox(img, idx)}
                    >
                      {/* Image */}
                      <div className="relative w-full h-[250px] overflow-hidden">
                        <img
                          src={img.ImagePath || img.ImageUrl}
                          alt={img.Description || "Gallery image"}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="hidden absolute inset-0 flex-col items-center justify-center bg-gray-100 text-gray-500">
                          <span className="text-5xl mb-2">📷</span>
                          <p className="m-0 text-sm">
                            {t("imageNotAvailable")}
                          </p>
                        </div>
                        {/* Hover overlay */}
                        <div
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(16,185,129,0.8), rgba(5,150,105,0.8))",
                          }}
                        >
                          <div className="text-center text-white translate-y-5 group-hover:translate-y-0 transition-transform duration-300">
                            <span className="text-4xl block mb-2">👁️</span>
                            <p className="m-0 text-[1.1rem] font-medium">
                              {t("viewImage")}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-6">
                        <div className="mb-3">
                          <span
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[0.9rem] font-medium capitalize"
                            style={{
                              background:
                                CAT_BADGE_STYLES[img.ImageType]?.bg ??
                                "#f8f9fa",
                              color:
                                CAT_BADGE_STYLES[img.ImageType]?.color ??
                                "#495057",
                            }}
                          >
                            {catIcon(img.ImageType)} {catLabel(img.ImageType)}
                          </span>
                        </div>
                        {img.Description && (
                          <p className="m-0 mb-3 text-gray-600 leading-relaxed text-[0.95rem]">
                            {img.Description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-8 backdrop-blur-[10px]"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-[85vw] max-h-[85vh] flex items-center justify-center mx-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              className="absolute top-5 right-5 w-[50px] h-[50px] rounded-full border-2 border-white/50 bg-white/90 text-gray-700 text-[1.8rem] flex items-center justify-center cursor-pointer z-10 transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500 hover:rotate-90 hover:scale-110"
              onClick={closeLightbox}
            >
              ✕
            </button>
            {/* Nav */}
            {filtered.length > 1 && (
              <>
                <button
                  className="absolute left-[30px] top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full border-2 border-emerald-500/50 text-white text-3xl flex items-center justify-center cursor-pointer z-10 transition-all duration-300 hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))",
                  }}
                  onClick={() => navigate("prev")}
                >
                  ‹
                </button>
                <button
                  className="absolute right-[30px] top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full border-2 border-emerald-500/50 text-white text-3xl flex items-center justify-center cursor-pointer z-10 transition-all duration-300 hover:scale-110"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))",
                  }}
                  onClick={() => navigate("next")}
                >
                  ›
                </button>
              </>
            )}
            <motion.div
              key={selected.ImageID}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center max-w-full max-h-full"
            >
              <img
                src={selected.ImagePath || selected.ImageUrl}
                alt={selected.Description || "Gallery"}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl"
              />
              <div className="bg-white/95 p-6 rounded-xl mt-4 text-center backdrop-blur-[10px] max-w-[600px]">
                <span
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[0.9rem] font-medium capitalize mb-4"
                  style={{
                    background:
                      CAT_BADGE_STYLES[selected.ImageType]?.bg ?? "#f8f9fa",
                    color:
                      CAT_BADGE_STYLES[selected.ImageType]?.color ?? "#495057",
                  }}
                >
                  {catIcon(selected.ImageType)} {catLabel(selected.ImageType)}
                </span>
                {selected.Description && (
                  <p className="text-[1.1rem] m-0 mb-4 text-gray-600 leading-relaxed">
                    {selected.Description}
                  </p>
                )}
                <div className="text-[0.9rem] text-gray-500 font-medium">
                  {selectedIdx + 1} {t("of")} {filtered.length}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
      <Footer />
    </div>
  );
}
