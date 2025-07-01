import axios from "axios";
import { CheckCircle, RefreshCw, Save, Search, Users, X } from "lucide-react";
import { useState } from "react";
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
  
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("class"); // "class" or "search"

  // Base URL for your API
  const API_BASE_URL = "http://localhost:3000/api";

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

  //http://localhost:3000/api/attendance/class/1/section/Better

  // Fetch students by class and section
  const fetchStudents = async () => {
    const { className, section } = formData;
    
    if (!className.trim() || !section.trim()) {
      setError("Please enter both class name and section");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/attendance/class/${className}/section/${section}`
      );

      if (response.data.success) {
        setStudents(response.data.data);
        // Initialize attendance state
        const initialAttendance = {};
        response.data.data.forEach(student => {
          initialAttendance[student.StudentID] = 'Present'; // Default to Present
        });
        setAttendance(initialAttendance);
        // Fetch existing attendance for the selected date
        await fetchExistingAttendance(className, section);
      } else {
        setError(response.data.message || "Failed to fetch students");
        setStudents([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching students"
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing attendance for class and section
  const fetchExistingAttendance = async (className, section) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/attendance/class/${className}/section/${section}`
      );

      if (response.data.success && response.data.data.length > 0) {
        const existingAttendance = {};
        response.data.data.forEach(record => {
          // Filter by the selected date
          if (record.ClassDate.split('T')[0] === formData.date) {
            existingAttendance[record.StudentID] = record.Status;
          }
        });
        
        // Update attendance state with existing records
        setAttendance(prev => ({
          ...prev,
          ...existingAttendance
        }));
      }
    } catch (err) {
      console.log("No existing attendance found or error:", err.message);
    }
  };

  // Search attendance by name, roll, class, and section
  //http://localhost:3000/api/attendance/name/John/roll/101/class/1/section/Better  this url is working  on postman

  const searchAttendance = async () => {
    const { name = "", roll = "", className = "", section = "" } = searchData || {};

    if (!name.trim() || !roll.trim() || !className.trim() || !section.trim()) {
      setSearchError("Please fill in all search fields");
      return;
    }

    setSearchLoading(true);
    setSearchError("");
    
    try {
      // URL encode the parameters to handle special characters
      const encodedName = encodeURIComponent(name.trim());
      const encodedRoll = encodeURIComponent(roll.trim());
      const encodedClassName = encodeURIComponent(className.trim());
      const encodedSection = encodeURIComponent(section.trim());
      
      const searchUrl = `${API_BASE_URL}/attendance/name/${encodedName}/roll/${encodedRoll}/class/${encodedClassName}/section/${encodedSection}`;
      
      console.log("Search URL:", searchUrl); // Debug log
      
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
      console.error("Search error:", err); // Debug log
      setSearchError(
        err.response?.data?.message || `Error searching attendance: ${err.message}`
      );
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Toggle attendance status for a student
  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };

  // Save attendance records
  const saveAttendance = async () => {
    if (students.length === 0) {
      setError("No students to save attendance for");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const attendanceRecords = students.map(student => ({
        studentID: student.StudentID,
        classID: student.ClassID,
        classDate: formData.date,
        status: attendance[student.StudentID] || 'Present'
      }));

      // Save each attendance record
      const savePromises = attendanceRecords.map(record =>
        axios.post(`${API_BASE_URL}/attendance`, record)
      );

      await Promise.all(savePromises);
      
      setSuccess(`Attendance saved successfully for ${students.length} students!`);
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
                      <th>Section</th>
                      {/* Generate unique date columns */}
                      {Array.from(new Set(searchResults.map(record => 
                        new Date(record.ClassDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      ))).map((date, index) => (
                        <th key={index} className="date-header">
                          {date}
                          <span className="date-short">
                            {new Date(searchResults.find(r => 
                              new Date(r.ClassDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) === date
                            ).ClassDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="search-table-body">
                    {/* Group records by student */}
                    {Array.from(new Map(searchResults.map(record => [
                      `${record.StudentName || (record.FirstName && record.LastName ? `${record.FirstName} ${record.LastName}` : searchData.name)}-${record.RollNumber || searchData.roll}`,
                      {
                        name: record.StudentName || (record.FirstName && record.LastName ? `${record.FirstName} ${record.LastName}` : searchData.name),
                        roll: record.RollNumber || searchData.roll,
                        section: record.Section || searchData.section,
                        className: record.ClassName || searchData.className,
                        records: searchResults.filter(r => 
                          (r.StudentName || (r.FirstName && r.LastName ? `${r.FirstName} ${r.LastName}` : searchData.name)) === 
                          (record.StudentName || (record.FirstName && record.LastName ? `${record.FirstName} ${record.LastName}` : searchData.name)) &&
                          (r.RollNumber || searchData.roll) === (record.RollNumber || searchData.roll)
                        )
                      }
                    ])).values()).map((student, studentIndex) => (
                      <tr key={studentIndex} className="search-table-row">
                        <td className="search-table-cell">
                          <div className="student-info-cell">
                            <div className="student-name-table">
                              {student.name || 'N/A'}
                            </div>
                            <div className="student-details-table">
                              <span className="detail-badge">
                                Class: {student.className || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="search-table-cell">
                          <strong>{student.roll || 'N/A'}</strong>
                        </td>
                        <td className="search-table-cell">
                          <strong>{student.section || 'N/A'}</strong>
                        </td>
                        {/* Show attendance for each date */}
                        {Array.from(new Set(searchResults.map(record => 
                          new Date(record.ClassDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        ))).map((date, dateIndex) => {
                          const attendanceRecord = student.records.find(record => 
                            new Date(record.ClassDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) === date
                          );
                          
                          return (
                            <td key={dateIndex} className="search-table-cell attendance-status-cell">
                              {attendanceRecord ? (
                                <span className={`status-badge-table ${
                                  attendanceRecord.Status && attendanceRecord.Status.toLowerCase() === 'present' ? 'present' : 'absent'
                                }`}>
                                  {attendanceRecord.Status && attendanceRecord.Status.toLowerCase() === 'present' ? (
                                    <>
                                      ✅ Present
                                    </>
                                  ) : (
                                    <>
                                      ❌ Absent
                                    </>
                                  )}
                                </span>
                              ) : (
                                <span className="status-badge-table" style={{ 
                                  background: '#f3f4f6', 
                                  color: '#6b7280',
                                  border: '1px solid #d1d5db'
                                }}>
                                  - No Record
                                </span>
                              )}
                            </td>
                          );
                        })}
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
      </div>
      <Footer />
    </>
  );
};

export default AttendancePage;