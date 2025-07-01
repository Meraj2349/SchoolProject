// api/attendanceApi.js
const API_BASE_URL = 'http://localhost:3000/api/attendance';

const attendanceAPI = {
  // Get all attendance records
  getAllAttendance: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch attendance records: ' + error.message);
    }
  },

  // Create new attendance record
  createAttendance: async (attendanceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to create attendance record: ' + error.message);
    }
  },

  // Get attendance by ID
  getAttendanceById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch attendance record: ' + error.message);
    }
  },

  // Update attendance record
  updateAttendance: async (id, attendanceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to update attendance record: ' + error.message);
    }
  },

  // Delete attendance record
  deleteAttendance: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to delete attendance record: ' + error.message);
    }
  },

  // Get attendance by student ID
  getAttendanceByStudentId: async (studentID) => {
    try {
      const response = await fetch(`${API_BASE_URL}/student/${studentID}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch student attendance: ' + error.message);
    }
  },

  // Get attendance by class ID
  getAttendanceByClassId: async (classID) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${classID}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch class attendance: ' + error.message);
    }
  },

  // Get attendance by date
  getAttendanceByDate: async (date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/date/${date}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch attendance by date: ' + error.message);
    }
  },

  // Get attendance summary by student
  getAttendanceSummaryByStudent: async (studentID) => {
    try {
      const response = await fetch(`${API_BASE_URL}/summary/student/${studentID}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch attendance summary: ' + error.message);
    }
  },

  // Get class attendance summary by class and date
  getClassAttendanceSummary: async (classID, date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/summary/class/${classID}/date/${date}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch class attendance summary: ' + error.message);
    }
  },

  // Get attendance by name, roll, class, section
  getAttendanceByNameRollClassSection: async (firstName, roll, className, section) => {
    try {
      const response = await fetch(`${API_BASE_URL}/name/${firstName}/roll/${roll}/class/${className}/section/${section}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch attendance by student details: ' + error.message);
    }
  },

  // Get attendance by class and section
  getAttendanceByClassAndSection: async (className, section) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${className}/section/${section}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch attendance by class and section: ' + error.message);
    }
  },
};

export default attendanceAPI;
