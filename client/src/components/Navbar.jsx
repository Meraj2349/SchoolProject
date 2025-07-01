import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo.png"; // Adjust the path to your logo image

const Navbar = ({ 
  logo = Logo, 
  schoolName = "Star Academic School", 
  establishedYear = "135479", 
  location = "Natiapara, Delduar, Tangail",
  navItems = [
    { name: "HOME", path: "/" },
    { name: "ADMISSIONS", path: "/admissions" },
    { name: "ACADEMICS", path: "/academics" },
    { name: "ARTS", path: "/arts" },
    { name: "ATHLETICS", path: "/athletics" },
    { name: "STUDENT LIFE", path: "/student-life" },
    { name: "SUPPORT US", path: "/support-us" }
  ],
  showCommunity = true,
  showSearch = true,
  showQuakerEducation = true,
  showQuickLinks = true
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Top Bar - Row 1 with 2 columns */}
      <div className="top-bar">
        <div className="logo-section">
          <img src={logo} className="logo-image" alt={`${schoolName} Logo`} />
          <div className="logo-text">
            <span className="logo-estd">ESTD : {establishedYear}</span>
            <span className="logo-name">{schoolName}</span>
            <span className="logo-location">{location}</span>
          </div>
        </div>

        <div className="top-right-section">
          {showCommunity && (
            <div className="community-dropdown">
              <span>Community</span>
              <span className="arrow-down">▼</span>
            </div>
          )}

          {showSearch && (
            <div className="search-button">
              <span className="search-icon">🔍</span>
            </div>
          )}

          {showQuakerEducation && (
            <div className="quaker-education">
              <span>A Quaker Education</span>
              <span className="arrow-down">▼</span>
            </div>
          )}

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Main Navigation - Row 2 with 8 columns */}
      <div className="main-navigation">
        <div className="nav-container">
          {/* Navigation items */}
          <ul className="nav-items">
            {navItems.map((item, index) => (
              <li key={index} className="nav-item">
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
          </ul>

          {/* QuickLinks */}
          {showQuickLinks && (
            <div className="quick-links">
              <span>QUICKLINKS</span>
              <span className="arrow-down">▼</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <Link to={item.path}>{item.name}</Link>
              </li>
            ))}
            {showCommunity && (
              <li>
                <Link to="/community">COMMUNITY</Link>
              </li>
            )}
            {showQuickLinks && (
              <li>
                <Link to="/quicklinks">QUICKLINKS</Link>
              </li>
            )}
            {showQuakerEducation && (
              <li>
                <Link to="/quaker-education">A QUAKER EDUCATION</Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;