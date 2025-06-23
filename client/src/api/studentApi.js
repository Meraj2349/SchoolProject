// api/studentAPI.js
const API_BASE_URL = 'http://localhost:3000/api/students'; // Adjust this to your backend URL

const studentAPI = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch students: ' + error.message);
    }
  },

  // Add new student
  addStudent: async (studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to add student: ' + error.message);
    }
  },

  // Get student by ID
  getStudentById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch student: ' + error.message);
    }
  },

  // Update student
  updateStudent: async (id, studentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to update student: ' + error.message);
    }
  },

  // Delete student
  deleteStudent: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to delete student: ' + error.message);
    }
  },

  // Search students
  searchStudents: async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      const response = await fetch(`${API_BASE_URL}/search?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to search students: ' + error.message);
    }
  },

  // Get student count
  getStudentCount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/count`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch student count: ' + error.message);
    }
  },

  // Get students by class
  getStudentsByClass: async (className) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${className}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch students by class: ' + error.message);
    }
  },

  // Get students by class and section
  getStudentsByClassAndSection: async (className, section) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${className}/section/${section}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch students by class and section: ' + error.message);
    }
  },

  // Check roll number
  checkRollNumber: async (rollNumber, className, section, excludeStudentID = null) => {
    try {
      const params = new URLSearchParams({
        rollNumber,
        className,
        section,
      });
      if (excludeStudentID) params.append('excludeStudentID', excludeStudentID);
      
      const response = await fetch(`${API_BASE_URL}/check-roll?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to check roll number: ' + error.message);
    }
  },
};

export default studentAPI;