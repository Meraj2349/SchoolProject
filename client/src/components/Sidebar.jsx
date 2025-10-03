import Cookies from "js-cookie";
import { useState } from "react";
import {
  FaBell,
  FaCalendarCheck,
  FaEnvelope,
  FaHandshake,
  FaImage,
} from "react-icons/fa";
import {
  FaClipboardList,
  FaMessage,
  FaNoteSticky,
  FaPeopleGroup,
} from "react-icons/fa6";
import { FiMenu, FiX } from "react-icons/fi";
import { RiListCheck, RiTimerLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import "../assets/styles/Sidebar.css"; // Import the CSS file

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const token = Cookies.get("token"); // Get the token from cookies
      const response = await fetch("http://localhost:3000/api/admin/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        //also nevigate to the login page

        Cookies.remove("token"); // Remove the token from cookies
        navigate("/admin/login"); // Redirect to the login page
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData.error);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const getActiveClass = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="dashboard-container">
      {/* Mobile menu button */}
      <div className="mobile-menu-button">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="menu-button"
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? (
            <FiX className="icon" />
          ) : (
            <FiMenu className="icon" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          {/* Header */}
          <div className="sidebar-header">
            <h2>Admin Dashboard</h2>
          </div>

          {/* Navigation links */}
          <nav className="sidebar-nav">
            <div className="nav-links">
              {[
                { path: "/admin/notices", icon: <FaBell />, label: "Notice" },
                {
                  path: "/admin/messages",
                  icon: <FaMessage />,
                  label: "Chair Message",
                },
                {
                  path: "/admin/gallery",
                  icon: <FaImage />,
                  label: "Image Gallery",
                },
                {
                  path: "/admin/sponsor",
                  icon: <FaHandshake />,
                  label: "Sponsors",
                },
                {
                  path: "/admin/latestNews",
                  icon: <FaCalendarCheck />,
                  label: "Latest News",
                },
                {
                  path: "/admin/events/announcements",
                  icon: <FaNoteSticky />,
                  label: "Event Announcements",
                },
                {
                  path: "/admin/schedule",
                  icon: <RiTimerLine />,
                  label: "Schedule",
                },
                {
                  path: "/admin/commitiLIst",
                  icon: <RiListCheck />,
                  label: "Commity List",
                },
                {
                  path: "/admin/studentList",
                  icon: <FaPeopleGroup />,
                  label: "Student List",
                },
                {
                  path: "/admin/teacherList",
                  icon: <FaPeopleGroup />,
                  label: "Teacher List",
                },
                {
                  path: "/admin/class",
                  icon: <FaPeopleGroup />,
                  label: "Class Teacher ",
                },
                {
                  path: "/admin/subject",
                  icon: <FaEnvelope />,
                  label: "Subject",
                },
                {
                  path: "/admin/results",
                  icon: <FaClipboardList />,
                  label: "Results",
                },
                {
                  path: "/admin/exams",
                  icon: <FaClipboardList />,
                  label: "Exams",
                },
                {
                  path: "/admin/events",
                  icon: <FaCalendarCheck />,
                  label: "Events",
                },

                {
                  path: "/admin/attendance/grid",
                  icon: <FaClipboardList />,
                  label: "Attendance Grid",
                },
                {
                  path: "/admin/updateEmailPassword",
                  icon: <FaEnvelope />,
                  label: "Settings",
                },
              ].map((item) => (
                <div
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`nav-link ${getActiveClass(item.path)}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
              ))}
            </div>
          </nav>

          {/* Footer with logout */}
          <div className="sidebar-footer">
            {loggingOut ? (
              <div className="logout-loading">
                <div className="spinner"></div>
                <span>Logging out...</span>
              </div>
            ) : (
              <button onClick={handleLogout} className="logout-button">
                Log Out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile view */}
      {isSidebarOpen && (
        <div
          className="overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
