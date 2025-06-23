import React, { useState, useEffect } from "react";
import studentAPI from "../../api/studentApi"; // Adjust the import path as needed
import "../../assets/styles/StudentListpage.css";

const StudentListPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    roll: "",
    className: "",
    section: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch all students and student count on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all students and total count
        const [studentsResponse, countResponse] = await Promise.all([
          getAllStudents(),
          getStudentCount(),
        ]);

        // Handle different response structures
        const studentsData = Array.isArray(studentsResponse.data)
          ? studentsResponse.data
          : Array.isArray(studentsResponse.data?.students)
          ? studentsResponse.data.students
          : [];

        const countData = countResponse.data;

        setStudents(studentsData);
        setFilteredStudents(studentsData);
        setTotalCount(
          countData?.count || countData?.total || studentsData.length
        );
      } catch (error) {
        console.error("Error loading initial data:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load students"
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    const performSearch = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if any search filter is active
        const hasActiveFilters = Object.values(searchFilters).some(
          (value) => value.trim() !== ""
        );

        if (!hasActiveFilters) {
          // No filters, show all students
          setFilteredStudents(students);
          setLoading(false);
          return;
        }

        // Try API search first, fall back to client-side if it fails
        try {
          // Prepare filters for API (only send non-empty values)
          const apiFilters = {};
          Object.entries(searchFilters).forEach(([key, value]) => {
            if (value.trim()) {
              apiFilters[key] = value.trim();
            }
          });

          const results = await studentAPI.searchStudents(apiFilters);
          const searchResults = Array.isArray(results)
            ? results
            : Array.isArray(results?.students)
            ? results.students
            : [];

          setFilteredStudents(searchResults);
        } catch (apiError) {
          console.log(
            "API search failed, falling back to client-side search:",
            apiError
          );
          // Fallback to client-side filtering
          performClientSideFilter();
        }
      } catch (error) {
        console.error("Error performing search:", error);
        setError(
          error.response?.data?.message || error.message || "Search failed"
        );
        // Still try client-side filtering as last resort
        performClientSideFilter();
      } finally {
        setLoading(false);
      }
    };

    // Use specialized API endpoints for better performance
    const performOptimizedSearch = async () => {
      const { class: className, section } = searchFilters;
      const hasNameOrRoll =
        searchFilters.name.trim() || searchFilters.roll.trim();

      try {
        if (searchFilters.className && searchFilters.section && !hasNameOrRoll) {
          // Use class and section specific endpoint
          const response = await getStudentsByClassAndSection(
            searchFilters.className,
            searchFilters.section
          );
          const results = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.students)
            ? response.data.students
            : [];
          setFilteredStudents(results);
        } else if (searchFilters.className && !searchFilters.section && !hasNameOrRoll) {
          // Use class specific endpoint
          const response = await getStudentsByClass(searchFilters.className);
          const results = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.students)
            ? response.data.students
            : [];
          setFilteredStudents(results);
        } else {
          // Use general search or client-side filtering
          await performSearch();
        }
      } catch (error) {
        console.log("Optimized search failed, trying general search");
        await performSearch();
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      performOptimizedSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchFilters, students]);

  // Client-side filtering as fallback
  const performClientSideFilter = () => {
    let filtered = Array.isArray(students) ? [...students] : [];

    // Filter by name
    if (searchFilters.name.trim()) {
      filtered = filtered.filter((student) =>
        student.name?.toLowerCase().includes(searchFilters.name.toLowerCase())
      );
    }

    // Filter by roll
    if (searchFilters.roll.trim()) {
      filtered = filtered.filter((student) =>
        student.roll
          ?.toString()
          .toLowerCase()
          .includes(searchFilters.roll.toLowerCase())
      );
    }

    // Filter by class
    if (searchFilters.className.trim()) {
      filtered = filtered.filter(
        (student) =>
          student.class?.toString().toLowerCase() ===
          searchFilters.className.toLowerCase()
      );
    }

    // Filter by section
    if (searchFilters.section.trim()) {
      filtered = filtered.filter(
        (student) =>
          student.section?.toString().toLowerCase() ===
          searchFilters.section.toLowerCase()
      );
    }

    setFilteredStudents(filtered);
  };

  // Get unique classes and sections for filter dropdowns
  const uniqueClasses = Array.isArray(students)
    ? [
        ...new Set(students.map((student) => student.class).filter(Boolean)),
      ].sort()
    : [];
  const uniqueSections = Array.isArray(students)
    ? [
        ...new Set(students.map((student) => student.section).filter(Boolean)),
      ].sort()
    : [];

  const handleInputChange = (field, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      name: "",
      roll: "",
      className: "",
      section: "",
    });
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllStudents();
      const studentsData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.students)
        ? response.data.students
        : [];
      setStudents(studentsData);
      setFilteredStudents(studentsData);

      // Also refresh count
      const countResponse = await getStudentCount();
      setTotalCount(
        countResponse.data?.count ||
          countResponse.data?.total ||
          studentsData.length
      );
    } catch (error) {
      console.error("Error refreshing data:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to refresh data"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="student-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="student-list-container">
        <div className="error-message">
          <h3>Error Loading Students</h3>
          <p>{error}</p>
          <button onClick={refreshData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-list-container">
      <div className="header">
        <h1>Student List</h1>
        <p>Total Students: {totalCount}</p>
      </div>

      <div className="search-filters">
        <div className="search-grid">
          <div className="search-field">
            <label htmlFor="name-search">Student Name</label>
            <input
              id="name-search"
              type="text"
              placeholder="Search by name..."
              value={searchFilters.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="search-input"
            />
          </div>

          <div className="search-field">
            <label htmlFor="roll-search">Roll Number</label>
            <input
              id="roll-search"
              type="text"
              placeholder="Search by roll..."
              value={searchFilters.roll}
              onChange={(e) => handleInputChange("roll", e.target.value)}
              className="search-input"
            />
          </div>

          <div className="search-field">
            <label htmlFor="class-search">Class</label>
            <select
              id="class-search"
              value={searchFilters.className}
              onChange={(e) => handleInputChange("className", e.target.value)}
              className="filter-select"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field">
            <label htmlFor="section-search">Section</label>
            <select
              id="section-search"
              value={searchFilters.section}
              onChange={(e) => handleInputChange("section", e.target.value)}
              className="filter-select"
            >
              <option value="">All Sections</option>
              {uniqueSections.map((section) => (
                <option key={section} value={section}>
                  Section {section}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
          <button onClick={refreshData} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="results-info">
        <p>
          Showing{" "}
          {Array.isArray(filteredStudents) ? filteredStudents.length : 0} of{" "}
          {Array.isArray(students) ? students.length : 0} students
          {loading && <span className="loading-text"> (Loading...)</span>}
        </p>
      </div>

      <div className="students-grid">
        {!Array.isArray(filteredStudents) || filteredStudents.length === 0 ? (
          <div className="no-results">
            <p>No students found matching your criteria.</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id || student._id} className="student-card">
              <div className="student-info">
                <h3 className="student-name">{student.name || "N/A"}</h3>
                <div className="student-details">
                  <span className="detail-item">
                    <strong>Roll:</strong> {student.roll || "N/A"}
                  </span>
                  <span className="detail-item">
                    <strong>Class:</strong> {student.class || "N/A"}
                  </span>
                  <span className="detail-item">
                    <strong>Section:</strong> {student.section || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentListPage;
