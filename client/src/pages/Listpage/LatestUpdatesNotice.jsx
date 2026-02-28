import { Bell } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/styles/listcss/noticlist.css";
import LottieLoader from "../../components/LottieLoader";

const LatestUpdatesNotice = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API configuration
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const NOTICES_ENDPOINT = `${API_BASE_URL}/notices`;

  const loadNotices = useCallback(
    async (shouldShowLoader = false) => {
      try {
        if (shouldShowLoader) {
          setLoading(true);
        }
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
        const visibleNotices = data
          .filter((notice) => notice.Show === true || notice.Show === 1)
          .sort((a, b) => {
            const dateA = a.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
            const dateB = b.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
            return dateB - dateA;
          });

        setNotices(visibleNotices);
      } catch (err) {
        console.error("Error fetching notices:", err);
        setError(`Failed to load latest updates: ${err.message}`);
        setNotices([]);
      } finally {
        if (shouldShowLoader) {
          setLoading(false);
        }
      }
    },
    [NOTICES_ENDPOINT],
  );

  // Fetch notices from API
  useEffect(() => {
    loadNotices(true);

    // Set up polling to refresh notices periodically
    const intervalId = setInterval(() => loadNotices(), 300000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, [loadNotices]);

  const loopedNotices = useMemo(() => {
    if (notices.length > 1) {
      return [...notices, notices[0]];
    }
    return notices;
  }, [notices]);

  const animationDuration = useMemo(() => {
    if (notices.length <= 1) {
      return null;
    }
    const seconds = Math.max(40, notices.length * 15);
    return `${seconds}s`;
  }, [notices.length]);

  // Loading state
  if (loading) {
    return (
      <LottieLoader
        size="small"
        text="Loading updates..."
        className="notice-loading"
        type="dots"
      />
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
        </div>
      </div>
    );
  }

  // Don't render if no notices or component is closed
  if (notices.length === 0) {
    return null;
  }

  return (
    <div className="latest-updates-container">
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
                className={`slider-wrapper ${
                  notices.length > 1 ? "is-looping" : ""
                }`}
                style={
                  animationDuration
                    ? {
                        animationDuration,
                        "--slide-count": loopedNotices.length,
                      }
                    : undefined
                }
              >
                {loopedNotices.map((notice, index) => {
                  const isDuplicate = notices.length > 1 && index >= notices.length;
                  return (
                    <div
                      key={`${notice.NoticeID}-${index}`}
                      className="slide"
                      aria-hidden={isDuplicate ? "true" : "false"}
                    >
                      <div className="slide-content">
                        <span className="slide-title">{notice.Title}:</span>
                        <span className="slide-description">
                          {notice.Description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LatestUpdatesNotice;
