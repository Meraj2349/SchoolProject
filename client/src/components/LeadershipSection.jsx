// LeadershipSection.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import eventsApi from "../api/eventsApi";
import principalImage from "../assets/images/WhatsApp Image 2024-12-07 at 20.48.41_3423f492.jpg";
import "../assets/styles/LeaderShipSection.css";
import ChairmanCard from "./ChairmanCard";
import EventNewsCard from "./EventNewsCard";
import QuickLinks from "./QuickLinks";

const quickLinksData = [
  { name: "Students", icon: "👥", color: "#2ecc71", path: "/students" },
  { name: "Teachers", icon: "🎓", color: "#e74c3c", path: "/teachers" },
  { name: "Attendance", icon: "✓", color: "#f39c12", path: "/attendance" },
  { name: "Result", icon: "📊", color: "#3498db", path: "/result" },
  { name: "Routine", icon: "📅", color: "#3498db", path: "/routine" },
  { name: "Download", icon: "⭐", color: "#f39c12", path: "/download" },
];

const leadershipProfiles = [
  {
    image: principalImage,
    name: "Md.Rashedul Islam",
    title: "Chairman",
  },
];

// Enhanced dummy data with routing links
const eventsData = [
  { 
    date: "Oct 09", 
    text: "50th Summer National Sports Competition -2023, Sylhet.",
    link: "/events/sports-competition-2023"
  },
  { 
    date: "Jul 20", 
    text: "Bangabandhu in my eyes - 1st Prize Upazila Level, Group Primary Section",
    link: "/events/bangabandhu-competition"
  },
  { 
    date: "May 29", 
    text: "International Day Of United Nations Peacekeeper Day- [29 May 2023]",
    link: "/events/un-peacekeeper-day"
  },
  { 
    date: "May 28", 
    text: "Receiving the Julio Currie Peace Medal",
    link: "/events/peace-medal"
  },
];

const newsData = [
  { 
    date: "11 Oct, 2023", 
    text: "Nobin Boron Program held in Sylhet Cantonment Public School and College",
    link: "/news/nobin-boron-program"
  },
  { 
    date: "26 Jul, 2025", 
    text: "Class XI Admission Notice-2025",
    link: "/news/class-xi-admission"
  },
  { 
    date: "19 Sep, 2024", 
    text: "List of the Candidates (Teacher & Staff) and Seat Plan for Written Exam 21 September 2024",
    link: "/news/exam-candidates-list"
  },
  { 
    date: "14 Aug, 2024", 
    text: "Education Insurance",
    link: "/news/education-insurance"
  },
];

const LeadershipSection = () => {
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventsError, setEventsError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/api/messages", {
          timeout: 10000, // 10 second timeout
        });

        // Filter only visible messages and sort by MessageID
        const visibleMessages = response.data
          .filter((msg) => msg.Show === 1 || msg.Show === true)
          .sort((a, b) => a.MessageID - b.MessageID);

        console.log("Fetched visible messages:", visibleMessages);
        setMessages(visibleMessages);
        setError(null);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(
          "Failed to connect to server. Please check if backend is running on port 3000."
        );
        setMessages([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const response = await eventsApi.getAllEvents();
        console.log("Events API response:", response);
        
        // Handle different response structures
        let eventsData = [];
        if (Array.isArray(response)) {
          eventsData = response;
        } else if (response && Array.isArray(response.data)) {
          eventsData = response.data;
        }
        
        // Helper function to format event date
        const formatEventDate = (dateString) => {
          if (!dateString) return "TBA";
          const date = new Date(dateString);
          const month = date.toLocaleDateString('en-US', { month: 'short' });
          const day = date.getDate().toString().padStart(2, '0');
          return `${month} ${day}`;
        };

        // Filter current and upcoming events only and limit to 4
        const currentDate = new Date();
        const activeEvents = eventsData
          .filter(event => {
            const endDate = new Date(event.EndDate);
            return endDate >= currentDate;
          })
          .slice(0, 4)
          .map(event => ({
            date: formatEventDate(event.StartDate),
            text: event.EventName,
            link: `/events#event-${event.EventID}`,
            type: event.EventType,
            venue: event.Venue
          }));
        
        setEvents(activeEvents);
        setEventsError(null);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEventsError("Failed to load events");
        // Fallback to dummy data
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get chairman message
  const chairmanMessage = messages.length > 0 
    ? messages[0].Messages 
    : "Welcome message will appear here soon.";

  if (loading) {
    return (
      <section className="leadership-section">
        <div className="container">
          <div className="loading-message">Loading messages...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="leadership-section">
      <div className="container">
        {/* Chairman at the top, no heading */}
        <div className="chairman-section">
          <ChairmanCard
            image={principalImage}
            name="Md.Rashedul Islam"
            title="Chairman"
            message={chairmanMessage}
            showMoreLink={chairmanMessage && chairmanMessage.length > 100}
            onMoreClick={() => {
              console.log("More clicked for chairman message");
              // You can route to a dedicated chairman message page
              window.location.href = "/chairman-message";
            }}
          />
        </div>

        {/* Error display */}
        {error && (
          <div
            className="error-message"
            style={{
              color: "#e74c3c",
              backgroundColor: "#fadbd8",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* 3 columns: Quick Access, Events, News */}
        <div className="three-column-container">
          {/* Quick Access */}
          <div className="quick-links-wrapper">
            <QuickLinks links={quickLinksData} />
          </div>

          {/* Events */}
          <div className="events-wrapper">
            {eventsLoading ? (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '20px',
                minHeight: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #6fcf97',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 10px'
                  }}></div>
                  Loading Events...
                </div>
              </div>
            ) : eventsError ? (
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                padding: '20px',
                minHeight: '320px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  background: '#6fcf97',
                  color: '#fff',
                  padding: '16px 18px',
                  fontSize: '20px',
                  fontWeight: '600',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  width: '100%',
                  marginBottom: '20px'
                }}>
                  EVENTS
                </div>
                <div style={{ color: '#e74c3c', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
                  <div>{eventsError}</div>
                  <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '5px' }}>
                    Using fallback data
                  </div>
                </div>
                <EventNewsCard type="events" data={eventsData} />
              </div>
            ) : (
              <EventNewsCard 
                type="events" 
                data={events.length > 0 ? events : eventsData} 
              />
            )}
          </div>

          {/* News */}
          <div className="news-wrapper">
            <EventNewsCard type="news" data={newsData} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
