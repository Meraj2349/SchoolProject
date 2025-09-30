// components/TeachersPage.js
import React, { useState, useEffect } from 'react';
import teacherApi from '../../api/teacherApi';
import '../../assets/styles/listcss/teacherslist.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LatestUpdatesNotice from './LatestUpdatesNotice';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'name', 'subject', 'email'

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, filterBy]);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherApi.getAllTeachers();
      setTeachers(data);
    } catch (err) {
      setError('Failed to fetch teachers: ' + (err.error || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    if (!searchTerm.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    const filtered = teachers.filter(teacher => {
      const fullName = `${teacher.FirstName} ${teacher.LastName}`.toLowerCase();
      const subject = teacher.Subject.toLowerCase();
      const email = teacher.Email.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      switch (filterBy) {
        case 'name':
          return fullName.includes(searchLower);
        case 'subject':
          return subject.includes(searchLower);
        case 'email':
          return email.includes(searchLower);
        default:
          return fullName.includes(searchLower) || 
                 subject.includes(searchLower) || 
                 email.includes(searchLower);
      }
    });

    setFilteredTeachers(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterBy(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilterBy('all');
  };

  // Generate avatar based on teacher's name
  const generateAvatar = (firstName, lastName) => {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const colorIndex = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
    return { initials, color: colors[colorIndex] };
  };

  if (loading) {
    return (
      <div className="teachers-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading teachers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teachers-page">
        <div className="error-container">
          <p className="error">{error}</p>
          <button onClick={fetchTeachers} className="btn-retry">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="teachers-page">
      <Navbar />
      <LatestUpdatesNotice />
      <div className="page-header">
        <h1>Our Teachers</h1>
        <p className="page-subtitle">Meet our dedicated teaching staff</p>
      </div>

      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select value={filterBy} onChange={handleFilterChange} className="filter-select">
            <option value="all">All Fields</option>
            <option value="name">Name</option>
            <option value="subject">Subject</option>
            <option value="email">Email</option>
          </select>

          {searchTerm && (
            <button onClick={clearSearch} className="clear-search">
              Clear
            </button>
          )}
        </div>

        <div className="search-results">
          <span className="results-count">
            {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No teachers found</h3>
          <p>Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className="teachers-grid">
          {filteredTeachers.map(teacher => {
            const avatar = generateAvatar(teacher.FirstName, teacher.LastName);
            return (
              <div key={teacher.TeacherID} className="teacher-card">
                <div className="card-header">
                  <div 
                    className="teacher-avatar"
                    style={{ backgroundColor: avatar.color }}
                  >
                    {avatar.initials}
                  </div>
                  <div className="teacher-status">
                    <span className="status-dot"></span>
                    Active
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="teacher-name">
                    {teacher.FirstName} {teacher.LastName}
                  </h3>
                  
                  <div className="teacher-info">
                    <div className="info-item">
                      <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="subject">{teacher.Subject}</span>
                    </div>
                    
                    <div className="info-item">
                      <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="email">{teacher.Email}</span>
                    </div>

                    <div className="info-item">
                      <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="contact">{teacher.ContactNumber}</span>
                    </div>
                  </div>

                  <div className="card-footer">
                    <div className="joining-date">
                      <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Joined: {new Date(teacher.JoiningDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default TeachersPage;