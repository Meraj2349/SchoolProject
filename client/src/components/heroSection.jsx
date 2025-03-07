import React from "react";

import heroImage from "../assets/schoolGate.jpg";
import logoImage from "../assets/logo.png";

const HeroSection = () => {
  return (
    <div className="relative text-white text-center h-4/5 w-full bg-cover bg-center " style={{ backgroundImage: `url(${heroImage})` }}>
     
     

      <div className="absolute inset-0 bg-opacity-50"></div>
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-5 p-4">
        <img src={logoImage} alt="School Logo" className="mx-auto mb-6 w-24 h-24 md:w-32 md:h-32 rounded-full shadow-lg" />

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold px-4">Star Academic School</h1>

        <div className="flex flex-col md:flex-row justify-center mt-6 space-y-4 md:space-y-0 md:space-x-8 text-lg sm:text-xl">
          <div className="flex items-center justify-center">
            <span className="text-yellow-400 text-xl gap-5">🏛️</span>
            <span className="ml-2 text-yellow-400">Founded: <strong>2012</strong></span>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-green-900 text-xl">👥</span>
            <span className="ml-2 text-yellow-400">Students: <strong>1000+</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
