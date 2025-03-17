import React from "react";
import logo from "../assets/logo.png";
import aplyNow from "../assets/applyNow.png";
import NavBar from "../components/navBar";

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-50 text-black shadow-md transition-all duration-200 items-center">
      <div className=" sticky top-0 flex h-22 items-center px-4 md:h-23 md:px-6 lg:max-w-7xl lg:px-8 justify-between">
        {/* Left Section: Logo & Info */}
        <div className="flex h-22 items-center px-4 md:h-23 md:px-6 lg:max-w-7xl lg:px-8">
          <img
            src={logo}
            alt="Logo"
            className="ml-1 h-19 w-16 md:h-24 md:w-24 lg:h-22 lg:w-22 object-contain p-1 max-w-full"
          />
          <ul className="ml-2 h-16 w-48 md:h-24 md:w-60 lg:h-22 lg:w-55 object-contain p-1 max-w-full flex flex-col text-x">
          
            <li className="text-blue-900 font-bold text-xl">Star Academic School</li>
            <li>Natiapara, Tangail</li>
            <li className="text-cyan-400 font-bold">ESTD: 2012</li>
          </ul>
        </div>

        {/* Apply Now Button */}
        <button
          onClick={() => alert("Apply Now Clicked!")}
          className="absolute bottom-0 right-0 top-0 flex items-center justify-center"
        >                                                                                                                                                                                                                 
          <img
            src={aplyNow}
            alt="Apply Now"
            className=" right-0 top-0 object-contain p-1 max-w-full w-20 md:w-24 lg:w-28 cursor-pointer hover:opacity-80"
          />
        </button>
      </div>
      <NavBar />
    </header>
  );
};

export default Header;
