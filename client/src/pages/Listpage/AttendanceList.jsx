import axios from "axios";
import { CheckCircle, RefreshCw, Save, Search, Users, X, Calendar, BarChart } from "lucide-react";
import { useState, useEffect } from "react";
import "../../assets/styles/listcss/attendancelist.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

const AttendancePage = () => {
  const [formData, setFormData] = useState({
    className: "",
    section: "",
    date: new Date().toISOString().split('T')[0], // Today's date
  });

  const [searchData, setSearchData] = useState({
    name: "",
    roll: "",
    className: "",
    section: "",
  });

  const [dateRangeData, setDateRangeData] = useState({
    startDate: "",
    endDate: "",
  });
  
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [dateRangeResults, setDateRangeResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dateRangeLoading, setDateRangeLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [dateRangeError, setDateRangeError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("class"); // "class", "search", "dateRange", "statistics"

  // Base URL for your API
  const API_BASE_URL = "http://localhost:3000/api";

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear students when class/section changes
    if (name === 'className' || name === 'section') {
      setStudents([]);
      setAttendance({});
    }
  };

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date range input changes
  const handleDateRangeInputChange = (e) => {
    const { name, value } = e.target;
    setDateRangeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch students by class and section using the correct route
  const fetchStudents = async () => {
    const { className, section } = formData;
    
    if (!className.trim() || !section.trim()) {
      setError("Please enter both class name and section");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Using the correct route: /search/class/:className/section/:section
      const response = await axios.get(
        `${API_BASE_URL}/attendance/search/class/${encodeURIComponent(className)}/section/${encodeURIComponent(section)}`
      );

      if (response.data.success) {
        // Get unique students from attendance records
        const uniqueStudents = Array.from(
          new Map(response.data.data.map(record => [
            record.StudentID,
            {
              StudentID: record.StudentID,
              FirstName: record.FirstName,
              LastName: record.LastName,
              RollNumber: record.RollNumber,
              ClassID: record.ClassID,
              ClassName: record.ClassName,
              Section: record.Section
            }
          ])).values()
        );

        setStudents(uniqueStudents);
        
        // Initialize attendance state
        const initialAttendance = {};
        uniqueStudents.forEach(student => {
          initialAttendance[student.StudentID] = 'Present'; // Default to Present
        });
        setAttendance(initialAttendance);

        // Update attendance with existing records for the selected date
        const existingAttendance = {};
        response.data.data.forEach(record => {
          if (record.ClassDate.split('T')[0] === formData.date) {
            existingAttendance[record.StudentID] = record.Status;
          }
        });
        
        setAttendance(prev => ({
          ...prev,
          ...existingAttendance
        }));
      } else {
        setError(response.data.message || "Failed to fetch students");
        setStudents([]);
      }
    } catch (err) {
      // If no attendance records exist, try to get students from student API
      try {
        const studentResponse = await axios.get(
          `${API_BASE_URL}/students/class/${encodeURIComponent(className)}/section/${encodeURIComponent(section)}`
        );
        
        if (studentResponse.data.success) {
          setStudents(studentResponse.data.data);
          const initialAttendance = {};
          studentResponse.data.data.forEach(student => {
            initialAttendance[student.StudentID] = 'Present';
          });
          setAttendance(initialAttendance);
        } else {
          setError("No students found for this class and section");
          setStudents([]);
        }
      } catch (studentErr) {
        setError("No students found for this class and section");
        setStudents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Search attendance by name, roll, class, and section
  const searchAttendance = async () => {
    const { name = "", roll = "", className = "", section = "" } = searchData || {};

    if (!name.trim() || !roll.trim() || !className.trim() || !section.trim()) {
      setSearchError("Please fill in all search fields");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    
    try {
      // Using the correct route: /search/name/:firstName/roll/:roll/class/:class/section/:section
      const encodedName = encodeURIComponent(name.trim());
      const encodedRoll = encodeURIComponent(roll.trim());
      const encodedClassName = encodeURIComponent(className.trim());
      const encodedSection = encodeURIComponent(section.trim());
      
      const searchUrl = `${API_BASE_URL}/attendance/search/name/${encodedName}/roll/${encodedRoll}/class/${encodedClassName}/section/${encodedSection}`;
      
      const response = await axios.get(searchUrl);

      if (response.data.success) {
        setSearchResults(response.data.data);
        if (response.data.data.length === 0) {
          setSearchError("No attendance records found for the specified criteria");
        }
      } else {
        setSearchError(response.data.message || "No attendance records found");
        setSearchResults([]);
      }
    } catch (err) {
      setSearchError(
        err.response?.data?.message || `Error searching attendance: ${err.message}`
      );
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Search attendance by date range
  const searchByDateRange = async () => {
    const { startDate, endDate } = dateRangeData;

    if (!startDate || !endDate) {
      setDateRangeError("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setDateRangeError("Start date must be before end date");
      return;
    }

    setDateRangeLoading(true);
    setDateRangeError("");
    
    try {
      // Using the route: /search/daterange/:startDate/:endDate
      const response = await axios.get(
        `${API_BASE_URL}/attendance/search/daterange/${startDate}/${endDate}`
      );

      if (response.data.success) {
        setDateRangeResults(response.data.data);
        if (response.data.data.length === 0) {
          setDateRangeError("No attendance records found for the specified date range");
        }
      } else {
        setDateRangeError(response.data.message || "No attendance records found");
        setDateRangeResults([]);
      }
    } catch (err) {
      setDateRangeError(
        err.response?.data?.message || `Error searching attendance: ${err.message}`
      );
      setDateRangeResults([]);
    } finally {
      setDateRangeLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/statistics`);
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    }
  };

  // Toggle attendance status for a student
  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  // Check if attendance exists before creating
  const checkAttendanceExists = async (studentID, classID, classDate) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/attendance/exists?studentID=${studentID}&classID=${classID}&classDate=${classDate}`
      );
      return response.data.data.exists;
    } catch (err) {
      return false;
    }
  };

  // Save attendance records using bulk create
  const saveAttendance = async () => {
    if (students.length === 0) {
      setError("No students to save attendance for");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Check for existing records first
      const attendanceRecords = [];
      
      for (const student of students) {
        const exists = await checkAttendanceExists(
          student.StudentID,
          student.ClassID,
          formData.date
        );
        
        if (!exists) {
          attendanceRecords.push({
            studentID: student.StudentID,
            classID: student.ClassID,
            classDate: formData.date,
            status: attendance[student.StudentID] || 'Present'
          });
        }
      }

      if (attendanceRecords.length === 0) {
        setError("Attendance already exists for all students on this date");
        return;
      }

      // Use bulk create endpoint
      const response = await axios.post(
        `${API_BASE_URL}/attendance/bulk`,
        { attendanceRecords }
      );

      if (response.data.success) {
        setSuccess(`Attendance saved successfully for ${attendanceRecords.length} students!`);
        // Refresh statistics after saving
        fetchStatistics();
      } else {
        setError(response.data.message || "Error saving attendance");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error saving attendance"
      );
    } finally {
      setSaving(false);
    }
  };

  // Get attendance summary
  const getAttendanceSummary = () => {
    const total = students.length;
    const present = Object.values(attendance).filter(status => status === 'Present').length;
    const absent = total - present;
    
    return { total, present, absent };
  };

  const summary = getAttendanceSummary();

  return (
    <>
      <Navbar />
      <div className="attendance-container">
        <div className="attendance-header">
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Mark student attendance and search records efficiently</p>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'class' ? 'active' : ''}`}
            onClick={() => setActiveTab('class')}
          >
            <Users className="tab-icon" />
            Class Attendance
          </button>
          <button 
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <Search className="tab-icon" />
            Search Records
          </button>
          <button 
            className={`tab-btn ${activeTab === 'dateRange' ? 'active' : ''}`}
            onClick={() => setActiveTab('dateRange')}
          >
            <Calendar className="tab-icon" />
            Date Range
          </button>
          <button 
            className={`tab-btn ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            <BarChart className="tab-icon" />
            Statistics
          </button>
        </div>

        {/* Class Attendance Tab */}
        {activeTab === 'class' && (
          <>
            {/* Input Form */}
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="className" className="form-label">
                    Class Name
                  </label>
                  <input
                    type="text"
                    id="className"
                    name="className"
                    value={formData.className}
                    onChange={handleInputChange}
                    placeholder="Enter class name (e.g., 10th Grade)"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="section" className="form-label">
                    Section
                  </label>
                  <input
                    type="text"
                    id="section"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    placeholder="Enter section (e.g., A, B, C)"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date" className="form-label">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <button
                    onClick={fetchStudents}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="btn-icon spinning" />
                        Loading...
                      </>
                    ) : (
                      "Load Students"
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <X className="error-icon" />
                  {error}
                </div>
              )}

              {success && (
                <div className="success-message">
                  <CheckCircle className="success-icon" />
                  {success}
                </div>
              )}
            </div>

            {/* Attendance Summary */}
            {students.length > 0 && (
              <div className="summary-section">
                <h3 className="summary-title">Attendance Summary</h3>
                <div className="summary-stats">
                  <div className="stat-card">
                    <div className="stat-number">{summary.total}</div>
                    <div className="stat-label">Total Students</div>
                  </div>
                  <div className="stat-card present">
                    <div className="stat-number">{summary.present}</div>
                    <div className="stat-label">Present</div>
                  </div>
                  <div className="stat-card absent">
                    <div className="stat-number">{summary.absent}</div>
                    <div className="stat-label">Absent</div>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Sheet */}
            {students.length > 0 && (
              <div className="attendance-sheet">
                <div className="sheet-header">
                  <h3 className="sheet-title">
                    Attendance Sheet - {formData.className} {formData.section}
                  </h3>
                  <button
                    onClick={saveAttendance}
                    disabled={saving}
                    className="btn btn-success"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="btn-icon spinning" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="btn-icon" />
                        Save Attendance
                      </>
                    )}
                  </button>
                </div>

                <div className="attendance-table">
                  <div className="table-header">
                    <div className="header-cell">Roll No.</div>
                    <div className="header-cell">Student Name</div>
                    <div className="header-cell">Status</div>
                    <div className="header-cell">Action</div>
                  </div>

                  {students.map((student) => (
                    <div key={student.StudentID} className="table-row">
                      <div className="table-cell">{student.RollNumber}</div>
                      <div className="table-cell">
                        {student.FirstName} {student.LastName}
                      </div>
                      <div className="table-cell">
                        <span className={`status-badge ${
                          attendance[student.StudentID] === 'Present' ? 'present' : 'absent'
                        }`}>
                          {attendance[student.StudentID] === 'Present' ? (
                            <>
                              ✅
                              Present
                            </>
                          ) : (
                            <>
                              ❌
                              Absent
                            </>
                          )}
                        </span>
                      </div>
                      <div className="table-cell">
                        <button
                          onClick={() => toggleAttendance(student.StudentID)}
                          className={`toggle-btn ${
                            attendance[student.StudentID] === 'Present' ? 'present' : 'absent'
                          }`}
                        >
                          Mark {attendance[student.StudentID] === 'Present' ? 'Absent' : 'Present'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Students Message */}
            {!loading && students.length === 0 && formData.className && formData.section && (
              <div className="no-students">
                <div className="no-students-icon">👥</div>
                <h3>No Students Found</h3>
                <p>No students found for class "{formData.className}" and section "{formData.section}".</p>
                <p>Please check the class and section names and try again.</p>
              </div>
            )}
          </>
        )}

        {/* Search Records Tab */}
        {activeTab === 'search' && (
          <>
            {/* Search Form */}
            <div className="form-section">
              <h3 className="section-title">Search Attendance Records</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="searchName" className="form-label">
                    Student Name
                  </label>
                  <input
                    type="text"
                    id="searchName"
                    name="name"
                    value={searchData.name}
                    onChange={handleSearchInputChange}
                    placeholder="Enter student name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="searchRoll" className="form-label">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    id="searchRoll"
                    name="roll"
                    value={searchData.roll}
                    onChange={handleSearchInputChange}
                    placeholder="Enter roll number"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="searchClassName" className="form-label">
                    Class Name
                  </label>
                  <input
                    type="text"
                    id="searchClassName"
                    name="className"
                    value={searchData.className}
                    onChange={handleSearchInputChange}
                    placeholder="Enter class name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="searchSection" className="form-label">
                    Section
                  </label>
                  <input
                    type="text"
                    id="searchSection"
                    name="section"
                    value={searchData.section}
                    onChange={handleSearchInputChange}
                    placeholder="Enter section"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <button
                    onClick={searchAttendance}
                    disabled={searchLoading}
                    className="btn btn-primary"
                  >
                    {searchLoading ? (
                      <>
                        <RefreshCw className="btn-icon spinning" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="btn-icon" />
                        Search Records
                      </>
                    )}
                  </button>
                </div>
              </div>

              {searchError && (
                <div className="error-message">
                  <X className="error-icon" />
                  {searchError}
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="search-results">
                <h3 className="section-title">Search Results ({searchResults.length} record{searchResults.length > 1 ? 's' : ''} found)</h3>
                <div className="search-results-container">
                  <table className="search-results-table">
                    <thead className="search-table-header">
                      <tr>
                        <th>Student Info</th>
                        <th>Roll</th>
                        <th>Class</th>
                        <th>Section</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="search-table-body">
                      {searchResults.map((record, index) => (
                        <tr key={index} className="search-table-row">
                          <td className="search-table-cell">
                            <div className="student-info-cell">
                              <div className="student-name-table">
                                {record.FirstName} {record.LastName}
                              </div>
                            </div>
                          </td>
                          <td className="search-table-cell">
                            <strong>{record.RollNumber}</strong>
                          </td>
                          <td className="search-table-cell">
                            {record.ClassName}
                          </td>
                          <td className="search-table-cell">
                            <strong>{record.Section}</strong>
                          </td>
                          <td className="search-table-cell">
                            {new Date(record.ClassDate).toLocaleDateString()}
                          </td>
                          <td className="search-table-cell attendance-status-cell">
                            <span className={`status-badge-table ${
                              record.Status && record.Status.toLowerCase() === 'present' ? 'present' : 'absent'
                            }`}>
                              {record.Status && record.Status.toLowerCase() === 'present' ? (
                                <>
                                  ✅ Present
                                </>
                              ) : (
                                <>
                                  ❌ Absent
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Search Results Message */}
            {!searchLoading && searchResults.length === 0 && searchData.name && searchData.roll && (
              <div className="no-students">
                <div className="no-students-icon">🔍</div>
                <h3>No Records Found</h3>
                <p>No attendance records found for the specified criteria.</p>
                <p>Please check the search parameters and try again.</p>
              </div>
            )}
          </>
        )}

        {/* Date Range Tab */}
        {activeTab === 'dateRange' && (
          <>
            {/* Date Range Form */}
            <div className="form-section">
              <h3 className="section-title">Search by Date Range</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={dateRangeData.startDate}
                    onChange={handleDateRangeInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={dateRangeData.endDate}
                    onChange={handleDateRangeInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <button
                    onClick={searchByDateRange}
                    disabled={dateRangeLoading}
                    className="btn btn-primary"
                  >
                    {dateRangeLoading ? (
                      <>
                        <RefreshCw className="btn-icon spinning" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Calendar className="btn-icon" />
                        Search Range
                      </>
                    )}
                  </button>
                </div>
              </div>

              {dateRangeError && (
                <div className="error-message">
                  <X className="error-icon" />
                  {dateRangeError}
                </div>
              )}
            </div>

            {/* Date Range Results */}
            {dateRangeResults.length > 0 && (
              <div className="search-results">
                <h3 className="section-title">Date Range Results ({dateRangeResults.length} record{dateRangeResults.length > 1 ? 's' : ''} found)</h3>
                <div className="search-results-container">
                  <table className="search-results-table">
                    <thead className="search-table-header">
                      <tr>
                        <th>Student Name</th>
                        <th>Roll</th>
                        <th>Class</th>
                        <th>Section</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="search-table-body">
                      {dateRangeResults.map((record, index) => (
                        <tr key={index} className="search-table-row">
                          <td className="search-table-cell">
                            <div className="student-name-table">
                              {record.FirstName} {record.LastName}
                            </div>
                          </td>
                          <td className="search-table-cell">
                            <strong>{record.RollNumber}</strong>
                          </td>
                          <td className="search-table-cell">
                            {record.ClassName}
                          </td>
                          <td className="search-table-cell">
                            <strong>{record.Section}</strong>
                          </td>
                          <td className="search-table-cell">
                            {new Date(record.ClassDate).toLocaleDateString()}
                          </td>
                          <td className="search-table-cell attendance-status-cell">
                            <span className={`status-badge-table ${
                              record.Status && record.Status.toLowerCase() === 'present' ? 'present' : 'absent'
                            }`}>
                              {record.Status && record.Status.toLowerCase() === 'present' ? (
                                <>
                                  ✅ Present
                                </>
                              ) : (
                                <>
                                  ❌ Absent
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Date Range Results Message */}
            {!dateRangeLoading && dateRangeResults.length === 0 && dateRangeData.startDate && dateRangeData.endDate && (
              <div className="no-students">
                <div className="no-students-icon">📅</div>
                <h3>No Records Found</h3>
                <p>No attendance records found for the specified date range.</p>
                <p>Please try a different date range.</p>
              </div>
            )}
          </>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <>
            <div className="form-section">
              <h3 className="section-title">Attendance Statistics</h3>
              {statistics ? (
                <div className="summary-stats">
                  <div className="stat-card">
                    <div className="stat-number">{statistics.TotalRecords}</div>
                    <div className="stat-label">Total Records</div>
                  </div>
                  <div className="stat-card present">
                    <div className="stat-number">{statistics.TotalPresent}</div>
                    <div className="stat-label">Total Present</div>
                  </div>
                  <div className="stat-card absent">
                    <div className="stat-number">{statistics.TotalAbsent}</div>
                    <div className="stat-label">Total Absent</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{statistics.OverallAttendancePercentage}%</div>
                    <div className="stat-label">Overall Attendance</div>
                  </div>
                </div>
              ) : (
                <div className="no-students">
                  <div className="no-students-icon">📊</div>
                  <h3>Loading Statistics...</h3>
                  <p>Please wait while we fetch the attendance statistics.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AttendancePage;