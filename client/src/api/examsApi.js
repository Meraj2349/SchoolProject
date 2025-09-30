// api/examsApi.js
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:3000/api/exams";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all exams
export const getAllExams = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch exams");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching exams:", error);
    throw error;
  }
};

// Get exam by ID
export const getExamById = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${examId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch exam");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching exam:", error);
    throw error;
  }
};

// Get exams by class ID
export const getExamsByClass = async (classId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/class/${classId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch exams by class");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching exams by class:", error);
    throw error;
  }
};

// Add exam by class details (using class name and section)
export const addExamByClassDetails = async (examData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/by-class`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(examData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add exam");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding exam:", error);
    throw error;
  }
};

// Create exam by class name and section
export const createExamByClassNameAndSection = async (examType, examName, className, sectionName, examDate) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        examType,
        examName,
        className,
        sectionName,
        examDate
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create exam");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating exam:", error);
    throw error;
  }
};

// Update exam
export const updateExam = async (examId, examData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${examId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(examData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update exam");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating exam:", error);
    throw error;
  }
};

// Delete exam
export const deleteExam = async (examId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${examId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete exam");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting exam:", error);
    throw error;
  }
};

// Default export object for easier imports
const examsApi = {
  getAllExams,
  getExamById,
  getExamsByClass,
  addExamByClassDetails,
  createExamByClassNameAndSection,
  updateExam,
  deleteExam
};

export default examsApi;