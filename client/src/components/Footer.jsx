import React from "react";
import "../assets/styles/Footer.css"; // Import the CSS file for styling
const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Main footer with navigation links */}
      <div className="footer-main">
        <div className="footer-links">
          {/* Column 1 */}
          <div className="footer-column">
            <ul>
              <li><a href="#">About BU</a></li>
              <li><a href="#">Future and current students</a></li>
              <li><a href="#">Academic programs</a></li>
              <li><a href="#">Research</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="footer-column">
            <ul>
              <li><a href="#">Library</a></li>
              <li><a href="#">Recreation</a></li>
              <li><a href="#">Varsity Sports</a></li>
              <li><a href="#">Alumni & Friends</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-column">
            <ul>
              <li><a href="#">Resources for Current Student</a></li>
              <li><a href="#">Resources for Faculty & Staff</a></li>
              <li><a href="#">Bookstore</a></li>
              <li><a href="#">Campus Map</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="footer-column">
            <ul>
              <li><a href="#">Careers@BU</a></li>
              <li><a href="#">Communications Office</a></li>
              <li><a href="#">Give Now</a></li>
              <li><a href="#">Disclaimer</a></li>
            </ul>
          </div>

          {/* Column 5 - Social Media Icons */}
          <div className="footer-social">
            <a href="#" className="social-icon twitter" aria-label="Twitter"></a>
            <a href="#" className="social-icon facebook" aria-label="Facebook"></a>
            <a href="#" className="social-icon youtube" aria-label="YouTube"></a>
            <a href="#" className="social-icon linkedin" aria-label="LinkedIn"></a>
            <a href="#" className="social-icon instagram" aria-label="Instagram"></a>
          </div>
        </div>
      </div>

      {/* Bottom footer with logo and copyright */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-logo">
            <img src="/logo.png" alt="Bishop's University Logo" />
          </div>
          <div className="footer-copyright">
            <p>Copyright ©2019 Bishop's University</p>
            <a href="#">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;