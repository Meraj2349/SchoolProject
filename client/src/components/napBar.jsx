import React, { useState } from 'react';

const NapBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  
  const menuItems = [
    { name: "Home", content: "Welcome to our homepage", link: "/home" },
    { name: "About", content: "Learn about our institution", link: "/about" },
    { name: "Contact", content: "Get in touch with us", link: "/contact" },
    { name: "Admission", content: "Apply for admission", link: "/admission" },
    { name: "Result", content: "Check your results", link: "/result" },
    { name: "Assignment", content: "View and submit assignments", link: "/assignment" },
    { name: "ePayment", content: "Make online payments", link: "/payment" },
    { name: "Gallery", content: "View our photo gallery", link: "/gallery" }
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
    <div className="font-mono">
      <div className="w-full h-0.5 bg-green-500"></div>
      <nav className="bg-zinc-800 border-b-2 border-green-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            {/* Logo and Menu Section */}
            <div className="flex items-center space-x-4">
              {/* Desktop menu */}
              <div className="hidden md:block">
                <div className="flex items-baseline space-x-1">
                  {menuItems.map((item, index) => (
                    <div 
                      key={index}
                      className="relative group"
                      onMouseEnter={() => handleMouseEnter(index)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <a
                        href={item.link}
                        className="text-gray-300 hover:bg-zinc-700 hover:text-yellow-500 px-3 py-2 text-sm font-medium uppercase tracking-wider transition-all duration-300 border-l-2 border-transparent hover:border-yellow-500 flex items-center"
                      >
                        <div className="w-1 h-1 bg-yellow-500 mr-2"></div>
                        {item.name}
                      </a>
                      
                      {activeItem === index && (
                        <div className="absolute z-10 mt-1 w-48 bg-zinc-700 rounded-none shadow-lg py-1 border-l-2 border-yellow-500">
                          <div className="px-4 py-3 text-sm text-gray-300 border-t border-zinc-600">
                            {item.content}
                            <div className="mt-2">
                              <a 
                                href={item.link} 
                                className="text-yellow-500 hover:underline text-xs uppercase tracking-wider"
                              >
                                Go to page →
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Mobile menu button */}
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
            
            {/* Profile Section */}
            <div className="flex items-center">
              <a 
                href="/profile" 
                className="flex items-center space-x-3 group"
                onMouseEnter={() => handleMouseEnter('profile')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="text-gray-300 text-sm font-medium uppercase tracking-wider group-hover:text-yellow-500 transition-all duration-300">
                  <span className="hidden sm:inline">GUEST MODE</span>
                </div>
                <div className="relative h-10 w-10 rounded-full border-2 border-yellow-500 flex-shrink-0 overflow-hidden">
                  <img 
                    src="/api/placeholder/100/100" 
                    alt="Guest Profile" 
                    className="h-full w-full object-cover group-hover:opacity-80 transition-all duration-300"
                  />
                </div>
                
                {activeItem === 'profile' && (
                  <div className="absolute z-10 right-0 mt-32 w-48 bg-zinc-700 rounded-none shadow-lg py-1 border-l-2 border-yellow-500">
                    <div className="px-4 py-3 text-sm text-gray-300 border-t border-zinc-600">
                      Click to view your profile
                      <div className="mt-2">
                        <a 
                          href="/profile" 
                          className="text-yellow-500 hover:underline text-xs uppercase tracking-wider"
                        >
                          Go to profile →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </a>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden border-t border-zinc-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item, index) => (
                <div 
                  key={index} 
                  className="relative"
                  onClick={() => {
                    if (activeItem === index) {
                      setActiveItem(null);
                    } else {
                      setActiveItem(index);
                    }
                  }}
                >
                  <a
                    href={item.link}
                    className="text-gray-300 hover:bg-zinc-700 hover:text-yellow-500 px-3 py-2 text-base font-medium uppercase tracking-wider border-l-2 border-transparent hover:border-yellow-500 flex items-center"
                  >
                    <div className="w-1 h-1 bg-yellow-500 mr-2"></div>
                    {item.name}
                  </a>
                  
                  {activeItem === index && (
                    <div className="mt-1 bg-zinc-700 border-l-2 border-yellow-500 py-2 px-6 text-sm text-gray-300">
                      {item.content}
                      <div className="mt-2">
                        <a 
                          href={item.link} 
                          className="text-yellow-500 hover:underline text-xs uppercase tracking-wider"
                        >
                          Go to page →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

    </div>
  );
};

export default NapBar;