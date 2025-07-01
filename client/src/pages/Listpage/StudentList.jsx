import React, { useState } from "react";
import axios from "axios";
import "../../assets/styles/StudentListpage.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const StudentSearch = () => {
  const [searchFilters, setSearchFilters] = useState({
    FirstName: "",
    RollNumber: "",
    ClassName: "",
    SectionName: "",
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Base URL for your API
  const API_BASE_URL = "http://localhost:3000/api/students";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    // Check if at least one field is filled
    const hasSearchCriteria = Object.values(searchFilters).some(
      (value) => value.trim() !== ""
    );

    if (!hasSearchCriteria) {
      setError("Please enter at least one search criteria");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value.trim()) {
          params.append(key, value.trim());
        }
      });

      const response = await axios.get(
        `${API_BASE_URL}/search/filter?${params.toString()}`
      );

      if (response.data.success) {
        setStudents(response.data.data);
      } else {
        setError(response.data.message || "Search failed");
        setStudents([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred while searching"
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchFilters({
      FirstName: "",
      RollNumber: "",
      ClassName: "",
      SectionName: "",
    });
    setStudents([]);
    setError("");
    setSearched(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="student-search-container">
      <Navbar />

      <div className="search-header">
        <h1 className="search-title">Student Search</h1>
        <p className="search-subtitle">
          Search for students by name, roll number, class, or section
        </p>
      </div>

      <div className="search-form-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="FirstName" className="form-label">
                First Name
              </label>
              <input
                type="text"
                id="FirstName"
                name="FirstName"
                value={searchFilters.FirstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="RollNumber" className="form-label">
                Roll Number
              </label>
              <input
                type="text"
                id="RollNumber"
                name="RollNumber"
                value={searchFilters.RollNumber}
                onChange={handleInputChange}
                placeholder="Enter roll number"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="ClassName" className="form-label">
                Class Name
              </label>
              <input
                type="text"
                id="ClassName"
                name="ClassName"
                value={searchFilters.ClassName}
                onChange={handleInputChange}
                placeholder="Enter class name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="SectionName" className="form-label">
                Section Name
              </label>
              <input
                type="text"
                id="SectionName"
                name="SectionName"
                value={searchFilters.SectionName}
                onChange={handleInputChange}
                placeholder="Enter section name"
                className="form-input"
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
                <div key={student.StudentID} className="student-card">
                  <div className="student-header">
                    <h3 className="student-name">
                      {student.FirstName} {student.LastName}
                    </h3>
                    <span className="student-id">ID: {student.StudentID}</span>
                  </div>

                  <div className="student-details">
                    <div className="detail-row">
                      <span className="detail-label">Roll Number:</span>
                      <span className="detail-value">{student.RollNumber}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Class Name:</span>
                      <span className="detail-value">{student.ClassName}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Section Name:</span>
                      <span className="detail-value">{student.SectionName}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Gender:</span>
                      <span className="detail-value">{student.Gender}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Date of Birth:</span>
                      <span className="detail-value">
                        {formatDate(student.DateOfBirth)}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Admission Date:</span>
                      <span className="detail-value">
                        {formatDate(student.AdmissionDate)}
                      </span>
                    </div>

                    {student.Address && (
                      <div className="detail-row">
                        <span className="detail-label">Address:</span>
                        <span className="detail-value">{student.Address}</span>
                      </div>
                    )}

                    {student.ParentContact && (
                      <div className="detail-row">
                        <span className="detail-label">Parent Contact:</span>
                        <span className="detail-value">
                          {student.ParentContact}
                        </span>
                      </div>
                    )}
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

      <Footer />
    </div>
  );
};

export default StudentSearch;