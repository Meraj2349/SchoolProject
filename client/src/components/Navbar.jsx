import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/logo1.png";
import "../assets/styles/Navbar.css"; // Adjust the path to your logo

const Navbar = ({
  logo = Logo,
  schoolName = "Star Academic School",
  establishedYear = "135479",
  location = "Natiapara, Delduar, Tangail",
  navItems = [
    { name: "HOME", path: "/" },
    { name: "ABOUT", path: "/about" },
    //branchess has toggle functionality
    {
      name: "BRANCHES",
      path: "/branches",
      subItems: [
        { name: "Branch 1", path: "/branch1" },
        { name: "Branch 2", path: "/branch2" },
        { name: "Branch 3", path: "/branch3" },
      ],
    },

    { name: "GALLERY", path: "/gallery" },
    { name: "EVENTS", path: "/events" },
    { name: "NEWS", path: "/news" },
    { name: "ACADEMICS", path: "/academics" },
    { name: "ADMISSIONS", path: "/admissions" },
    { name: "STUDENTS", path: "/students" },
    { name: "CONTACT", path: "/contact" },
  ],
  showCommunity = true,
  showSearch = true,
  showQuakerEducation = true,
  showQuickLinks = true,
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
            <div className="online-apply-dropdown">
              <span>Online Apply</span>
            </div>
          )}

          {showQuakerEducation && (
            <div className="quaker-education">
              <span>A Quaker Education</span>
              <span className="arrow-down">▼</span>
            </div>
          )}

          <button className={`mobile-menu-toggle ${mobileMenuOpen ? 'hidden' : ''}`} onClick={toggleMobileMenu}>
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
                {item.subItems && (
                  <ul className="sub-menu">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex} className="sub-menu-item">
                        <Link to={subItem.path}>{subItem.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <div className="mobile-logo-section">
              <img src={logo} className="mobile-logo-image" alt={`${schoolName}
  Logo`} />
              <div className="mobile-logo-text">
                <span className="mobile-logo-estd">ESTD : {establishedYear}</span>
                <span className="mobile-logo-name">{schoolName}</span>
                <span className="mobile-logo-location">{location}</span>
              </div>
            </div>
            <button className="mobile-menu-close" onClick={toggleMobileMenu}>
              ✕
            </button>
          </div>
          <div className="mobile-menu-actions">
            {showQuakerEducation && (
              <div className="quaker-education">
                <span>A Quaker Education</span>
                <span className="arrow-down">▼</span>
              </div>
            )}
            {showSearch && (
              <div className="search-bar">
                <input type="text" placeholder="Search..." />
              </div>
            )}

            <div className="online-apply-dropdown">
              <span>Online Apply</span>
            </div>
          </div>
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                <Link to={item.path} onClick={toggleMobileMenu}>
                  {item.name}
                </Link>
                {item.subItems &&
                  item.subItems.map((subItem, subIndex) => (
                    <li key={`sub-${subIndex}`} className="mobile-submenu-item">
                      <Link to={subItem.path} onClick={toggleMobileMenu}>
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
              </li>
            ))}
            {showCommunity && (
              <li>
                <Link to="/community" onClick={toggleMobileMenu}>
                  COMMUNITY
                </Link>
              </li>
            )}
            {showQuickLinks && (
              <li>
                <Link to="/quicklinks" onClick={toggleMobileMenu}>
                  QUICKLINKS
                </Link>
              </li>
            )}
            {showQuakerEducation && (
              <li>
                <Link to="/quaker-education" onClick={toggleMobileMenu}>
                  A QUAKER EDUCATION
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;
