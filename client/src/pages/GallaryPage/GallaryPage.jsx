import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import imageService from "../../api/imageService";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import LatestUpdatesNotice from "../Listpage/LatestUpdatesNotice";

import "./GallaryPage.css";

const GallaryPage = () => {
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = [
    { value: "all", label: "All Images", icon: "🖼️" },
    { value: "general", label: "General", icon: "📸" },
    { value: "school", label: "School Campus", icon: "🏫" },
    { value: "student", label: "Student Life", icon: "🎓" },
    { value: "teacher", label: "Faculty", icon: "👨‍🏫" },
    { value: "event", label: "Events", icon: "🎉" },
    { value: "notice", label: "Notices", icon: "📢" },
  ];

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    filterImages();
  }, [selectedCategory, images]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError("");
      // Use getImagesWithDetails to get student/teacher information
      const data = await imageService.getImagesWithDetails();
      setImages(data);
    } catch (err) {
      setError("Failed to load images. Please try again later.");
      console.error("Error loading images:", err);
    } finally {
      setLoading(false);
    }
  };



  const filterImages = () => {
    if (selectedCategory === "all") {
      setFilteredImages(images);
    } else {
      setFilteredImages(
        images.filter((img) => img.ImageType === selectedCategory)
      );
    }
  };

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const navigateImage = (direction) => {
    const newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % filteredImages.length
        : (currentImageIndex - 1 + filteredImages.length) %
          filteredImages.length;

    setCurrentImageIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (selectedImage) {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") navigateImage("next");
        if (e.key === "ArrowLeft") navigateImage("prev");
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [selectedImage, currentImageIndex, filteredImages]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="gallery-page">
      <Navbar />
      <LatestUpdatesNotice />

      {/* Simple Header */}
      <section className="gallery-header">
        <div className="container">
          <h1 className="gallery-title">Gallery</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="gallery-content">
        <div className="container">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="category-filter"
          >
            <h2 className="filter-title">Browse by Category</h2>
            <div className="filter-buttons">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`filter-btn ${
                    selectedCategory === category.value ? "active" : ""
                  }`}
                >
                  <span className="filter-icon">{category.icon}</span>
                  <span className="filter-label">{category.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="error-message"
            >
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
                <button onClick={loadImages} className="retry-btn">
                  Try Again
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading amazing memories...</p>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {!loading && !error && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="gallery-stats"
              >
                <p>
                  Showing <strong>{filteredImages.length}</strong> images
                  {selectedCategory !== "all" && (
                    <span>
                      {" "}
                      in{" "}
                      <strong>
                        {
                          categories.find((c) => c.value === selectedCategory)
                            ?.label
                        }
                      </strong>
                    </span>
                  )}
                </p>
              </motion.div>

              {filteredImages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="no-images"
                >
                  <div className="no-images-content">
                    <span className="no-images-icon">📷</span>
                    <h3>No images found</h3>
                    <p>No images available in this category yet.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="gallery-grid"
                >
                  {filteredImages.map((image, index) => (
                    <motion.div
                      key={image.ImageID || index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="gallery-item"
                      onClick={() => openLightbox(image, index)}
                    >
                      <div className="image-container">
                        <img
                          src={image.ImagePath || image.ImageUrl}
                          alt={image.Description || "Gallery image"}
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
                          <p>Image not available</p>
                        </div>
                        <div className="image-overlay">
                          <div className="overlay-content">
                            <span className="view-icon">👁️</span>
                            <p className="overlay-text">View Image</p>
                          </div>
                        </div>
                      </div>
                      <div className="image-info">
                        <div className="image-category">
                          <span className={`category-badge ${image.ImageType}`}>
                            {
                              categories.find(
                                (c) => c.value === image.ImageType
                              )?.icon
                            }
                            {categories.find((c) => c.value === image.ImageType)
                              ?.label || image.ImageType}
                          </span>
                        </div>
                        {image.Description && (
                          <p className="image-description">
                            {image.Description}
                          </p>
                        )}
                        {(image.StudentFirstName || image.TeacherFirstName) && (
                          <div className="image-associations">
                            {image.StudentFirstName && (
                              <p className="association-tag">
                                🎓 {image.StudentFirstName} {image.StudentLastName}
                              </p>
                            )}
                            {image.TeacherFirstName && (
                              <p className="association-tag">
                                👨‍🏫 {image.TeacherFirstName} {image.TeacherLastName}
                              </p>
                            )}
                          </div>
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

      {/* Lightbox Modal */}
      {selectedImage && (
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

            {filteredImages.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  onClick={() => navigateImage("prev")}
                >
                  ‹
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  onClick={() => navigateImage("next")}
                >
                  ›
                </button>
              </>
            )}

            <motion.div
              key={selectedImage.ImageID}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="lightbox-content"
            >
              <img
                src={selectedImage.ImagePath || selectedImage.ImageUrl}
                alt={selectedImage.Description || "Gallery image"}
                className="lightbox-image"
              />
              <div className="lightbox-info">
                <div className="lightbox-category">
                  <span className={`category-badge ${selectedImage.ImageType}`}>
                    {
                      categories.find(
                        (c) => c.value === selectedImage.ImageType
                      )?.icon
                    }
                    {categories.find((c) => c.value === selectedImage.ImageType)
                      ?.label || selectedImage.ImageType}
                  </span>
                </div>
                
                {selectedImage.Description && (
                  <p className="lightbox-description">
                    {selectedImage.Description}
                  </p>
                )}
                
                {(selectedImage.StudentFirstName || selectedImage.TeacherFirstName) && (
                  <div className="lightbox-associations">
                    {selectedImage.StudentFirstName && (
                      <p className="association-info">
                        <span className="association-label">👨‍🎓 Student:</span>
                        {selectedImage.StudentFirstName} {selectedImage.StudentLastName}
                        {selectedImage.RollNumber && (
                          <span className="roll-number"> (Roll: {selectedImage.RollNumber})</span>
                        )}
                      </p>
                    )}
                    {selectedImage.TeacherFirstName && (
                      <p className="association-info">
                        <span className="association-label">👨‍🏫 Teacher:</span>
                        {selectedImage.TeacherFirstName} {selectedImage.TeacherLastName}
                        {selectedImage.Subject && (
                          <span className="subject"> ({selectedImage.Subject})</span>
                        )}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="lightbox-meta">
                  <span>{currentImageIndex + 1} of {filteredImages.length}</span>
                  {selectedImage.UploadDate && (
                    <span className="upload-date">
                      📅 {new Date(selectedImage.UploadDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}



      <Footer />
    </div>
  );
};

export default GallaryPage;
