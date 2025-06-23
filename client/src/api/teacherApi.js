// api/teacherApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/teachers'; // Adjust port as needed

const teacherApi = {
  // Add a new teacher
  addTeacher: async (teacherData) => {
    try {
      const response = await axios.post(`${BASE_URL}/addTeacher`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all teachers
  getAllTeachers: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a teacher
  updateTeacher: async (teacherId, updateData) => {
    try {
      const response = await axios.put(`${BASE_URL}/updateTeacher/${teacherId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a teacher
  deleteTeacher: async (teacherId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/deleteTeacher/${teacherId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Check for duplicate teacher
  checkDuplicate: async (email, contactNumber) => {
    try {
      const response = await axios.get(`${BASE_URL}/checkDuplicate`, {
        params: { email, contactNumber }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default teacherApi;