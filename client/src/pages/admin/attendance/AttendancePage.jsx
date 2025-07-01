import { useEffect, useState } from 'react';
import attendanceAPI from '../../../api/attendanceApi';
import Sidebar from '../../../components/Sidebar';
import './AttendancePage.css';

const AttendancePage = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    studentID: '',
    classID: '',
    classDate: '',
    status: 'Present'
  });

  // Filters
  const [filters, setFilters] = useState({
    studentID: '',
    classID: '',
    date: '',
    status: ''
  });

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAllAttendance();
      if (response.success) {
        setAttendanceRecords(response.data);
      } else {
        setError('Failed to fetch attendance records');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        const response = await attendanceAPI.updateAttendance(editingRecord.AttendanceID, formData);
        if (response.success) {
          alert('Attendance record updated successfully!');
          fetchAttendanceRecords();
        }
      } else {
        const response = await attendanceAPI.createAttendance(formData);
        if (response.success) {
          alert('Attendance record created successfully!');
          fetchAttendanceRecords();
        }
      }
      resetForm();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      studentID: record.StudentID,
      classID: record.ClassID,
      classDate: record.ClassDate.split('T')[0], // Format date for input
      status: record.Status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        const response = await attendanceAPI.deleteAttendance(id);
        if (response.success) {
          alert('Attendance record deleted successfully!');
          fetchAttendanceRecords();
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      studentID: '',
      classID: '',
      classDate: '',
      status: 'Present'
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const filteredRecords = attendanceRecords.filter(record => {
    return (
      (filters.studentID === '' || record.StudentID?.toString().includes(filters.studentID)) &&
      (filters.classID === '' || record.ClassID?.toString().includes(filters.classID)) &&
      (filters.date === '' || record.ClassDate?.includes(filters.date)) &&
      (filters.status === '' || record.Status === filters.status)
    );
  });

  if (loading) {
    return <div className="loading">Loading attendance records...</div>;
  }

  return (
    <div className="attendance-page">
      <Sidebar />
      <div className="attendance-container">
        <div className="page-header">
          <h1>Attendance Management</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add New Record'}
          </button>
        </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-container">
          <h2>{editingRecord ? 'Edit Attendance Record' : 'Add New Attendance Record'}</h2>
          <form onSubmit={handleSubmit} className="attendance-form">
            <div className="form-group">
              <label>Student ID:</label>
              <input
                type="number"
                value={formData.studentID}
                onChange={(e) => setFormData({...formData, studentID: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Class ID:</label>
              <input
                type="number"
                value={formData.classID}
                onChange={(e) => setFormData({...formData, classID: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={formData.classDate}
                onChange={(e) => setFormData({...formData, classDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingRecord ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-container">
        <h3>Filters</h3>
        <div className="filters">
          <input
            type="text"
            name="studentID"
            placeholder="Student ID"
            value={filters.studentID}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="classID"
            placeholder="Class ID"
            value={filters.classID}
            onChange={handleFilterChange}
          />
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          />
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          <button 
            className="btn btn-secondary"
            onClick={() => setFilters({studentID: '', classID: '', date: '', status: ''})}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="table-container">
        <h3>Attendance Records ({filteredRecords.length})</h3>
        {filteredRecords.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Class</th>
                <th>Section</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.AttendanceID}>
                  <td>{record.AttendanceID}</td>
                  <td>{`${record.FirstName || ''} ${record.LastName || ''}`}</td>
                  <td>{record.RollNumber}</td>
                  <td>{record.ClassName}</td>
                  <td>{record.Section}</td>
                  <td>{new Date(record.ClassDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status ${record.Status.toLowerCase()}`}>
                      {record.Status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-edit"
                      onClick={() => handleEdit(record)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-delete"
                      onClick={() => handleDelete(record.AttendanceID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </div>
  );
};

export default AttendancePage;
