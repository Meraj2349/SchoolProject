import axios from "axios";
import { useEffect, useState } from "react";
import principalImage from "../assets/images/WhatsApp Image 2024-12-07 at 20.48.41_3423f492.jpg";
import "../assets/styles/ChairmanMessagePage.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import LatestUpdatesNotice from "./Listpage/LatestUpdatesNotice";

const ChairmanMessagePage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChairmanMessage = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3000/api/messages", {
          timeout: 10000,
        });

        // Filter only visible messages and sort by MessageID
        const visibleMessages = response.data
          .filter((msg) => msg.Show === 1 || msg.Show === true)
          .sort((a, b) => a.MessageID - b.MessageID);

        if (visibleMessages.length > 0) {
          setMessage(visibleMessages[0].Messages);
        } else {
          setMessage(
            "Welcome to our school! We are committed to providing excellent education and fostering a nurturing environment for all our students. Our dedicated faculty and staff work tirelessly to ensure that every student reaches their full potential. We believe in the holistic development of our students, focusing not only on academic excellence but also on character building, leadership skills, and community service. Join us in our mission to create future leaders who will make a positive impact on society."
          );
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching chairman message:", err);
        setError("Failed to load chairman message");
        setMessage(
          "Welcome to our school! We are committed to providing excellent education and fostering a nurturing environment for all our students."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChairmanMessage();
  }, []);

  if (loading) {
    return (
      <div className="chairman-message-page">
        <Navbar />
        <LatestUpdatesNotice />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading chairman message...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="chairman-message-page">
      <Navbar />
      <LatestUpdatesNotice />
      
      <main className="chairman-message-main">
        <div className="container">
          {/* Header Section */}
          <div className="page-header">
            <h1>Chairman's Message</h1>
            <div className="header-line"></div>
          </div>

          {/* Chairman Profile Section */}
          <div className="chairman-profile">
            <div className="profile-image-container">
              <img 
                src={principalImage} 
                alt="Chairman Md.Rashedul Islam" 
                className="profile-image"
              />
            </div>
            <div className="profile-info">
              <h2>Md. Rashedul Islam</h2>
              <p className="title">Chairman</p>
              <p className="institution">Sylhet Cantonment Public School and College</p>
            </div>
          </div>

          {/* Message Content */}
          <div className="message-content">
            {error && (
              <div className="error-notice">
                <p>{error}</p>
              </div>
            )}
            
            <div className="message-text">
              <p>{message}</p>
            </div>

            {/* Email-style Signature */}
            <div className="message-signature">
              <p className="signature-regards">Best regards,</p>
              <p className="signature-name">Md. Rashedul Islam</p>
              <p className="signature-title">Chairman</p>
              <p className="signature-institution">Sylhet Cantonment Public School and College</p>
            </div>
          </div>

          {/* Back Button */}
          <div className="back-button-container">
            <button 
              onClick={() => window.history.back()}
              className="back-button"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChairmanMessagePage;
