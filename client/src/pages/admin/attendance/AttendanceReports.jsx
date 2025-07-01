import { useState } from 'react';
import attendanceAPI from '../../../api/attendanceApi';
import Sidebar from '../../../components/Sidebar';
import './AttendanceReports.css';

const AttendanceReports = () => {
  const [reportType, setReportType] = useState('student');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data for different report types
  const [filters, setFilters] = useState({
    studentID: '',
    classID: '',
    date: '',
    firstName: '',
    roll: '',
    className: '',
    section: ''
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    setReportData([]);

    try {
      let response;
      
      switch (reportType) {
        case 'student':
          if (!filters.studentID) {
            setError('Please enter Student ID');
            return;
          }
          response = await attendanceAPI.getAttendanceByStudentId(filters.studentID);
          break;
          
        case 'class':
          if (!filters.classID) {
            setError('Please enter Class ID');
            return;
          }
          response = await attendanceAPI.getAttendanceByClassId(filters.classID);
          break;
          
        case 'date':
          if (!filters.date) {
            setError('Please select a date');
            return;
          }
          response = await attendanceAPI.getAttendanceByDate(filters.date);
          break;
          
        case 'studentSummary':
          if (!filters.studentID) {
            setError('Please enter Student ID');
            return;
          }
          response = await attendanceAPI.getAttendanceSummaryByStudent(filters.studentID);
          break;
          
        case 'classSummary':
          if (!filters.classID || !filters.date) {
            setError('Please enter Class ID and Date');
            return;
          }
          response = await attendanceAPI.getClassAttendanceSummary(filters.classID, filters.date);
          break;
          
        case 'nameRollClass':
          if (!filters.firstName || !filters.roll || !filters.className || !filters.section) {
            setError('Please fill all fields (Name, Roll, Class, Section)');
            return;
          }
          response = await attendanceAPI.getAttendanceByNameRollClassSection(
            filters.firstName, filters.roll, filters.className, filters.section
          );
          break;
          
        case 'classSection':
          if (!filters.className || !filters.section) {
            setError('Please enter Class Name and Section');
            return;
          }
          response = await attendanceAPI.getAttendanceByClassAndSection(filters.className, filters.section);
          break;
          
        default:
          setError('Invalid report type');
          return;
      }

      if (response.success) {
        setReportData(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setError('Failed to generate report');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFilters({
      studentID: '',
      classID: '',
      date: '',
      firstName: '',
      roll: '',
      className: '',
      section: ''
    });
    setReportData([]);
    setError('');
  };

  const renderReportForm = () => {
    switch (reportType) {
      case 'student':
        return (
          <div className="form-group">
            <label>Student ID:</label>
            <input
              type="number"
              name="studentID"
              value={filters.studentID}
              onChange={handleFilterChange}
              placeholder="Enter Student ID"
            />
          </div>
        );
        
      case 'class':
        return (
          <div className="form-group">
            <label>Class ID:</label>
            <input
              type="number"
              name="classID"
              value={filters.classID}
              onChange={handleFilterChange}
              placeholder="Enter Class ID"
            />
          </div>
        );
        
      case 'date':
        return (
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
        );
        
      case 'studentSummary':
        return (
          <div className="form-group">
            <label>Student ID:</label>
            <input
              type="number"
              name="studentID"
              value={filters.studentID}
              onChange={handleFilterChange}
              placeholder="Enter Student ID for Summary"
            />
          </div>
        );
        
      case 'classSummary':
        return (
          <div className="form-row">
            <div className="form-group">
              <label>Class ID:</label>
              <input
                type="number"
                name="classID"
                value={filters.classID}
                onChange={handleFilterChange}
                placeholder="Enter Class ID"
              />
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        );
        
      case 'nameRollClass':
        return (
          <div className="form-row">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={filters.firstName}
                onChange={handleFilterChange}
                placeholder="Enter First Name"
              />
            </div>
            <div className="form-group">
              <label>Roll Number:</label>
              <input
                type="text"
                name="roll"
                value={filters.roll}
                onChange={handleFilterChange}
                placeholder="Enter Roll Number"
              />
            </div>
            <div className="form-group">
              <label>Class Name:</label>
              <input
                type="text"
                name="className"
                value={filters.className}
                onChange={handleFilterChange}
                placeholder="Enter Class Name"
              />
            </div>
            <div className="form-group">
              <label>Section:</label>
              <input
                type="text"
                name="section"
                value={filters.section}
                onChange={handleFilterChange}
                placeholder="Enter Section"
              />
            </div>
          </div>
        );
        
      case 'classSection':
        return (
          <div className="form-row">
            <div className="form-group">
              <label>Class Name:</label>
              <input
                type="text"
                name="className"
                value={filters.className}
                onChange={handleFilterChange}
                placeholder="Enter Class Name"
              />
            </div>
            <div className="form-group">
              <label>Section:</label>
              <input
                type="text"
                name="section"
                value={filters.section}
                onChange={handleFilterChange}
                placeholder="Enter Section"
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="attendance-reports">
      <Sidebar />
      <div className="reports-container">
        <h1>Attendance Reports</h1>
      <div className="report-controls">
        <div className="report-type-selector">
          <label>Report Type:</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="student">Student Attendance</option>
            <option value="class">Class Attendance</option>
            <option value="date">Daily Attendance</option>
            <option value="studentSummary">Student Summary</option>
            <option value="classSummary">Class Summary</option>
            <option value="nameRollClass">Search by Name & Roll</option>
            <option value="classSection">Class & Section</option>
          </select>
        </div>
        
        <div className="report-filters">
          {renderReportForm()}
        </div>
        
        <div className="report-actions">
          <button 
            className="btn btn-primary" 
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={clearForm}
          >
            Clear
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {reportData.length > 0 && (
        <div className="report-results">
          <h3>Report Results ({reportData.length} records)</h3>
          <div className="table-responsive">
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((record, index) => (
                  <tr key={record.AttendanceID || index}>
                    <td>{record.AttendanceID || 'N/A'}</td>
                    <td>
                      {record.FirstName && record.LastName 
                        ? `${record.FirstName} ${record.LastName}`
                        : record.StudentID || 'N/A'
                      }
                      {record.RollNumber && <span className="roll"> (Roll: {record.RollNumber})</span>}
                    </td>
                    <td>
                      {record.ClassName || record.ClassID} 
                      {record.Section && ` - ${record.Section}`}
                    </td>
                    <td>{record.ClassDate ? new Date(record.ClassDate).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`status ${record.Status?.toLowerCase() || ''}`}>
                        {record.Status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && reportData.length === 0 && filters.studentID && (
        <div className="no-results">
          <p>No attendance records found for the selected criteria.</p>
        </div>
      )}
      </div>
    </div>
  );
};

export default AttendanceReports;
