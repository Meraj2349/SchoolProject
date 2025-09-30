import { Link } from 'react-router-dom';
import '../assets/styles/ChairmanCard.css';

const ChairmanCard = ({ 
  image, 
  name, 
  title, 
  message
}) => {

  return (
    <div className="chairman-card">
      {/* Image Section */}
      <div className="chairman-image-container">
        <img 
          src={image} 
          alt={`${name} - ${title}`} 
          className="chairman-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>
      
      {/* Content Section */}
      <div className="chairman-content">
        {/* Name and Title */}
        <div className="chairman-header">
          <h2 className="chairman-name">
            {name}
          </h2>
          <p className="chairman-title">
            {title}
          </p>
        </div>
        
        {/* Message */}
        {message && (
          <div className="chairman-message">
            <p className="chairman-message-text">
              {message.length > 200 ? message.substring(0, 200) + "..." : message}
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="chairman-actions">
          <Link 
            to="/chairman-message"
            className="chairman-link"
          >
            View Full Message
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChairmanCard;
