// api/studentAPI.js
const API_BASE_URL = 'http://localhost:3000/api/students'; // Adjust this to your backend URL

const studentAPI = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to delete student: ' + error.message);
    }
  },

  // Search students - MATCHES YOUR BACKEND ROUTE
  searchStudents: async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const response = await fetch(`${API_BASE_URL}/search/filter?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch student count: ' + error.message);
    }
  },

  // Get students by class
  getStudentsByClass: async (className) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${encodeURIComponent(className)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch students by class: ' + error.message);
    }
  },

  // Get students by class and section - FIXED TO MATCH YOUR ROUTE
  getStudentsByClassAndSection: async (className, sectionName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/class/${encodeURIComponent(className)}/section/${encodeURIComponent(sectionName)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch students by class and section: ' + error.message);
    }
  },

  // Get all classes
  getAllClasses: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to fetch classes: ' + error.message);
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Failed to check roll number: ' + error.message);
    }
  },

  // Additional helper methods based on your routes
  
  // Get students by name (using search)
  getStudentsByName: async (firstName, lastName = '') => {
    try {
      const filters = { firstName };
      if (lastName) filters.lastName = lastName;
      return await studentAPI.searchStudents(filters);
    } catch (error) {
      throw new Error('Failed to search students by name: ' + error.message);
    }
  },

  // Get student by roll number and class
  getStudentByRollAndClass: async (rollNumber, className, sectionName) => {
    try {
      const filters = { rollNumber, className, section: sectionName };
      return await studentAPI.searchStudents(filters);
    } catch (error) {
      throw new Error('Failed to find student by roll and class: ' + error.message);
    }
  },

  // Validate student exists
  validateStudent: async (firstName, rollNumber, className, sectionName) => {
    try {
      const filters = { firstName, rollNumber, className, section: sectionName };
      const response = await studentAPI.searchStudents(filters);
      return response.success && response.data && response.data.length > 0;
    } catch (error) {
      throw new Error('Failed to validate student: ' + error.message);
    }
  },
};

export default studentAPI;