import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  
  const menuItems = [
    { name: "Home", path: "/", content: "Welcome to our homepage" },
    { name: "About", path: "/about", content: "Learn about our institution" },
    { name: "Contact", path: "/contact", content: "Get in touch with us" },
    { name: "Admission", path: "/admission", content: "Apply for admission" },
    { name: "Result", path: "/result", content: "Check your results" },
    { name: "Assignment", path: "/assignment", content: "View and submit assignments" },
    { name: "ePayment", path: "/epayment", content: "Make online payments" },
    { name: "Gallery", path: "/gallery", content: "View our photo gallery" }
  ];
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleMouseEnter = (index) => {
    setActiveItem(index);
  };
  
  const handleMouseLeave = () => {
    setActiveItem(null);
  };
  
  return (
    <div className=" font-mono">
      <div className="w-full h-0.5 bg-green-500"></div>
      <nav className="bg-zinc-800 border-b-2 border-green-500 shadow-lg ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-1">
                  {menuItems.map((item, index) => (
                    <div 
                      key={index}
                      className="relative group"
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Link
                        to={item.path}
                        className="text-gray-300 hover:bg-zinc-700 hover:text-yellow-500 px-3 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-300 border-l-2 border-transparent hover:border-yellow-500 flex items-center"
                      >
                        <div className="w-1 h-1 bg-yellow-500 mr-2"></div>
                        {item.name}
                      </Link>
                      {activeItem === index && (
                        <div className="absolute z-10 mt-1 w-48 bg-zinc-700 rounded-none shadow-lg py-1 border-l-2 border-yellow-500">
                          <div className="px-4 py-3 text-sm text-gray-300 border-t border-zinc-600">
                            {item.content}
                            <div className="">
                              <Link 
                                to={item.path} 
                                className="text-yellow-500 hover:underline text-xs uppercase tracking-wider"
                              >
                                Go to page →
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:hidden flex items-center">
                <button
                  onClick={toggleMenu}
                  className="inline-flex items-center justify-center p-2 rounded-none text-gray-300 hover:bg-zinc-700 hover:text-yellow-500 border border-zinc-600 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isOpen ? (
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <Link to="/profile" className="flex items-center space-x-3 group">
                <div className="text-gray-300 text-sm font-medium uppercase tracking-wider group-hover:text-yellow-500 transition-all duration-300">
                  <span className="hidden sm:inline">GUEST</span>
                </div>
                <div className="relative h-10 w-10 rounded-full border-2 border-yellow-500 flex-shrink-0 overflow-hidden">
                  <img 
                    src="/api/placeholder/100/100" 
                    alt="Guest Profile" 
                    className="h-full w-full object-cover group-hover:opacity-80 transition-all duration-300"
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
        {isOpen && (
          <div className="md:hidden border-t border-zinc-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item, index) => (
                <div key={index} className="relative">
                  <Link
                    to={item.path}
                    className="text-gray-300 hover:bg-zinc-700 hover:text-yellow-500 px-3 py-2 text-base font-medium uppercase tracking-wider border-l-2 border-transparent hover:border-yellow-500 flex items-center"
                  >
                    <div className="w-1 h-1 bg-yellow-500 mr-2"></div>
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default NavBar;
