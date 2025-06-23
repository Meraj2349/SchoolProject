// LeadershipSection.jsx
import React, { useEffect, useState } from "react";
import ProfileCard from "./ProfileCard";
import QuickLinks from "./QuickLinks";
import "../assets/styles/LeaderShipSection.css";
import axios from "axios";

const LeadershipSection = ({
  profiles = [],
  qrCode,
  magazineTitle,
  magazineSubtitle,
  quickLinks,
  sectionTitle = "Leadership & Quick Access",
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError("Failed to connect to server. Please check if backend is running on port 3000.");
        setMessages([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Create merged profiles with messages
  const mergedProfiles = profiles.map((profile, index) => {
    const messageData = messages[index];
    return {
      ...profile,
      message: messageData ? messageData.Messages : profile.message || "Welcome message will appear here soon.",
      messageId: messageData ? messageData.MessageID : null,
    };
  });

  if (loading) {
    return (
      <section className="leadership-section">
        <div className="container">
          <h2 className="section-header">{sectionTitle}</h2>
          <div className="loading-message">Loading messages...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="leadership-section">
      <div className="container">
        {sectionTitle && <h2 className="section-header">{sectionTitle}</h2>}
        {error && (
          <div className="error-message" style={{
            color: '#e74c3c',
            backgroundColor: '#fadbd8',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <div className="leadership-content">
          <div className="profile-cards-container">
            {mergedProfiles.map((profile, idx) => (
              <ProfileCard
                key={`profile-${idx}-${profile.messageId || 'default'}`}
                image={profile.image}
                name={profile.name}
                title={profile.title}
                message={profile.message}
                showMoreLink={profile.message && profile.message.length > 100}
                onMoreClick={() => {
                  console.log("More clicked for:", profile.name);
                }}
              />
            ))}
          </div>
          
          <div className="quick-links-container">
            <QuickLinks
              qrCode={qrCode}
              magazineTitle={magazineTitle}
              magazineSubtitle={magazineSubtitle}
              links={quickLinks}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;