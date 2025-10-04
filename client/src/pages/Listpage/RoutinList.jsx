import { Calendar, Clock, Download, Filter, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
    formatRoutineDate,
    getAllRoutines,
    getFilterOptions,
    getRoutinesByClassSection,
    isImage,
    isPDF,
    searchRoutines
} from "../../api/routineApi";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import LatestUpdatesNotice from "./LatestUpdatesNotice";
import "./RoutinList.css";

const RoutinList = () => {
  // State management
  const [routines, setRoutines] = useState([]);
  const [filteredRoutines, setFilteredRoutines] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ classes: [], sections: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const routinesPerPage = 12;

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [routinesResponse, filtersResponse] = await Promise.all([
        getAllRoutines(),
        getFilterOptions()
      ]);

      if (routinesResponse.routines) {
        // Sort routines by date (newest first)
        const sortedRoutines = routinesResponse.routines.sort(
          (a, b) => new Date(b.RoutineDate) - new Date(a.RoutineDate)
        );
        setRoutines(sortedRoutines);
        setFilteredRoutines(sortedRoutines);
      }

      if (filtersResponse.options) {
        setFilterOptions(filtersResponse.options);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load routines. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filtering
  useEffect(() => {
    applyFilters();
  }, [selectedClass, selectedSection, searchTerm, routines]);

  const applyFilters = async () => {
    try {
      let filtered = [...routines];

      // Apply class and section filters
      if (selectedClass || selectedSection) {
        const filterResponse = await getRoutinesByClassSection(selectedClass, selectedSection);
        filtered = filterResponse.routines || [];
      }

      // Apply search filter
      if (searchTerm.trim()) {
        if (selectedClass || selectedSection) {
          // Filter the already filtered results
          filtered = filtered.filter(routine =>
            routine.RoutineTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            routine.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            routine.ClassName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            routine.Section?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        } else {
          // Search all routines
          const searchResponse = await searchRoutines(searchTerm);
          filtered = searchResponse.routines || [];
        }
      }

      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.RoutineDate) - new Date(a.RoutineDate));

      setFilteredRoutines(filtered);
      setCurrentPage(1); // Reset to first page when filtering
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedClass("");
    setSelectedSection("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Get current routines for pagination
  const indexOfLastRoutine = currentPage * routinesPerPage;
  const indexOfFirstRoutine = indexOfLastRoutine - routinesPerPage;
  const currentRoutines = filteredRoutines.slice(indexOfFirstRoutine, indexOfLastRoutine);
  const totalPages = Math.ceil(filteredRoutines.length / routinesPerPage);

  // Pagination handlers
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get file type icon
  const getFileIcon = (routine) => {
    if (!routine.FileURL) return null;
    
    if (isPDF(routine.FileType, routine.FileURL)) {
      return (
        <div className="file-type-badge pdf">
          <span>PDF</span>
        </div>
      );
    } else if (isImage(routine.FileType, routine.FileURL)) {
      return (
        <div className="file-type-badge image">
          <span>IMG</span>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="routine-list-page">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading routines...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="routine-list-page">
      <Navbar />

      {/* Latest Updates Notice */}
      <LatestUpdatesNotice />
      
      {/* Hero Section */}
      <section className="routine-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              <Calendar className="hero-icon" />
              School Routines
            </h1>
          
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-dots"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="routine-content">
        <div className="routine-container">
          
          {/* Search and Filter Section */}
          <div className="filter-section">
            <div className="search-container">
              <div className="search-box">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search routines by title, description, or class..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <button 
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="filter-icon" />
                Filters
              </button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="filter-controls">
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Class</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Classes</option>
                      {filterOptions.classes.map((className, index) => (
                        <option key={index} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Section</label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Sections</option>
                      {filterOptions.sections.map((section, index) => (
                        <option key={index} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button 
                    onClick={clearFilters}
                    className="clear-filters-btn"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {(selectedClass || selectedSection || searchTerm) && (
              <div className="active-filters">
                <span className="filter-label">Active Filters:</span>
                {selectedClass && (
                  <span className="filter-tag">
                    Class: {selectedClass}
                    <button onClick={() => setSelectedClass("")}>×</button>
                  </span>
                )}
                {selectedSection && (
                  <span className="filter-tag">
                    Section: {selectedSection}
                    <button onClick={() => setSelectedSection("")}>×</button>
                  </span>
                )}
                {searchTerm && (
                  <span className="filter-tag">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm("")}>×</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="results-header">
            <h2>
              {filteredRoutines.length === 0 && !loading ? 'No Routines Found' :
               `${filteredRoutines.length} Routine${filteredRoutines.length !== 1 ? 's' : ''} Found`}
            </h2>
            {filteredRoutines.length > 0 && (
              <p>
                Showing {indexOfFirstRoutine + 1}-{Math.min(indexOfLastRoutine, filteredRoutines.length)} of {filteredRoutines.length} results
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadData} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          {/* Routines Grid */}
          {filteredRoutines.length > 0 ? (
            <>
              <div className="routines-grid">
                {currentRoutines.map((routine) => (
                  <div key={routine.RoutineID} className="routine-card">
                    <div className="routine-card-header">
                      <div className="routine-card-title">
                        <h3>{routine.RoutineTitle}</h3>
                        {getFileIcon(routine)}
                      </div>
                      <div className="routine-card-class">
                        <Users className="class-icon" />
                        <span>{routine.ClassName} - {routine.Section}</span>
                      </div>
                    </div>

                    <div className="routine-card-content">
                      <div className="routine-date">
                        <Calendar className="date-icon" />
                        <span>{formatRoutineDate(routine.RoutineDate)}</span>
                      </div>

                      {routine.Description && (
                        <div className="routine-description">
                          <p>{routine.Description}</p>
                        </div>
                      )}

                      {routine.FileURL && (
                        <div className="routine-file">
                          <a
                            href={routine.FileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-link"
                          >
                            <Download className="download-icon" />
                            <span>
                              View {routine.FileType === 'pdf' ? 'PDF' : 'Image'}
                            </span>
                          </a>
                        </div>
                      )}

                      <div className="routine-card-footer">
                        <div className="created-date">
                          <Clock className="time-icon" />
                          <span>Added: {formatRoutineDate(routine.CreatedDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn prev"
                  >
                    Previous
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="pagination-ellipsis">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn next"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            !loading && !error && (
              <div className="no-routines">
                <Calendar className="no-routines-icon" />
                <h3>No Routines Found</h3>
                <p>
                  {selectedClass || selectedSection || searchTerm
                    ? 'Try adjusting your filters or search terms.'
                    : 'No routines have been published yet. Please check back later.'}
                </p>
                {(selectedClass || selectedSection || searchTerm) && (
                  <button onClick={clearFilters} className="clear-btn">
                    Clear All Filters
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoutinList;
