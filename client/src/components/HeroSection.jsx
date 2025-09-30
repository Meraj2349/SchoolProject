

import schoolGate from "../assets/images/School Gate Picture.jpg";
import "../assets/styles/HeroSection.css";


const HeroSection = () => {
  return (
    <div 
      className="hero-section"
      style={{
        backgroundImage: `url(${schoolGate})`,
      }}
    >
    </div>
  );
};

export default HeroSection;