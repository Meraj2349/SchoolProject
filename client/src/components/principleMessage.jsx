import React from "react";
import PrincipalPhoto from "../assets/principal.png";

const PrincipalMessage = () => {
  return (
    <div className="w-full bg-zinc-50 py-10 px-4">
      <div className="max-w-7xl mx-autobg-zinc-50 p-8  rounded-lg">
      <h2 className="text-xl md:text-xl font-bold text-gray-900 relative mb-8 text-center md:text-left">
  <span className="relative z-10">Message from the Principal</span>
  <span className="absolute left-1/2 md:left-0 bottom-0 w-36 md:w-48 h-2 bg-green-500 rounded-full transform -translate-x-1/2 md:translate-x-0"></span>
</h2>


        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Principal's Photo */}
          <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-green-500 p-1 ">
            <img
              src={PrincipalPhoto} // Replace with actual image URL
              alt="Principal"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Principal's Details & Message */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-semibold text-gray-800">Prof. Dr. John Doe</h3>
            <p className="text-gray-600 text-lg mb-3">Ph.D. in Education, M.Ed.</p>
            <p className="text-gray-700 text-md">
              📧 Email:{" "}
              <a
                href="mailto:principal@example.com"
                className="text-blue-600 hover:underline"
              >
                principal@example.com
              </a>
            </p>
            <p className="text-gray-700 text-md mb-4">
              📞 Mobile:{" "}
              <a href="tel:+1234567890" className="text-blue-600 hover:underline">
                +123 456 7890
              </a>
            </p>

            {/* Principal's Message */}
            <p className="text-gray-700 leading-relaxed text-lg">
              "Education is the foundation of a brighter future. At Star Academic School, 
              we strive to create a nurturing and inclusive environment that fosters 
              intellectual growth, creativity, and character development. Our goal is to 
              empower students to become leaders of tomorrow."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalMessage;
