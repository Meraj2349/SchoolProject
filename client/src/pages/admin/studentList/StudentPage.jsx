import { useEffect, useState } from "react";
import studentAPI from "../../../api/studentApi";
import Sidebar from "../../../components/Sidebar";
import "./StudentPage.css";

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchFilters, setSearchFilters] = useState({
    FirstName: "",
    LastName: "",
    Class: "",
    Section: "",
    RollNumber: "",
  });
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    DateOfBirth: "",
    Gender: "Male",
    Class: "",
    Section: "",
    RollNumber: "",
    AdmissionDate: "",
    Address: "",
    ParentContact: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [sortBy, setSortBy] = useState('FirstName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [originalRollNumber, setOriginalRollNumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [quickFilter, setQuickFilter] = useState('all');

  // Statistics calculations
  const getStatistics = () => {
    const totalStudents = students.length;
    const filteredCount = filteredStudents.length;
    const uniqueClasses = [...new Set(students.map(s => s.ClassName || s.Class).filter(Boolean))];
    const uniqueSections = [...new Set(students.map(s => s.Section || s.SectionName).filter(Boolean))];
    
    return {
      totalStudents,
      filteredCount,
      totalClasses: uniqueClasses.length,
      totalSections: uniqueSections.length,
    };
  };

  // Auto-clear success and error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getAllStudents();
      if (response.success) {
        const studentsData = response.data || [];
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } else {
        throw new Error(response.message || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setError(error.message || "Failed to fetch students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await studentAPI.getAllClasses();
      if (response.success) {
        setClasses(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchStudentsByClassAndSection = async (className, section) => {
    setLoading(true);
    try {
      const response = await studentAPI.getStudentsByClassAndSection(className, section);
      if (response.success) {
        const studentsData = response.data || [];
        setFilteredStudents(studentsData);
      } else {
        throw new Error(response.message || "Failed to fetch students by class and section");
      }
    } catch (error) {
      console.error("Error fetching students by class and section:", error);
      setError(error.message || "Failed to fetch students by class and section. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormClassChange = (e) => {
    const className = e.target.value;
    setFormData({ 
      ...formData, 
      Class: className, 
      Section: '' // Reset section when class changes
    });
  };

  const validateForm = async () => {
    const requiredFields = [
      "FirstName",
      "LastName",
      "DateOfBirth",
      "Gender",
      "Class",
      "Section",
      "RollNumber",
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        setError(`The field "${field}" is required.`);
        return false;
      }
    }
    
    if (formData.ParentContact && !/^\d{10,15}$/.test(formData.ParentContact)) {
      setError("Parent contact must be 10-15 digits");
      return false;
    }
    
    const currentDate = new Date();
    const dobDate = new Date(formData.DateOfBirth);
    if (dobDate >= currentDate) {
      setError("Date of birth must be in the past");
      return false;
    }

    // Check for duplicate roll numbers (only for new students or when roll number changes)
    if (!editId || (editId && formData.RollNumber !== originalRollNumber)) {
      try {
        const duplicateCheck = await studentAPI.checkRollNumber(
          formData.RollNumber,
          formData.Class,
          formData.Section,
          editId
        );
        
        if (duplicateCheck.success && duplicateCheck.data.exists) {
          setError(`Roll number ${formData.RollNumber} already exists in Class ${formData.Class}, Section ${formData.Section}`);
          return false;
        }
      } catch (error) {
        console.warn("Duplicate check failed:", error);
        // Continue with form submission if duplicate check fails
      }
    }
    
    setError(null);
    return true;
  };

  const resetForm = () => {
    setFormData({
      FirstName: "",
      LastName: "",
      DateOfBirth: "",
      Gender: "Male",
      Class: "",
      Section: "",
      RollNumber: "",
      AdmissionDate: "",
      Address: "",
      ParentContact: "",
    });
    setEditId(null);
  };

  const handleAddStudent = async () => {
    if (!(await validateForm())) return;
    setLoading(true);
    try {
      const response = await studentAPI.addStudent({
        ...formData,
        DateOfBirth: formData.DateOfBirth.split("T")[0],
        AdmissionDate: formData.AdmissionDate ? formData.AdmissionDate.split("T")[0] : undefined,
      });
      
      if (response.success) {
        await fetchStudents();
        await fetchClasses(); // Refresh classes as well
        resetForm();
        setShowModal(false);
        setSuccess(response.message || "Student added successfully!");
      } else {
        throw new Error(response.message || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      setError(error.message || "Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditId(student.StudentID);
    setOriginalRollNumber(student.RollNumber || "");
    setFormData({
      FirstName: student.FirstName,
      LastName: student.LastName,
      DateOfBirth: student.DateOfBirth ? student.DateOfBirth.split("T")[0] : "",
      Gender: student.Gender,
      Class: student.ClassName || student.Class || "",
      Section: student.Section || student.SectionName || "",
      RollNumber: student.RollNumber || "",
      AdmissionDate: student.AdmissionDate ? student.AdmissionDate.split("T")[0] : "",
      Address: student.Address || "",
      ParentContact: student.ParentContact || "",
    });
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editId || !(await validateForm())) return;
    setLoading(true);
    try {
      const response = await studentAPI.updateStudent(editId, {
        ...formData,
        DateOfBirth: formData.DateOfBirth.split("T")[0],
        AdmissionDate: formData.AdmissionDate ? formData.AdmissionDate.split("T")[0] : undefined,
      });
      
      if (response.success) {
        await fetchStudents();
        await fetchClasses(); // Refresh classes as well
        resetForm();
        setShowModal(false);
        setSuccess(response.message || "Student updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      setError(error.message || "Failed to update student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentID) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    setLoading(true);
    try {
      const response = await studentAPI.deleteStudent(studentID);
      
      if (response.success) {
        fetchStudents();
        setSuccess(response.message || "Student deleted successfully!");
      } else {
        throw new Error(response.message || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      setError(error.message || "Failed to delete student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters({ ...searchFilters, [name]: value });
  };

  const handleSearch = async (customFilters = null) => {
    const filtersToUse = customFilters || searchFilters;
    
    const activeFilters = Object.entries(filtersToUse)
      .filter(([key, value]) => value && value.toString().trim() !== "")
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    if (Object.keys(activeFilters).length === 0) {
      setFilteredStudents(students);
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    try {
      const response = await studentAPI.searchStudents(activeFilters);
      if (response.success) {
        const searchResults = response.data || [];
        setFilteredStudents(searchResults);
        setCurrentPage(1);
        
        if (customFilters) {
          setSearchFilters({ ...searchFilters, ...customFilters });
        }
      } else {
        throw new Error(response.message || "Search failed");
      }
    } catch (error) {
      console.error("Error searching students:", error);
      setError(error.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchFilters({
      FirstName: "",
      LastName: "",
      Class: "",
      Section: "",
      RollNumber: "",
    });
    setFilteredStudents(students);
    setCurrentPage(1);
    setSelectedClass('');
    setSelectedSection('');
    setQuickFilter('all');
  };

  // Quick filter functionality
  const handleQuickFilter = (filter) => {
    setQuickFilter(filter);
    setCurrentPage(1);
    
    switch (filter) {
      case 'all':
        setFilteredStudents(students);
        break;
      case 'recent':
        const recentStudents = students.filter(student => {
          const admissionDate = new Date(student.AdmissionDate);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return admissionDate >= thirtyDaysAgo;
        });
        setFilteredStudents(recentStudents);
        break;
      case 'male':
        setFilteredStudents(students.filter(s => s.Gender === 'Male'));
        break;
      case 'female':
        setFilteredStudents(students.filter(s => s.Gender === 'Female'));
        break;
      default:
        setFilteredStudents(students);
    }
  };

  // Sorting functionality
  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    
    const sorted = [...filteredStudents].sort((a, b) => {
      let aValue = a[field] || '';
      let bValue = b[field] || '';
      
      if (field === 'DateOfBirth' || field === 'AdmissionDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (newOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredStudents(sorted);
  };

  // Class and section filter
  const getUniqueClasses = () => {
    return [...new Set(classes.map(c => c.ClassName).filter(Boolean))].sort();
  };

  const getUniqueSections = (className) => {
    return classes
      .filter(c => c.ClassName === className)
      .map(c => c.Section)
      .filter(Boolean)
      .sort();
  };

  const getFormSections = (className) => {
    if (!className) return [];
    return classes
      .filter(c => c.ClassName === className)
      .map(c => c.Section)
      .filter(Boolean)
      .sort();
  };

  const handleClassFilter = (className) => {
    setSelectedClass(className);
    setSelectedSection('');
    setCurrentPage(1);
    
    if (!className) {
      setFilteredStudents(students);
      return;
    }
    
    const filtered = students.filter(student => 
      (student.ClassName || student.Class) === className
    );
    setFilteredStudents(filtered);
  };

  const handleSectionFilter = (section) => {
    setSelectedSection(section);
    setCurrentPage(1);
    
    if (!selectedClass || !section) return;
    
    const filtered = students.filter(student => 
      (student.ClassName || student.Class) === selectedClass &&
      (student.Section || student.SectionName) === section
    );
    setFilteredStudents(filtered);
  };

  // Modal functions
  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setOriginalRollNumber('');
    resetForm();
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Pagination functions
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          Previous
        </button>
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    );
  };

  const statistics = getStatistics();

  return (
    <div className="student-page">
      <Sidebar />
      <div className="content">
        <div className="page-header">
          <h1 className="page-title">Student Management</h1>
          <button className="add-btn-primary" onClick={openAddModal}>
            <span className="icon">+</span>
            Add Student
          </button>
        </div>

        {/* Notifications */}
        {success && (
          <div className="notification success" onClick={() => setSuccess(null)}>
            <span className="icon">✓</span>
            {success}
          </div>
        )}
        {error && (
          <div className="notification error" onClick={() => setError(null)}>
            <span className="icon">⚠</span>
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{statistics.totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{statistics.totalClasses}</h3>
              <p>Classes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>{statistics.totalSections}</h3>
              <p>Sections</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-content">
              <h3>{statistics.filteredCount}</h3>
              <p>Filtered Results</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            Advanced Search
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Quick Filters */}
              <div className="quick-filters">
                <h3>Quick Filters</h3>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${quickFilter === 'all' ? 'active' : ''}`}
                    onClick={() => handleQuickFilter('all')}
                  >
                    All Students
                  </button>
                  <button
                    className={`filter-btn ${quickFilter === 'recent' ? 'active' : ''}`}
                    onClick={() => handleQuickFilter('recent')}
                  >
                    Recent Admissions
                  </button>
                  <button
                    className={`filter-btn ${quickFilter === 'male' ? 'active' : ''}`}
                    onClick={() => handleQuickFilter('male')}
                  >
                    Male
                  </button>
                  <button
                    className={`filter-btn ${quickFilter === 'female' ? 'active' : ''}`}
                    onClick={() => handleQuickFilter('female')}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Class/Section Filters */}
              <div className="class-section-filters">
                <div className="filter-group">
                  <label>Filter by Class:</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassFilter(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {getUniqueClasses().map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Filter by Section:</label>
                  <select
                    value={selectedSection}
                    onChange={(e) => handleSectionFilter(e.target.value)}
                    disabled={!selectedClass}
                  >
                    <option value="">All Sections</option>
                    {selectedClass && getUniqueSections(selectedClass).map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
                <button className="clear-filters-btn" onClick={handleClearSearch}>
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="search-tab">
              <div className="search-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="searchFirstName">First Name</label>
                    <input
                      id="searchFirstName"
                      name="FirstName"
                      type="text"
                      placeholder="Enter first name"
                      value={searchFilters.FirstName}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="searchLastName">Last Name</label>
                    <input
                      id="searchLastName"
                      name="LastName"
                      type="text"
                      placeholder="Enter last name"
                      value={searchFilters.LastName}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="searchClass">Class</label>
                    <input
                      id="searchClass"
                      name="Class"
                      type="text"
                      placeholder="Enter class"
                      value={searchFilters.Class}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="searchSection">Section</label>
                    <input
                      id="searchSection"
                      name="Section"
                      type="text"
                      placeholder="Enter section"
                      value={searchFilters.Section}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="searchRollNumber">Roll Number</label>
                    <input
                      id="searchRollNumber"
                      name="RollNumber"
                      type="text"
                      placeholder="Enter roll number"
                      value={searchFilters.RollNumber}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div className="search-actions">
                  <button className="search-btn" onClick={() => handleSearch()} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </button>
                  <button className="clear-btn" onClick={handleClearSearch}>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="table-container">
          <div className="table-header">
            <h2>Students ({filteredStudents.length})</h2>
            <div className="table-controls">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                  handleSort(field);
                }}
              >
                <option value="FirstName-asc">Name (A-Z)</option>
                <option value="FirstName-desc">Name (Z-A)</option>
                <option value="Class-asc">Class (A-Z)</option>
                <option value="Class-desc">Class (Z-A)</option>
                <option value="RollNumber-asc">Roll No. (Low-High)</option>
                <option value="RollNumber-desc">Roll No. (High-Low)</option>
                <option value="DateOfBirth-asc">Age (Oldest)</option>
                <option value="DateOfBirth-desc">Age (Youngest)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No students found</h3>
              <p>Try adjusting your search filters or add a new student.</p>
              <button className="add-btn-secondary" onClick={openAddModal}>
                Add First Student
              </button>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('RollNumber')}>
                        Roll No. {sortBy === 'RollNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('FirstName')}>
                        Name {sortBy === 'FirstName' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('Class')}>
                        Class {sortBy === 'Class' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('Section')}>
                        Section {sortBy === 'Section' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('Gender')}>
                        Gender {sortBy === 'Gender' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th onClick={() => handleSort('DateOfBirth')}>
                        Age {sortBy === 'DateOfBirth' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Contact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((student) => (
                      <tr key={student.StudentID}>
                        <td>{student.RollNumber || '-'}</td>
                        <td>
                          <div className="student-name">
                            <strong>{student.FirstName} {student.LastName}</strong>
                          </div>
                        </td>
                        <td>{student.ClassName || student.Class || '-'}</td>
                        <td>{student.Section || student.SectionName || '-'}</td>
                        <td>
                          <span className={`gender-badge ${student.Gender?.toLowerCase()}`}>
                            {student.Gender}
                          </span>
                        </td>
                        <td>
                          {student.DateOfBirth ? 
                            Math.floor((new Date() - new Date(student.DateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) + ' years'
                            : '-'
                          }
                        </td>
                        <td>{student.ParentContact || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() => handleEditStudent(student)}
                              disabled={loading}
                              title="Edit student"
                            >
                              ✏️
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteStudent(student.StudentID)}
                              disabled={loading}
                              title="Delete student"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {renderPagination()}
            </>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editId ? 'Edit Student' : 'Add New Student'}</h2>
                <button className="modal-close" onClick={closeModal}>×</button>
              </div>
              <div className="modal-body">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="form-section">
                    <h3>Personal Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="FirstName">First Name*</label>
                        <input
                          id="FirstName"
                          name="FirstName"
                          type="text"
                          placeholder="Enter first name"
                          value={formData.FirstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="LastName">Last Name*</label>
                        <input
                          id="LastName"
                          name="LastName"
                          type="text"
                          placeholder="Enter last name"
                          value={formData.LastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="DateOfBirth">Date of Birth*</label>
                        <input
                          id="DateOfBirth"
                          name="DateOfBirth"
                          type="date"
                          value={formData.DateOfBirth}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="Gender">Gender*</label>
                        <select
                          id="Gender"
                          name="Gender"
                          value={formData.Gender}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Academic Information</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="Class">Class*</label>
                        <select
                          id="Class"
                          name="Class"
                          value={formData.Class}
                          onChange={handleFormClassChange}
                          required
                        >
                          <option value="">Select Class</option>
                          {getUniqueClasses().map(className => (
                            <option key={className} value={className}>{className}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="Section">Section*</label>
                        <select
                          id="Section"
                          name="Section"
                          value={formData.Section}
                          onChange={handleInputChange}
                          required
                          disabled={!formData.Class}
                        >
                          <option value="">Select Section</option>
                          {formData.Class && getFormSections(formData.Class).map(section => (
                            <option key={section} value={section}>{section}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="RollNumber">Roll Number*</label>
                        <input
                          id="RollNumber"
                          name="RollNumber"
                          type="text"
                          placeholder="Enter roll number"
                          value={formData.RollNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="AdmissionDate">Admission Date</label>
                        <input
                          id="AdmissionDate"
                          name="AdmissionDate"
                          type="date"
                          value={formData.AdmissionDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Contact Information</h3>
                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label htmlFor="Address">Address</label>
                        <textarea
                          id="Address"
                          name="Address"
                          placeholder="Enter address"
                          value={formData.Address}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="ParentContact">Parent Contact</label>
                        <input
                          id="ParentContact"
                          name="ParentContact"
                          type="tel"
                          placeholder="Enter parent contact (10-15 digits)"
                          value={formData.ParentContact}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className="save-btn"
                  onClick={editId ? handleSaveEdit : handleAddStudent}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : editId ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPage;