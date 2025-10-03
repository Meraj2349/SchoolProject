import { useEffect, useState } from "react";
import eventsApi from "../api/eventsApi";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./EventsPage.css";
import LatestUpdatesNotice from "./Listpage/LatestUpdatesNotice";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [countdowns, setCountdowns] = useState({});

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Update countdown timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdowns();
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsApi.getAllEvents();
      console.log("Events API response:", response);

      // Handle different response structures
      let eventsData = [];
      if (Array.isArray(response)) {
        eventsData = response;
      } else if (response && Array.isArray(response.data)) {
        eventsData = response.data;
      }

      // Filter current and upcoming events only
      const currentDate = new Date();
      const activeEvents = eventsData.filter((event) => {
        const endDate = new Date(event.EndDate);
        return endDate >= currentDate;
      });

      setEvents(activeEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error.message || "Failed to fetch events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdowns = () => {
    const now = new Date();
    const newCountdowns = {};

    events.forEach((event) => {
      const endDate = new Date(event.EndDate + "T23:59:59"); // Set to end of day
      const timeDiff = endDate.getTime() - now.getTime();

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        newCountdowns[event.EventID] = {
          days,
          hours,
          minutes,
          seconds,
          isExpired: false,
        };
      } else {
        newCountdowns[event.EventID] = {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        };
      }
    });

    setCountdowns(newCountdowns);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Get event type icon and color
  const getEventTypeInfo = (eventType) => {
    const typeInfo = {
      Academic: { icon: "📚", color: "#1e40af", bgColor: "#dbeafe" },
      Sports: { icon: "⚽", color: "#059669", bgColor: "#d1fae5" },
      Cultural: { icon: "🎭", color: "#7c2d12", bgColor: "#fed7aa" },
      Other: { icon: "📅", color: "#374151", bgColor: "#f3f4f6" },
    };
    return typeInfo[eventType] || typeInfo["Other"];
  };

  // Check if event is happening today
  const isEventToday = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    return today >= start && today <= end;
  };

  // Generate dummy coordinates for map (in a real app, you'd store actual coordinates)
  const generateMapCoordinates = (eventId) => {
    // Generate coordinates around Dhaka, Bangladesh area
    const baseLat = 23.8103;
    const baseLng = 90.4125;
    const spread = 0.1;

    // Use eventId to generate consistent coordinates
    const seed = eventId * 12345;
    const lat = baseLat + ((seed % 1000) / 1000 - 0.5) * spread;
    const lng = baseLng + (((seed * 7) % 1000) / 1000 - 0.5) * spread;

    return { lat, lng };
  };

  return (
    <div className="events-page-public">
      <Navbar />
      <LatestUpdatesNotice />

      <div className="events-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Events</h3>
            <p>{error}</p>
            <button onClick={fetchEvents} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No Upcoming Events</h3>
            <p>Check back later for new events and activities.</p>
          </div>
        ) : (
          <>
            {/* Events Map Section */}
            <div className="events-map-section">
              <h2>Events Map</h2>
              <div className="map-container">
                <div className="map-placeholder">
                  <div className="map-header">
                    <span className="map-icon">🗺️</span>
                    <span>Event Locations</span>
                  </div>
                  <div className="map-content">
                    {events.map((event) => {
                      const coords = generateMapCoordinates(event.EventID);
                      const typeInfo = getEventTypeInfo(event.EventType);

                      return (
                        <div
                          key={event.EventID}
                          className={`map-marker ${
                            selectedEvent === event.EventID ? "selected" : ""
                          }`}
                          style={{
                            left: `${((coords.lng - 90.3) / 0.2) * 100}%`,
                            top: `${((90.5 - coords.lat) / 0.2) * 100}%`,
                            backgroundColor: typeInfo.color,
                          }}
                          onClick={() =>
                            setSelectedEvent(
                              selectedEvent === event.EventID
                                ? null
                                : event.EventID
                            )
                          }
                          title={`${event.EventName} at ${
                            event.Venue || "TBA"
                          }`}
                        >
                          <span className="marker-icon">{typeInfo.icon}</span>
                          {selectedEvent === event.EventID && (
                            <div className="marker-popup">
                              <h4>{event.EventName}</h4>
                              <p>
                                <strong>Venue:</strong> {event.Venue || "TBA"}
                              </p>
                              <p>
                                <strong>Date:</strong>{" "}
                                {formatDate(event.StartDate)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="map-legend">
                    <h4>Legend</h4>
                    <div className="legend-items">
                      {["Academic", "Sports", "Cultural", "Other"].map(
                        (type) => {
                          const typeInfo = getEventTypeInfo(type);
                          return (
                            <div key={type} className="legend-item">
                              <span
                                className="legend-marker"
                                style={{ backgroundColor: typeInfo.color }}
                              >
                                {typeInfo.icon}
                              </span>
                              <span>{type}</span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Events List Section */}
            <div className="events-list-section">
              <h2>Upcoming Events ({events.length})</h2>
              <div className="events-grid">
                {events.map((event) => {
                  const typeInfo = getEventTypeInfo(event.EventType);
                  const countdown = countdowns[event.EventID];
                  const isToday = isEventToday(event.StartDate, event.EndDate);

                  return (
                    <div
                      key={event.EventID}
                      className={`event-card ${
                        isToday ? "happening-today" : ""
                      } ${countdown?.isExpired ? "expired" : ""}`}
                      style={{ borderColor: typeInfo.color }}
                    >
                      {isToday && (
                        <div className="live-badge">
                          <span className="pulse"></span>
                          HAPPENING NOW
                        </div>
                      )}

                      <div className="event-header">
                        <div
                          className="event-type-badge"
                          style={{
                            backgroundColor: typeInfo.bgColor,
                            color: typeInfo.color,
                          }}
                        >
                          <span className="type-icon">{typeInfo.icon}</span>
                          {event.EventType}
                        </div>
                        <div className="event-date">
                          {formatDate(event.StartDate)}
                          {event.StartDate !== event.EndDate && (
                            <> - {formatDate(event.EndDate)}</>
                          )}
                        </div>
                      </div>

                      <div className="event-content">
                        <h3 className="event-title">{event.EventName}</h3>

                        {event.Venue && (
                          <div className="event-venue">
                            <span className="venue-icon">📍</span>
                            {event.Venue}
                          </div>
                        )}

                        {event.Description && (
                          <p className="event-description">
                            {event.Description}
                          </p>
                        )}

                        {/* Countdown Timer */}
                        {countdown && !countdown.isExpired && (
                          <div className="countdown-timer">
                            <h4>Ends in:</h4>
                            <div className="countdown-display">
                              <div className="countdown-item">
                                <span className="countdown-number">
                                  {countdown.days}
                                </span>
                                <span className="countdown-label">Days</span>
                              </div>
                              <div className="countdown-item">
                                <span className="countdown-number">
                                  {countdown.hours}
                                </span>
                                <span className="countdown-label">Hours</span>
                              </div>
                              <div className="countdown-item">
                                <span className="countdown-number">
                                  {countdown.minutes}
                                </span>
                                <span className="countdown-label">Min</span>
                              </div>
                              <div className="countdown-item">
                                <span className="countdown-number">
                                  {countdown.seconds}
                                </span>
                                <span className="countdown-label">Sec</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {countdown?.isExpired && (
                          <div className="expired-notice">
                            <span className="expired-icon">⏰</span>
                            Event has ended
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default EventsPage;
