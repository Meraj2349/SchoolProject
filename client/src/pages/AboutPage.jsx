import {
  Map,
  Trophy
} from "lucide-react";
import schoolImage from "../assets/images/School Gate Picture.jpg";
import "../assets/styles/AboutPage-clean.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import LatestUpdatesNotice from "./Listpage/LatestUpdatesNotice";

const AboutPage = () => {
  return (
    <div className="about-page">
      <Navbar />
      <LatestUpdatesNotice />
      
      {/* About Section with School Image */}
      <section className="about-section">
        <div className="container">
          <div className="section-intro">
            <h2 className="section-title">About Us</h2>
            <p className="section-subtitle">
              Sylhet Cantonment Public School and College - Excellence in Education
            </p>
          </div>
          
          <div className="about-content">
            <div className="about-image-container">
              <img 
                src={schoolImage} 
                alt="Sylhet Cantonment Public School and College" 
                className="school-image"
              />
            </div>
            
            <div className="about-text">
              <p>
                Education is the best means of self-improvement and of becoming an 
                ideal human being. Keeping this in mind, Sylhet Cantonment Public 
                School and College started its voyage with the motto "Shikkhai Alo" 
                (Knowledge is Light) on January 1, 2019. It is located in the well-
                ordered and safe environment of Sylhet Cantonment, and is adorned 
                with the natural beauty of the holy land, Sylhet.
              </p>
              <p>
                The institution started its academic endeavour accompanied by the students from class I to 
                IX and has fulfillment in the same academic year with intake of higher 
                secondary level in July 2019. Founded on about 15 acres of land, the 
                institution has become a model within a short period of time at all 
                levels through the disciplined rules and regulations, intensive care 
                and regular classroom teaching, student-teacher-guardian 
                relationship and exhibitions of co-curricular activities. Sylhet 
                Cantonment Public School and College with the relentless efforts of the Governing Body, teachers, students and guardians is 
                determined to make its students worthy citizens in the future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="location-section">
        <div className="container">
          <div className="section-header">
            <Map className="section-icon" />
            <h2>Visit Our School</h2>
            <p className="section-subtitle">
              Located in the heart of Tangail, our campus provides an ideal learning environment
            </p>
          </div>
          
          <div className="location-content">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3642.0098647768087!2d90.01732967589534!3d24.174524126251374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375601dc523374e5%3A0xb6e0a55e11d5c5ce!2sStar%20Academic%20School!5e0!3m2!1sen!2sbd!4v1690095436935!5m2!1sen!2sbd"
                width="100%"
                height="450"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Star Academic School Location"
              ></iframe>
            </div>
            
            <div className="contact-info">
              <h3>Get in Touch</h3>
              <div className="contact-details">
                <div className="contact-item">
                  <strong>📍 Address:</strong>
                  <p>Star Academic School<br />
                     Natiapara, Delduar<br />
                     Tangail, Bangladesh</p>
                </div>
                
                <div className="contact-item">
                  <strong>📞 Phone:</strong>
                  <p>+880 1234-567890<br />
                     +880 9876-543210</p>
                </div>
                
                <div className="contact-item">
                  <strong>✉️ Email:</strong>
                  <p>info@staracademicschool.edu.bd<br />
                     admission@staracademicschool.edu.bd</p>
                </div>
                
                <div className="contact-item">
                  <strong>🕒 Office Hours:</strong>
                  <p>Sunday - Thursday: 8:00 AM - 4:00 PM<br />
                     Saturday: 8:00 AM - 12:00 PM<br />
                     Friday: Closed</p>
                </div>
              </div>
              
              <div className="visit-note">
                <p>
                  <strong>Campus Visits:</strong> We welcome prospective students and parents 
                  to visit our campus. Please call ahead to schedule a guided tour and 
                  meet with our admissions team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section> 
      <Footer />
    </div>
  );
};

export default AboutPage;
