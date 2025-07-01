import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/classes";

// router.get("/totalstudents/:className", getTotalStudentsInClassByNameController);

const classAPI = {
  // Get all classes
  getAllClasses: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch classes: " + error.message);
    }
  },
  // Add a new class
  addClass: async (classData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/add`, classData);
      return response.data;
    } catch (error) {
      throw new Error("Failed to add class: " + error.message);
    }
  },
  // Delete a class by ID
  deleteClass: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/delete/${id}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to delete class: " + error.message);
    }
  },
  // Edit a class by ID
  editClass: async (id, classData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/edit/${id}`, classData);
      return response.data;
    } catch (error) {
      throw new Error("Failed to edit class: " + error.message);
    }
  },
  // Get total students in a class by class name
  getTotalStudentsInClassByName: async (className) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/totalstudents/${className}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        "Failed to fetch total students in class: " + error.message
      );
    }
  },
};

export default classAPI;
