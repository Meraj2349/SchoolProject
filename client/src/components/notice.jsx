import React, { useEffect, useState, useRef } from "react";
import { FaBullhorn } from "react-icons/fa";

const Notice = () => {
  const [position, setPosition] = useState(window.innerWidth+10);
  const noticeRef = useRef(null); // Reference for the notice section

  useEffect(() => {
    const updatePosition = () => {
      setPosition(window.innerWidth); // Reset position when resizing
    };

    const interval = setInterval(() => {
      // Get the width of the notice section and the current position of the moving text
      const noticeWidth = noticeRef.current ? noticeRef.current.offsetWidth : 100;
      const noticeLeft = noticeRef.current ? noticeRef.current.getBoundingClientRect().left : window.innerWidth;

      // Check if the moving text has reached the notice section
      const hideThreshold = noticeLeft + 110; // Adjust margin based on where the notice is

      // If the position is less than the threshold, hide the moving text
      setPosition((prev) => (prev <= hideThreshold ? window.innerWidth : prev - 1));
    }, 28);

    window.addEventListener("resize", updatePosition);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  return (
    <div className="sticky top-0 z-40 w-full bg-gray-100 text-black shadow-md h-7 md:h-8 flex items-center justify-between px-4 overflow-hidden">
      {/* Moving text */}
      {position  > (noticeRef.current?.getBoundingClientRect().left || window.innerWidth) ? (
        <div
          style={{ left: `${position}px`, whiteSpace: "nowrap" , fontFamily: "'Noto Sans Bengali', sans-serif" }}
          className="absolute text-sm md:text-x lg:text-x  text-red-600"
        >
          স্টার একাডেমিক স্কুলে ২০২৫ শিক্ষাবর্ষের ভর্তি কার্যক্রম শুরু হয়েছে!
        </div>
      ) : null}

      {/* Notice section with icon */}
      <div ref={noticeRef} className="flex items-center gap-2 text-blue-900 font-bold">
        <FaBullhorn className="text-xl md:text-2xl lg:text-3xl text-yellow-500" />
        <span className="text-sm md:text-lg lg:text-xl">Notice |</span>
      </div>
    </div>
  );
};

export default Notice;