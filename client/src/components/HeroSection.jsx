import { useState, useEffect } from "react";
import backgroundImage from "../assets/images/School Gate Picture.jpg"; // Default background image

const HeroSection = ({ 
  slides = [
    {
      title: "Green by Design",
      subtitle: "Conservation begins on campus.",
      btnText: "LEARN MORE",
      btnLink: "/green-design",
      backgroundImage: backgroundImage
    },
    {
      title: "Excellence in Education",
      subtitle: "Preparing students for the future.",
      btnText: "DISCOVER",
      btnLink: "/education",
      backgroundImage: backgroundImage
    },
    {
      title: "Innovative Learning",
      subtitle: "Hands-on experiences for all ages.",
      btnText: "EXPLORE",
      btnLink: "/learning",
      backgroundImage: backgroundImage
    }
  ],
  autoSlide = false,
  autoSlideInterval = 5000,
  showScrollIndicator = true,
  showNavigation = true,
  heroImage = null,
  overlayOpacity = 0.4
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto slide functionality
  useEffect(() => {
    if (autoSlide && slides.length > 1) {
      const interval = setInterval(nextSlide, autoSlideInterval);
      return () => clearInterval(interval);
    }
  }, [autoSlide, autoSlideInterval, slides.length]);

  const currentSlideData = slides[currentSlide];
  const backgroundImage = currentSlideData.backgroundImage || heroImage;

  return (
    <div 
      className="hero-section"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      }}
    >

      <div className="hero-content">
        <h2>{currentSlideData.title}</h2>
        <p>{currentSlideData.subtitle}</p>
        {currentSlideData.btnText && (
          <a 
            href={currentSlideData.btnLink || "#"} 
            className="learn-more-btn"
          >
            {currentSlideData.btnText}
            <span className="arrow-right">→</span>
          </a>
        )}
      </div>

      {/* Slider Navigation */}
   

    </div>
  );
};

export default HeroSection;