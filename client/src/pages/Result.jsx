import React, { useState } from 'react';
import axios from 'axios'; // Import Axios
import Logo from '../assets/logo.png';

const ResultPage = () => {
  const [formData, setFormData] = useState({
    classID: '',
    examName: '',
    studentId: '',
    year: '', // Add year field
  });
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState(null); // State to store fetched result data

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');


    if (!formData.classID || !formData.examName || !formData.studentId || !formData.year) {
      setError('Please fill all the required fields');
      return;
    }


    setLoading(true);

    try {
      const encodedExamName = encodeURIComponent(formData.examName);
      const requestUrl = `http://localhost:3000/api/results/student/${formData.studentId}/${formData.classID}/${encodedExamName}/${formData.year}`;
      console.log('Request URL:', requestUrl);

      const response = await axios.get(requestUrl);

      console.log('API Response:', response.data);

      if (response.data && response.data.length > 0) {

        const transformedData = transformResultData(response.data);
        setResultData(transformedData);
        setShowResult(true);
      } else {
        setError('No results found for the given details.');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to fetch results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  // Function to transform API response
  const transformResultData = (apiData) => {
    console.log('API Data:', apiData); // Debug: Log raw API data

    if (apiData.length === 0) return null;

    // Extract common details from the first result
    const firstResult = apiData[0];

    // Calculate total marks, max marks, and percentage
    const totalMarks = apiData.reduce((sum, result) => sum + result.MarksObtained, 0);
    const minMarksInASubject = apiData.reduce((mn, result) => result.MarksObtained < mn ? result.MarksObtained : mn, 100);
    const maxMarks = apiData.length * 100; // Assuming each subject has a max of 100 marks
    const percentage = ((totalMarks / maxMarks) * 100).toFixed(2);
    const studentName = `${firstResult.FirstName} ${firstResult.LastName}`;
    const examName = firstResult.ExamName;
    const classID = firstResult.ClassID;
    const clsName = firstResult.ClassName;
   
    const section = firstResult.Section;
    const year = firstResult.Year;
    

    // Map subjects
    const subjects = apiData.map((result) => ({
      name: result.SubjectName,
      marks: result.MarksObtained,
      
      grade: calculateGrade(result.MarksObtained), // Calculate grade
      highestMarks: result.HighestMarksInSubject, // Assuming highest marks is 100 for each subject
    }));

    // Return transformed data
    return {
      studentName,
      classID,
      rollNumber: firstResult.StudentID.toString(),
      examName,
      subjects,
      totalMarks,
      clsName,
      maxMarks,
      year,
      section,
      percentage,
      result: minMarksInASubject >= 33 ? 'PASS' : 'FAIL', // Example pass/fail logic
      rank: '-', // Example rank (you can calculate this if needed)
      remarks: percentage >= 80 ? 'Excellent performance. Keep it up!' : 'Good effort!', // Example remarks
    };
  };

  // Function to calculate grade based on marks
  const calculateGrade = (marks) => {
    if (marks >= 80) return 'A+';
    if (marks >= 70) return 'A';
    if (marks >= 60) return 'A-';
    if (marks >= 50) return 'B';
    if (marks >= 40) return 'C';
    if(marks >= 33) return 'D';
    return 'F';
  };



  const resetForm = () => {
    setFormData({ classID: '', examName: '', studentId: '', year: '' }); // Reset year field
    setShowResult(false);
    setError('');
    setResultData(null); // Clear result data
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {!showResult ? (
            /* Result Check Form */
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Check Your Result</h2>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 border border-red-200">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="classID" className="block text-gray-700 font-medium mb-2">
                      Class Name
                    </label>
                    <select
                      id="classID"
                      name="classID"
                      value={formData.classID}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Class</option>
                      <option value="1">CLASS ONE-A</option>
                      <option value="2">CLASS ONE-B</option>
                      <option value="3">CLASS TWO-A</option>
                      <option value="4">CLASS TWO-B</option>
                      <option value="5">CLASS THREE-A</option>
                      <option value="6">CLASS THREE-B</option>
                      <option value="7">CLASS FOUR-A</option>
                      <option value="8">CLASS FOUR-B</option>
                      <option value="9">CLASS FIVE-A</option>
                      <option value="10">CLASS FIVE-B</option>
                      <option value="11">CLASS SIX-A</option>
                      <option value="12">CLASS SIX-B</option>
                      <option value="13">CLASS SEVEN-A</option>
                      <option value="14">CLASS SEVEN-B</option>
                      <option value="15">CLASS EIGHT-A</option>
                      <option value="16">CLASS EIGHT-B</option>
                      <option value="17">CLASS NINE-A</option>
                      <option value="18">CLASS NINE-B</option>
                      <option value="19">CLASS TEN-A</option>
                      <option value="20">CLASS TEN-B</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="examName" className="block text-gray-700 font-medium mb-2">
                      Exam Name
                    </label>
                    <select
                      id="examName"
                      name="examName"
                      value={formData.examName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Exam</option>
                      <option value="Half Yearly Exam">Half Yearly Exam</option>
                      <option value="Annual Exam">Annual Exam</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="studentId" className="block text-gray-700 font-medium mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="Enter your Student ID"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Example: 202501001</p>
                  </div>

                  {/* Add Year Field */}
                  <div>
                    <label htmlFor="year" className="block text-gray-700 font-medium mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="Enter Year (e.g., 2024)"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-bold py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Check Result'
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-8 text-center text-gray-600">
                <p>For any assistance, please contact the school office:</p>
                <p className="mt-1">Email: support@staracademicschool.edu | Phone: +880 1000 000000</p>
              </div>
            </div>
          ) : (
            /* Result Display */
            <div className="relative bg-amber-50 rounded-lg shadow-xl overflow-hidden">
              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 60 }}>
                <img src={Logo} alt="School Logo" className="w-3/4 max-w-lg opacity-8" />
              </div>

              {/* Result Header */}
              <div className="bg-amber-100 text-white p-6" style={{ position: 'relative', zIndex: 2 }}>
                <div className="flex justify-between items-center">
                  <div className="flex h-22 items-center px-4 md:h-23 md:px-6 lg:max-w-7xl lg:px-8">
                    <img src={Logo} alt="" className="ml-1 h-19 w-16 md:h-24 md:w-24 lg:h-22 lg:w-22 object-contain p-1 max-w-full" />
                    <ul className="ml-2 h-16 w-48 md:h-24 md:w-60 lg:h-22 lg:w-55 object-contain p-1 max-w-full flex flex-col text-x">
                      <li className="text-blue-900 font-bold text-xl">Star Academic School</li>
                      <li className="text-black font-light text-x">Natiapara, Delduar, Tangail</li>
                      <li className="text-stone-400 font-semi-bold text-sm">ESTD: 2012</li>
                    </ul>
                  </div>

                  <div className={`px-4 py-1 rounded-full text-sm font-bold ${resultData.result === 'PASS' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {resultData.result}
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div className="p-6 border-b" style={{ position: 'relative', zIndex: 2 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Student Name</p>
                    <p className="font-semibold text-lg">{resultData.studentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Roll Number</p>
                    <p className="font-semibold">{resultData.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Class</p>
                    <p className="font-semibold">{resultData.clsName} - {resultData.section}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Examination</p>
                    <p className="font-semibold">{resultData.examName} - {formData.year}</p>
                  </div>
                </div>
              </div>

              {/* Marks Table */}
              <div className="p-6" style={{ position: 'relative', zIndex: 2 }}>
                <h3 className="font-bold text-lg mb-4">Subject Marks</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-amber-50">
                      <tr>
                        <th className="px-4 py-3 border">Subject</th>
                        <th className="px-4 py-3 border text-center">Marks</th>
                        <th className="px-4 py-3 border text-center">Grade</th>
                        <th className="px-4 py-3 border text-center">Highest Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultData.subjects.map((subject, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-5 py-3 border">{subject.name}</td>
                          <td className="px-5 py-3 border text-center">{subject.marks}</td>
                          <td className="px-5 py-3 border text-center">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                subject.grade === 'A+'
                                  ? 'bg-green-500 text-white'
                                  : subject.grade === 'A'

                                  ? 'bg-green-400 text-white'
                                  : subject.grade === 'A-'

                                  ? 'bg-blue-400 text-white'
                                  : subject.grade === 'B'

                                  ? 'bg-blue-300 text-white'
                                  : subject.grade === 'C'

                                  ? 'bg-yellow-400 text-white'
                                  : subject.grade === 'D'
                                  
                                  ? 'bg-red-400 text-white'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {subject.grade}
                            </span>
                          </td>
                          <td className="px-4 py-3 border text-center">{subject.highestMarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Result Summary */}
              <div className="p-6 bg-amber-50 border-t" style={{ position: 'relative', zIndex: 2 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow border">
                    <p className="text-gray-500 text-sm">Total Marks</p>
                    <p className="font-bold text-2xl">
                      {resultData.totalMarks}/{resultData.maxMarks}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border">
                    <p className="text-gray-500 text-sm">Percentage</p>
                    <p className="font-bold text-2xl">{resultData.percentage}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow border">
                    <p className="text-gray-500 text-sm">Rank</p>
                    <p className="font-bold text-2xl">{resultData.rank}</p>
                  </div>
                </div>

                <div className="mt-6 bg-amber-100 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold mb-2">Remarks</h4>
                  <p>{resultData.remarks}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4" style={{ position: 'relative', zIndex: 2 }}>
                <button
                  onClick={resetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-md transition duration-200 cursor-pointer"
                >
                  Check Another Result
                </button>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-200 flex items-center cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPage;