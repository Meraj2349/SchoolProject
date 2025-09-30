import { useState } from "react";
import attendanceAPI from "../../api/attendanceApi";
import studentAPI from "../../api/studentApi";
import "../../assets/styles/StudentListpage.css";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import LatestUpdatesNotice from "./LatestUpdatesNotice";

const StudentSearch = () => {
  const [searchFilters, setSearchFilters] = useState({
    firstName: "",
    rollNumber: "",
    className: "",
    section: "",
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    // Check if ALL fields are filled and not just whitespace
    const allFieldsFilled = Object.values(searchFilters).every(
      (value) => value && value.trim() !== ""
    );

    if (!allFieldsFilled) {
      setError("Please fill in all search fields (First Name, Roll Number, Class Name, and Section Name)");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      // Trim all values for clean search
      const trimmedSearchData = Object.entries(searchFilters).reduce((acc, [key, value]) => {
        acc[key] = value.trim();
        return acc;
      }, {});

      // Use the studentAPI to search students with all required data
      // Map frontend field names to backend field names
      const backendSearchData = {
        FirstName: trimmedSearchData.firstName,
        RollNumber: trimmedSearchData.rollNumber,
        ClassName: trimmedSearchData.className,
        Section: trimmedSearchData.section
      };
      
      const response = await studentAPI.searchStudents(backendSearchData);

      if (response.success) {
        const foundStudents = response.data || [];
        
        console.log("Backend search successful. Found students:", foundStudents);
        console.log("Search criteria sent to backend:", backendSearchData);
        
        if (foundStudents.length === 0) {
          setError("No students found matching your search criteria");
          setStudents([]);
        } else {
          // Filter for exact matches but be more flexible with matching
          const exactMatches = foundStudents.filter(student => {
            const firstNameMatch = student.FirstName?.toLowerCase().trim() === trimmedSearchData.firstName.toLowerCase().trim();
            const rollNumberMatch = student.RollNumber?.toString().trim() === trimmedSearchData.rollNumber.toString().trim();
            const classNameMatch = student.ClassName?.toLowerCase().trim() === trimmedSearchData.className.toLowerCase().trim();
            const sectionMatch = student.Section?.toLowerCase().trim() === trimmedSearchData.section.toLowerCase().trim();
            
            return firstNameMatch && rollNumberMatch && classNameMatch && sectionMatch;
          });

          if (exactMatches.length === 0) {
            // If no exact matches, show partial matches for debugging
            console.log("Search criteria:", trimmedSearchData);
            console.log("Found students:", foundStudents);
            
            // Try to find the best match and show helpful error message
            const partialMatches = foundStudents.filter(student => {
              const firstNameMatch = student.FirstName?.toLowerCase().includes(trimmedSearchData.firstName.toLowerCase());
              const rollNumberMatch = student.RollNumber?.toString().includes(trimmedSearchData.rollNumber);
              return firstNameMatch || rollNumberMatch;
            });

            if (partialMatches.length > 0) {
              setError(`No exact match found. Found ${partialMatches.length} student(s) with similar details. Please check your spelling and try again.`);
              setStudents(partialMatches); // Show partial matches to help user
            } else {
              setError("No student found with the provided details. Please verify the information and try again.");
              setStudents([]);
            }
          } else {
            setStudents(exactMatches);
            setError("");
          }
        }
      } else {
        setError(response.message || "Search failed");
        setStudents([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "An error occurred while searching");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchFilters({
      firstName: "",
      rollNumber: "",
      className: "",
      section: "",
    });
    setStudents([]);
    setError("");
    setSearched(false);
    setSelectedStudent(null);
    setShowProfile(false);
  };

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setSelectedStudent(null);
    setShowProfile(false);
  };

  const handleViewAttendance = async (student) => {
    try {
      const response = await attendanceAPI.getAttendanceByStudentId(student.StudentID);
      if (response.success) {
        // Create a simple attendance summary
        const attendanceData = response.data;
        const totalDays = attendanceData.length;
        const presentDays = attendanceData.filter(record => record.Status === 'Present').length;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
        
        alert(`Attendance Summary for ${student.FirstName} ${student.LastName}:\n\nTotal Days: ${totalDays}\nPresent Days: ${presentDays}\nAttendance Percentage: ${attendancePercentage}%\n\nDetailed attendance view will be implemented soon.`);
      } else {
        alert(`No attendance records found for ${student.FirstName} ${student.LastName}`);
      }
    } catch (error) {
      alert(`Error fetching attendance: ${error.message}`);
    }
  };

  const handleViewResults = (student) => {
    // Navigate to results view for this student
    alert(`Results functionality will be implemented for ${student.FirstName} ${student.LastName}`);
  };

  const handleViewSubjects = (student) => {
    // Navigate to subjects view for this student
    alert(`Subjects functionality will be implemented for ${student.FirstName} ${student.LastName}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="student-search-container">
      <Navbar />
<LatestUpdatesNotice />
      <div className="search-header">
        <h1 className="search-title">Student Search</h1>
        <p className="search-subtitle">
          Search for students by name, roll number, class, or section
        </p>
      </div>

      <div className="search-form-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-instruction">
            <p>Please fill in all fields below to search for a specific student. All fields are required for an accurate search.</p>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={searchFilters.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rollNumber" className="form-label">
                Roll Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={searchFilters.rollNumber}
                onChange={handleInputChange}
                placeholder="Enter roll number"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="className" className="form-label">
                Class Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="className"
                name="className"
                value={searchFilters.className}
                onChange={handleInputChange}
                placeholder="Enter class name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="section" className="form-label">
                Section Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="section"
                name="section"
                value={searchFilters.section}
                onChange={handleInputChange}
                placeholder="Enter section name"
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-search" disabled={loading}>
              {loading ? "Searching..." : "Search Students"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-reset"
            >
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <i className="error-icon">⚠</i>
            {error}
          </div>
        )}
      </div>

      {searched && (
        <div className="results-container">
          <div className="results-header">
            <h2 className="results-title">Search Results</h2>
            <span className="results-count">
              {students.length} student{students.length !== 1 ? "s" : ""} found
            </span>
          </div>

          {students.length > 0 ? (
            <div className="students-grid">
              {students.map((student) => (
                <div key={student.StudentID} className="student-profile-card">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      <div className="avatar-placeholder">
                        {student.FirstName?.charAt(0)}{student.LastName?.charAt(0)}
                      </div>
                    </div>
                    <div className="profile-info">
                      <h3 className="student-name">
                        {student.FirstName} {student.LastName}
                      </h3>
                      <p className="student-details">
                        Class {student.ClassName} - Section {student.Section}
                      </p>
                      <p className="student-roll">Roll Number: {student.RollNumber}</p>
                    </div>
                  </div>

                  <div className="profile-details">
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-icon">👤</span>
                        <div className="detail-content">
                          <span className="detail-label">Gender</span>
                          <span className="detail-value">{student.Gender}</span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <div className="detail-content">
                          <span className="detail-label">Date of Birth</span>
                          <span className="detail-value">{formatDate(student.DateOfBirth)}</span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">🎓</span>
                        <div className="detail-content">
                          <span className="detail-label">Admission Date</span>
                          <span className="detail-value">{formatDate(student.AdmissionDate)}</span>
                        </div>
                      </div>

                      {student.ParentContact && (
                        <div className="detail-item">
                          <span className="detail-icon">📞</span>
                          <div className="detail-content">
                            <span className="detail-label">Parent Contact</span>
                            <span className="detail-value">{student.ParentContact}</span>
                          </div>
                        </div>
                      )}

                      {student.Address && (
                        <div className="detail-item">
                          <span className="detail-icon">🏠</span>
                          <div className="detail-content">
                            <span className="detail-label">Address</span>
                            <span className="detail-value">{student.Address}</span>
                          </div>
                        </div>
                      )}

                      {student.Email && (
                        <div className="detail-item">
                          <span className="detail-icon">✉️</span>
                          <div className="detail-content">
                            <span className="detail-label">Email</span>
                            <span className="detail-value">{student.Email}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="profile-actions">
                    <button 
                      className="action-btn view-profile"
                      onClick={() => handleViewProfile(student)}
                    >
                      <span className="btn-icon">👁️</span>
                      View Full Profile
                    </button>
                    <button 
                      className="action-btn view-attendance"
                      onClick={() => handleViewAttendance(student)}
                    >
                      <span className="btn-icon">📊</span>
                      Attendance
                    </button>
                    <button 
                      className="action-btn view-results"
                      onClick={() => handleViewResults(student)}
                    >
                      <span className="btn-icon">📈</span>
                      Results
                    </button>
                    <button 
                      className="action-btn view-subjects"
                      onClick={() => handleViewSubjects(student)}
                    >
                      <span className="btn-icon">📚</span>
                      Subjects
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No students found</h3>
              <p>Try adjusting your search criteria and search again.</p>
            </div>
          )}
        </div>
      )}

      {/* Student Profile Modal */}
      {showProfile && selectedStudent && (
        <div className="profile-modal-overlay" onClick={handleCloseProfile}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>Complete Student Profile</h2>
              <button className="close-modal" onClick={handleCloseProfile}>
                ✕
              </button>
            </div>
            
            <div className="profile-modal-content">
              <div className="profile-main-info">
                <div className="profile-avatar-large">
                  <div className="avatar-placeholder-large">
                    {selectedStudent.FirstName?.charAt(0)}{selectedStudent.LastName?.charAt(0)}
                  </div>
                </div>
                <div className="profile-basic-info">
                  <h3>{selectedStudent.FirstName} {selectedStudent.LastName}</h3>
                  <p className="student-id-display">Student ID: {selectedStudent.StudentID}</p>
                  <p className="class-info">Class {selectedStudent.ClassName} - Section {selectedStudent.Section}</p>
                  <p className="roll-info">Roll Number: {selectedStudent.RollNumber}</p>
                </div>
              </div>

              <div className="profile-detailed-info">
                <div className="info-section">
                  <h4>Personal Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Gender:</span>
                      <span className="info-value">{selectedStudent.Gender}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Date of Birth:</span>
                      <span className="info-value">{formatDate(selectedStudent.DateOfBirth)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Admission Date:</span>
                      <span className="info-value">{formatDate(selectedStudent.AdmissionDate)}</span>
                    </div>
                    {selectedStudent.Address && (
                      <div className="info-item">
                        <span className="info-label">Address:</span>
                        <span className="info-value">{selectedStudent.Address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-section">
                  <h4>Contact Information</h4>
                  <div className="info-grid">
                    {selectedStudent.ParentContact && (
                      <div className="info-item">
                        <span className="info-label">Parent Contact:</span>
                        <span className="info-value">{selectedStudent.ParentContact}</span>
                      </div>
                    )}
                    {selectedStudent.Email && (
                      <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{selectedStudent.Email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-section">
                  <h4>Academic Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Current Class:</span>
                      <span className="info-value">{selectedStudent.ClassName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Section:</span>
                      <span className="info-value">{selectedStudent.Section}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Roll Number:</span>
                      <span className="info-value">{selectedStudent.RollNumber}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="profile-modal-actions">
                <button 
                  className="modal-action-btn attendance-btn"
                  onClick={() => handleViewAttendance(selectedStudent)}
                >
                  📊 View Attendance
                </button>
                <button 
                  className="modal-action-btn results-btn"
                  onClick={() => handleViewResults(selectedStudent)}
                >
                  📈 View Results
                </button>
                <button 
                  className="modal-action-btn subjects-btn"
                  onClick={() => handleViewSubjects(selectedStudent)}
                >
                  📚 View Subjects
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default StudentSearch;