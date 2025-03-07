import displayImage1 from "../assets/displayImage1.jpg"
import displayImage2 from "../assets/displayImage2.jpg"
import schoolGate from "../assets/schoolGate.jpg"
import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
const images = [schoolGate, displayImage1, displayImage2];
const ImageCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
  
    // Function to move to the next image
    const nextSlide = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };
  
    // Function to move to the previous image
    const prevSlide = () => {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + images.length) % images.length
      );
    };
  
    // Auto-slide effect
    useEffect(() => {
      const interval = setInterval(nextSlide, 3000); // Change every 3 seconds
      return () => clearInterval(interval); // Cleanup on unmount
    }, []);
  
    return (
      <div className="relative w-full h-64 md:h-96 lg:h-[500px] overflow-hidden mt-2">
        {/* Images */}
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
  
        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black"
        >
          <FaChevronLeft size={24} />
        </button>
  
        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black"
        >
          <FaChevronRight size={24} />
        </button>
  
        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };
  
  export default ImageCarousel;