import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:3000/api/subjects";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all subjects
export const getAllSubjects = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subjects");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

// Add a new subject
export const addSubject = async (subjectData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add subject");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding subject:", error);
    throw error;
  }
};

// Update a subject
export const updateSubject = async (subjectId, subjectData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/edit/${subjectId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update subject");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating subject:", error);
    throw error;
  }
};

// Delete a subject
export const deleteSubject = async (subjectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/delete/${subjectId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete subject");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting subject:", error);
    throw error;
  }
};

// Get all classes
export const getAllClasses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/classes`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch classes");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

// Get subjects by class ID
export const getSubjectsByClass = async (classId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/class/${classId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subjects by class");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching subjects by class:", error);
    throw error;
  }
};

// Get subjects by class name
export const getSubjectsByClassName = async (className) => {
  try {
    const response = await fetch(`${API_BASE_URL}/by-class-name/${encodeURIComponent(className)}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subjects by class name");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching subjects by class name:", error);
    throw error;
  }
};

// Default export object for easier imports
const subjectsApi = {
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  getAllClasses,
  getSubjectsByClass,
  getSubjectsByClassName
};

export default subjectsApi;
