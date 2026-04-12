"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LatestUpdatesNotice from "@/components/shared/LatestUpdatesNotice";
import { useImages } from "@/hooks/useImages";
import { useTranslations } from "@/store/languageStore";
import "@/styles/GallaryPage.css";

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
    <div className="gallery-page">
      <Navbar />
      <LatestUpdatesNotice />
      <section className="gallery-header">
        <div className="container">
          <h1 className="gallery-title">{t("title")}</h1>
        </div>
      </section>
      <section className="gallery-content">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="category-filter"
          >
            <h2 className="filter-title">{t("browseByCategory")}</h2>
            <div className="filter-buttons">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`filter-btn ${category === c.value ? "active" : ""}`}
                >
                  <span className="filter-icon">{c.icon}</span>
                  <span className="filter-label">{c.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {isError && (
            <div className="error-message">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span>{t("failedToLoad")}</span>
                <button onClick={refetch} className="retry-btn">
                  {t("tryAgain")}
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>{t("loading")}</p>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="gallery-stats"
              >
                <p>
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
              {filtered.length === 0 ? (
                <div className="no-images">
                  <div className="no-images-content">
                    <span className="no-images-icon">📷</span>
                    <h3>{t("noImages")}</h3>
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
                  className="gallery-grid"
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
                      className="gallery-item"
                      onClick={() => openLightbox(img, idx)}
                    >
                      <div className="image-container">
                        <img
                          src={img.ImagePath || img.ImageUrl}
                          alt={img.Description || "Gallery image"}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className="image-fallback"
                          style={{ display: "none" }}
                        >
                          <span>📷</span>
                          <p>{t("imageNotAvailable")}</p>
                        </div>
                        <div className="image-overlay">
                          <div className="overlay-content">
                            <span className="view-icon">👁️</span>
                            <p>{t("viewImage")}</p>
                          </div>
                        </div>
                      </div>
                      <div className="image-info">
                        <div className="image-category">
                          <span className={`category-badge ${img.ImageType}`}>
                            {catIcon(img.ImageType)} {catLabel(img.ImageType)}
                          </span>
                        </div>
                        {img.Description && (
                          <p className="image-description">{img.Description}</p>
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

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lightbox-overlay"
          onClick={closeLightbox}
        >
          <div
            className="lightbox-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="lightbox-close" onClick={closeLightbox}>
              ✕
            </button>
            {filtered.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  onClick={() => navigate("prev")}
                >
                  ‹
                </button>
                <button
                  className="lightbox-nav lightbox-next"
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
              className="lightbox-content"
            >
              <img
                src={selected.ImagePath || selected.ImageUrl}
                alt={selected.Description || "Gallery"}
                className="lightbox-image"
              />
              <div className="lightbox-info">
                <span className={`category-badge ${selected.ImageType}`}>
                  {catIcon(selected.ImageType)} {catLabel(selected.ImageType)}
                </span>
                {selected.Description && (
                  <p className="lightbox-description">{selected.Description}</p>
                )}
                <div className="lightbox-meta">
                  <span>
                    {selectedIdx + 1} {t("of")} {filtered.length}
                  </span>
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
