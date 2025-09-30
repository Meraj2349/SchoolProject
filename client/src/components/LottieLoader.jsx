import './LottieLoader.css';

const LottieLoader = ({ 
  size = "small", 
  text = "Loading...", 
  showText = true,
  className = "",
  type = "dots" // "dots", "spinner", "pulse"
}) => {
  const getSizeClass = () => {
    switch(size) {
      case "small": return "lottie-small";
      case "medium": return "lottie-medium";
      case "large": return "lottie-large";
      default: return "lottie-small";
    }
  };

  const renderAnimation = () => {
    switch(type) {
      case "spinner":
        return (
          <div className="simple-spinner">
            <div className="spinner-ring"></div>
          </div>
        );
      case "pulse":
        return (
          <div className="pulse-loader">
            <div className="pulse-dot"></div>
          </div>
        );
      default:
        return (
          <div className="dots-loader">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
    }
  };

  return (
    <div className={`lottie-loader-container ${getSizeClass()} ${className}`}>
      <div className="lottie-animation">
        {renderAnimation()}
      </div>
      {showText && (
        <span className="lottie-text">{text}</span>
      )}
    </div>
  );
};

export default LottieLoader;