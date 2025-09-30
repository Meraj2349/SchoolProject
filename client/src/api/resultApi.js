// api/resultApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/results'; // Adjust port as needed
const isDevelopment = import.meta.env.DEV; // Vite development mode check

const resultApi = {
  // Get all results with pagination
  getAllResults: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(BASE_URL, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add a new result by IDs
  addResult: async (resultData) => {
    try {
      if (isDevelopment) console.log('Sending result data to API:', resultData);
      const response = await axios.post(BASE_URL, resultData);
      if (isDevelopment) console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      if (isDevelopment) {
        console.error('API Error:', error.response?.data || error.message);
      }
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        throw new Error(error.response.data.message || 'Result already exists for this student, exam, and subject');
      }
      
      // Return the error in a format the frontend expects
      if (error.response?.data) {
        throw error.response.data;
      } else {
        throw { success: false, message: error.message };
      }
    }
  },

  // Add a result using student details (names, roll number, etc.)
  addResultByDetails: async (resultData) => {
    try {
      const response = await axios.post(`${BASE_URL}/add-by-details`, resultData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add multiple results (batch insert)
  addMultipleResults: async (resultsArray) => {
    try {
      const response = await axios.post(`${BASE_URL}/batch`, { results: resultsArray });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get the total count of results
  getResultCount: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/count`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search results with basic filters
  searchResults: async (filters = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}/search`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Advanced search with pagination and comprehensive filters
  advancedSearchResults: async (filters = {}, page = 1, limit = 10) => {
    try {
      const params = { ...filters, page, limit };
      const response = await axios.get(`${BASE_URL}/search/advanced`, {
        params
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check if a result exists
  checkResultExists: async (studentId, examId, subjectId) => {
    try {
      const response = await axios.get(`${BASE_URL}/check-exists`, {
        params: { studentId, examId, subjectId }
      });
      if (isDevelopment) console.log('Check exists API response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      if (isDevelopment) console.error('Check exists error:', error.response?.data || error.message); // Debug log
      throw error.response?.data || error.message;
    }
  },

  // Get results by student
  getResultsByStudent: async (studentId) => {
    try {
      const response = await axios.get(`${BASE_URL}/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get results by exam
  getResultsByExam: async (examId) => {
    try {
      const response = await axios.get(`${BASE_URL}/exam/${examId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get results by class
  getResultsByClass: async (classId) => {
    try {
      const response = await axios.get(`${BASE_URL}/class/${classId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get results by subject
  getResultsBySubject: async (subjectId) => {
    try {
      const response = await axios.get(`${BASE_URL}/subject/${subjectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get student result summary for a specific exam
  getStudentResultSummary: async (studentId, examId) => {
    try {
      const response = await axios.get(`${BASE_URL}/summary/${studentId}/${examId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a specific result by ID
  getResultById: async (resultId) => {
    try {
      const response = await axios.get(`${BASE_URL}/${resultId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a result
  updateResult: async (resultId, updateData) => {
    try {
      const response = await axios.put(`${BASE_URL}/${resultId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a result
  deleteResult: async (resultId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${resultId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete all results for a specific exam
  deleteResultsByExam: async (examId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/exam/${examId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper methods for common operations

  // Get results for a specific student and exam
  getStudentExamResults: async (studentId, examId) => {
    try {
      const filters = { studentId, examId };
      return await resultApi.searchResults(filters);
    } catch (error) {
      throw new Error('Failed to fetch student exam results: ' + error.message);
    }
  },

  // Get results for a specific class and exam
  getClassExamResults: async (classId, examId) => {
    try {
      const filters = { classId, examId };
      return await resultApi.advancedSearchResults(filters);
    } catch (error) {
      throw new Error('Failed to fetch class exam results: ' + error.message);
    }
  },

  // Get subject-wise results for a student
  getStudentSubjectResults: async (studentId, subjectId) => {
    try {
      const filters = { studentId, subjectId };
      return await resultApi.searchResults(filters);
    } catch (error) {
      throw new Error('Failed to fetch student subject results: ' + error.message);
    }
  },

  // Get results with grade calculation (assuming marks are returned)
  getResultsWithGrades: async (filters = {}) => {
    try {
      const response = await resultApi.searchResults(filters);
      
      // Add grade calculation to each result
      if (response.success && response.data) {
        response.data = response.data.map(result => ({
          ...result,
          grade: calculateGrade(result.marksObtained),
          percentage: calculatePercentage(result.marksObtained, result.totalMarks)
        }));
      }
      
      return response;
    } catch (error) {
      throw new Error('Failed to fetch results with grades: ' + error.message);
    }
  },

  // Bulk add results for a class exam
  addClassExamResults: async (classId, examId, resultsData) => {
    try {
      const resultsArray = resultsData.map(result => ({
        ...result,
        classId,
        examId
      }));
      
      return await resultApi.addMultipleResults(resultsArray);
    } catch (error) {
      throw new Error('Failed to add class exam results: ' + error.message);
    }
  },

  // Get exam statistics
  getExamStatistics: async (examId) => {
    try {
      const results = await resultApi.getResultsByExam(examId);
      
      if (results.success && results.data && results.data.length > 0) {
        const marks = results.data.map(result => result.marksObtained);
        const totalMarks = results.data[0].totalMarks || 100;
        
        const statistics = {
          totalStudents: results.data.length,
          averageMarks: marks.reduce((sum, mark) => sum + mark, 0) / marks.length,
          highestMarks: Math.max(...marks),
          lowestMarks: Math.min(...marks),
          passCount: marks.filter(mark => (mark / totalMarks) * 100 >= 35).length,
          failCount: marks.filter(mark => (mark / totalMarks) * 100 < 35).length
        };
        
        return { success: true, data: statistics };
      }
      
      return { success: false, message: 'No results found for this exam' };
    } catch (error) {
      throw new Error('Failed to calculate exam statistics: ' + error.message);
    }
  }
};

// Helper functions for grade and percentage calculation
const calculateGrade = (marksObtained, totalMarks = 100) => {
  const percentage = (marksObtained / totalMarks) * 100;
  
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 35) return 'D';
  return 'F';
};

const calculatePercentage = (marksObtained, totalMarks = 100) => {
  return ((marksObtained / totalMarks) * 100).toFixed(2);
};

export default resultApi;