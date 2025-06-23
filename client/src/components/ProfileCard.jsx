// ProfileCard.jsx (Enhanced)
import React, { useState } from 'react';

const ProfileCard = ({ 
  image, 
  name, 
  title, 
  message, 
  showMoreLink = false,
  onMoreClick,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Truncate message if it's too long
  const truncateLength = 150;
  const shouldTruncate = message && message.length > truncateLength;
  const displayMessage = shouldTruncate && !isExpanded 
    ? message.substring(0, truncateLength) + "..." 
    : message;

  const handleMoreClick = () => {
    if (onMoreClick) {
      onMoreClick();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`profile-card ${className}`}>
      <div className="profile-image-container">
        <img 
          src={image} 
          alt={`${name} - ${title}`} 
          className="profile-image"
          onError={(e) => {
            // Handle image loading error
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      <div className="profile-content">
        <h3 className="profile-name">{name}</h3>
        <p className="profile-title">{title}</p>
        
        {message && (
          <div className="profile-message">
            <p style={{ 
              lineHeight: '1.6', 
              textAlign: 'justify',
              marginBottom: shouldTruncate ? '10px' : '0'
            }}>
              {displayMessage}
            </p>
          </div>
        )}
        
        {(showMoreLink || shouldTruncate) && (
          <div className="profile-more">
            <button 
              className="more-link"
              onClick={handleMoreClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#3498db',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              {isExpanded ? "Show Less" : "More..."}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;