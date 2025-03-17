import React, { useEffect, useState } from 'react';
import Footer from '../components/footer';
import axios from 'axios';

const AllNotices = () => {
  const [notices, setNotices] = useState([]);
  const [displayedNotices, setDisplayedNotices] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get('/api/multer/files'); // Fetch notices from the backend
        // Sort notices by date in descending order (most recent first)
        const sortedNotices = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setNotices(sortedNotices);
        // Initially display only the first 5 notices
        setDisplayedNotices(sortedNotices.slice(0, 11));
      } catch (error) {
        console.error('Error fetching notices:', error);
      }
    };

    fetchNotices();
  }, []);

  const handleSeeMore = () => {
    // Show all notices
    setDisplayedNotices(notices);
    setShowAll(true);
  };

  const handleSeeLess = () => {
    // Show only the first 5 notices
    setDisplayedNotices(notices.slice(0, 11));
    setShowAll(false);
  };


  return (
    <div className="bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-3">Notice & Circular</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-green-400 text-white text-left">
              <th className="p-2 border border-gray-200">Description</th>
              <th className="p-2 border border-gray-200">Date</th>
              <th className="p-2 border border-gray-200">Download</th>
            </tr>
          </thead>
          <tbody>
            {displayedNotices.map((notice) => (
              <tr key={notice.id} className="border border-gray-200 hover:bg-gray-100">
                <td className="p-2 border border-gray-200 text-gray-700">{notice.title}</td>
                <td className="p-2 border border-gray-200 text-gray-700"> 

                   {new Date(notice.created_at).toLocaleDateString()} {/* Display the date */}
          
                </td>
                <td className="p-2 border border-gray-200 text-blue-600 hover:underline cursor-pointer">
                  <a href={`/uploads/${notice.filename}`} download> {/* Download link for the PDF */}
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-right mt-2">
        {!showAll ? (
          <button onClick={handleSeeMore} className="text-blue-600 hover:underline text-sm">
            See More
          </button>
        ) : (
          <button onClick={handleSeeLess} className="text-blue-600 hover:underline text-sm">
            See Less
          </button>
        )}
      </div>
      <Footer/>
    </div>
  );
};

export default AllNotices;