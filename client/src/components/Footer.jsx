import logo1 from "../assets/images/logo1.png"; // Import the school logo
import "../assets/styles/Footer.css";
import sustLogo from "../assets/images/sustLogo.png" // Import the CSS file for styling

const Footer = () => {
  return (
    <footer className="footer-container">
      {/* Main footer with school info, quick links, and maintained by */}
      <div className="footer-main">
        {/* School Information */}
        <div className="footer-info">
          <img src={logo1} alt="School Logo" className="school-logo" />
          <h3>Star Academic School</h3>
          <p>Contact: 01997588476</p>
          <p>Email: merajislam2349@gmail.com</p>
          <p>Natiapara, Delduar, Tangail</p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">DSHE</a></li>
            <li><a href="#">BANBEIS</a></li>
            <li><a href="#">BD National Portal</a></li>
            <li><a href="#">Ministry of Education</a></li>
            <li><a href="#">Sylhet Board</a></li>
            <li><a href="#">Primary & Mass Education</a></li>
            <li><a href="#">Form of BD. Govt</a></li>
            <li><a href="#">Pathshala EMIS</a></li>
            <li><a href="#">UGC</a></li>
            <li><a href="#">Dhaka University</a></li>
            <li><a href="#">SUST</a></li>
          </ul>
        </div>

        {/* Maintained By */}
        <div className="footer-maintained">
          <h4>Maintained By</h4>
          <img src={sustLogo} alt="Pathshala Logo" className="maintained-logo" />
        </div>
      </div>

      {/* Bottom footer with developed by and helpline */}
      <div className="footer-bottom">
        <p>Developed By: Md.Meraj Mridha</p>
        <p>Helpline: +88 019 97588476</p>
      </div>
    </footer>
  );
};

export default Footer;