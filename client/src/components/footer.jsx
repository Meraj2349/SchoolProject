import React from "react";
import { FaFacebookF, FaPinterestP } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full">
      {/* Brown Section */}
      <div className="w-full bg-[#b58e6a] h-6 md:h-8"></div>

      {/* Dark Brown Section */}
      <div className="w-full bg-[#453D2D] py-6 md:py-8 text-center text-sm text-gray-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          {/* Copyright */}
          <p className="mb-3 md:mb-0">© 2025 Star Academic School</p>

          {/* Social Icons */}
          <div className="flex space-x-4 text-lg">
            <a href="#" className="hover:text-white">
              <FaFacebookF />
            </a>
            <a href="#" className="hover:text-white">
              <FaPinterestP />
            </a>
          </div>

          {/* Designer Info */}
          <p>
            Developer Info. {" "}
            <a href="#" className="underline hover:text-white">
              Shovon & Meraj
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
