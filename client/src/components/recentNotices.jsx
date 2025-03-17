const recentNotices = () => {
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
              {/* Replace this static data with dynamic data from the backend */}
              {[
                { title: "২০২৫ সালের এইচ.এস.সি পরীক্ষার্থীদের নামের তালিকা।", date: "03/02/2025" },
                { title: "এইচ.এস.সি পরীক্ষা-২০২৫ এর ফরম পূরণ সম্পর্কিত বিজ্ঞপ্তি।", date: "03/02/2025" },
                { title: "দ্বাদশ শ্রেণির নির্বাচনী পরীক্ষার ফলাফল প্রকাশ সম্পর্কিত বিজ্ঞপ্তি।", date: "02/27/2025" },
                { title: "পরিবেশ মন্ত্রণালয় উপকল্পে পাঠদান কার্যক্রম বন্ধ সম্পর্কিত বিজ্ঞপ্তি।", date: "02/27/2025" },
                { title: "বদলি ও পার্শ্ববর্তী বদলি শিক্ষার্থীদের ভর্তি সংক্রান্ত বিজ্ঞপ্তি।", date: "02/17/2025" },
              ].map((notice, index) => (
                <tr key={index} className="border border-gray-200 hover:bg-gray-100">
                  <td className="p-2 border border-gray-200 text-gray-700">{notice.title}</td>
                  <td className="p-2 border border-gray-200 text-gray-700">{notice.date}</td>
                  <td className="p-2 border border-gray-200 text-blue-600 hover:underline cursor-pointer">Download</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-right mt-2">
          <a href="/notices" className="text-blue-600 hover:underline text-sm">View More</a>
        </div>
      </div>
      
    );
    }

    export default recentNotices;