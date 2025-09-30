import { Bell, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import "../../assets/styles/listcss/noticlist.css";

const LatestUpdatesNotice = () => {
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API configuration
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const NOTICES_ENDPOINT = `${API_BASE_URL}/notices`;
  const TOGGLE_VISIBILITY_ENDPOINT = `${API_BASE_URL}/notices/toggle-visibility`;

  // Fetch notices from API
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from your notices API endpoint
        const response = await fetch(NOTICES_ENDPOINT, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Filter only notices that should be shown
        const visibleNotices = data.filter(
          (notice) => notice.Show === true || notice.Show === 1
        );

        // Sort by creation date (newest first) if CreatedAt exists
        if (visibleNotices.length > 0 && visibleNotices[0].CreatedAt) {
          visibleNotices.sort(
            (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
          );
        }

        setNotices(visibleNotices);

        // Reset current index if it's out of bounds
        if (
          visibleNotices.length > 0 &&
          currentIndex >= visibleNotices.length
        ) {
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error("Error fetching notices:", err);
        setError(`Failed to load latest updates: ${err.message}`);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();

    // Set up polling to refresh notices periodically
    const intervalId = setInterval(fetchNotices, 300000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, [NOTICES_ENDPOINT, currentIndex]);

  // Auto-slide functionality
  useEffect(() => {
    if (notices.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === notices.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [notices.length]);

  // Navigation functions
  const nextSlide = () => {
    setCurrentIndex(currentIndex === notices.length - 1 ? 0 : currentIndex + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? notices.length - 1 : currentIndex - 1);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const closeNotice = () => {
    setIsVisible(false);
  };

  // Toggle visibility function
  const handleToggleVisibility = async (noticeId, currentVisibility) => {
    try {
      const response = await fetch(
        `${TOGGLE_VISIBILITY_ENDPOINT}/${noticeId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Show: !currentVisibility }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh notices after toggling
      await refreshNotices();
    } catch (err) {
      console.error("Error toggling notice visibility:", err);
      setError(`Failed to toggle visibility: ${err.message}`);
    }
  };

  // Manual refresh function
  const refreshNotices = async () => {
    try {
      setError(null);
      const response = await fetch(NOTICES_ENDPOINT, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const visibleNotices = data.filter(
        (notice) => notice.Show === true || notice.Show === 1
      );

      if (visibleNotices.length > 0 && visibleNotices[0].CreatedAt) {
        visibleNotices.sort(
          (a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt)
        );
      }

      setNotices(visibleNotices);

      if (visibleNotices.length > 0 && currentIndex >= visibleNotices.length) {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Error refreshing notices:", err);
      setError(`Failed to refresh updates: ${err.message}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <span className="loading-text">Loading updates...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-left">
            <Bell className="error-icon" />
            <span className="error-text">{error}</span>
          </div>
          <button onClick={closeNotice} className="error-close">
            <X className="control-icon" />
          </button>
        </div>
      </div>
    );
  }

  // Don't render if no notices or component is closed
  if (!isVisible || notices.length === 0) {
    return null;
  }

  const currentNotice = notices[currentIndex];

  return (
    <div className="latest-updates-container">
      {/* Background animation */}
      <div className="background-animation"></div>

      <div className="content-wrapper">
        <div className="content-container">
          {/* Left side - Icon and Latest Updates label */}
          <div className="left-section">
            <div className="bell-icon-container">
              <Bell className="bell-icon" />
            </div>
            <span className="updates-label">Latest Updates</span>
            <span className="updates-label-mobile">Updates</span>
            <div className="separator"></div>
          </div>

          {/* Center - Scrolling content */}
          <div className="content-section">
            <div className="slider-container">
              <div
                className="slider-wrapper"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {notices.map((notice) => (
                  <div key={notice.NoticeID} className="slide">
                    <div className="slide-content">
                      <span className="slide-title">{notice.Title}:</span>
                      <span className="slide-description">
                        {notice.Description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="controls-section">
            {notices.length > 1 && (
              <>
                <button
                  onClick={refreshNotices}
                  className="control-button"
                  aria-label="Refresh notices"
                  title="Refresh notices"
                >
                  <svg
                    className="control-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>

                <button
                  onClick={prevSlide}
                  className="control-button"
                  aria-label="Previous notice"
                >
                  <ChevronLeft className="control-icon" />
                </button>

                <button
                  onClick={nextSlide}
                  className="control-button"
                  aria-label="Next notice"
                >
                  <ChevronRight className="control-icon" />
                </button>

                {/* Toggle visibility for current notice */}
                <button
                  onClick={() =>
                    handleToggleVisibility(
                      currentNotice.NoticeID,
                      currentNotice.Show
                    )
                  }
                  className="control-button toggle-visibility"
                  aria-label="Toggle notice visibility"
                  title={`${currentNotice.Show ? "Hide" : "Show"} this notice`}
                >
                  <svg
                    className="control-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {currentNotice.Show ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    )}
                  </svg>
                </button>

                {/* Dots indicator */}
                <div className="dots-container">
                  {notices.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`dot ${
                        index === currentIndex ? "active" : "inactive"
                      }`}
                      aria-label={`Go to notice ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {notices.length > 1 && (
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentIndex + 1) / notices.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default LatestUpdatesNotice;
