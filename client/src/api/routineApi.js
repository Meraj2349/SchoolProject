// Routine API service following your existing API patterns
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const ROUTINE_API_URL = `${API_BASE_URL}/api/routines`;

// Helper function to get auth headers (following your existing pattern)
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all routines
export const getAllRoutines = async () => {
  try {
    const response = await fetch(ROUTINE_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all routines:', error);
    throw error;
  }
};

// Get all classes for dropdown (from Classes table)
export const getAllClasses = async () => {
  try {
    const response = await fetch(`${ROUTINE_API_URL}/options/classes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all classes:', error);
    throw error;
  }
};

// Get filter options (distinct classes and sections)
export const getFilterOptions = async () => {
  try {
    const response = await fetch(`${ROUTINE_API_URL}/options/filters`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching filter options:', error);
    throw error;
  }
};

// Get sections by class name (for dynamic section loading)
export const getSectionsByClassName = async (className) => {
  try {
    const response = await fetch(`${ROUTINE_API_URL}/options/sections/${encodeURIComponent(className)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sections by class name:', error);
    throw error;
  }
};

// Create new routine with file upload (admin only)
export const createRoutine = async (routineData, file) => {
  try {
    const formData = new FormData();
    
    // Add routine data
    formData.append('RoutineTitle', routineData.RoutineTitle);
    formData.append('ClassID', routineData.ClassID);
    formData.append('RoutineDate', routineData.RoutineDate);
    if (routineData.Description) {
      formData.append('Description', routineData.Description);
    }
    
    // Add file if provided
    if (file) {
      formData.append('routineFile', file);
    }

    const response = await fetch(ROUTINE_API_URL, {
      method: 'POST',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating routine:', error);
    throw error;
  }
};

// Update routine with optional file upload (admin only)
export const updateRoutine = async (id, routineData, file) => {
  try {
    const formData = new FormData();
    
    // Add routine data (only include provided fields)
    if (routineData.RoutineTitle) {
      formData.append('RoutineTitle', routineData.RoutineTitle);
    }
    if (routineData.ClassID) {
      formData.append('ClassID', routineData.ClassID);
    }
    if (routineData.RoutineDate) {
      formData.append('RoutineDate', routineData.RoutineDate);
    }
    if (routineData.Description !== undefined) { // Allow empty string
      formData.append('Description', routineData.Description);
    }
    
    // Add file if provided
    if (file) {
      formData.append('routineFile', file);
    }

    const response = await fetch(`${ROUTINE_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating routine:', error);
    throw error;
  }
};

// Delete routine (admin only)
export const deleteRoutine = async (id) => {
  try {
    const response = await fetch(`${ROUTINE_API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders()
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting routine:', error);
    throw error;
  }
};

// Get routine by ID
export const getRoutineById = async (id) => {
  try {
    const response = await fetch(`${ROUTINE_API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching routine by ID:', error);
    throw error;
  }
};

// ========== Additional API Functions ==========

// Get routines by class and section (filtering)
export const getRoutinesByClassSection = async (className, section) => {
  try {
    const params = new URLSearchParams();
    if (className) params.append('className', className);
    if (section) params.append('section', section);
    
    const response = await fetch(`${ROUTINE_API_URL}/filter/class-section?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching routines by class/section:', error);
    throw error;
  }
};

// Get routines by ClassID
export const getRoutinesByClassId = async (classId) => {
  try {
    const response = await fetch(`${ROUTINE_API_URL}/class/${classId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching routines by ClassID:', error);
    throw error;
  }
};

// Search routines
export const searchRoutines = async (searchTerm) => {
  try {
    const params = new URLSearchParams({ q: searchTerm });
    const response = await fetch(`${ROUTINE_API_URL}/search/query?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching routines:', error);
    throw error;
  }
};

// ========== Helper Functions ==========

// Format routine date for display
export const formatRoutineDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// Format routine date for input (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
};

// Validate routine form data
export const validateRoutineData = (routineData) => {
  const errors = {};
  
  if (!routineData.RoutineTitle?.trim()) {
    errors.RoutineTitle = 'Routine title is required';
  }
  
  if (!routineData.ClassID) {
    errors.ClassID = 'Please select a class';
  }
  
  if (!routineData.RoutineDate) {
    errors.RoutineDate = 'Routine date is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Get file extension from URL
export const getFileExtension = (url) => {
  if (!url) return '';
  const filename = url.split('/').pop();
  const extension = filename.split('.').pop();
  return extension?.toLowerCase() || '';
};

// Check if file is PDF
export const isPDF = (fileType, url) => {
  return fileType === 'pdf' || getFileExtension(url) === 'pdf';
};

// Check if file is image
export const isImage = (fileType, url) => {
  if (fileType === 'image') return true;
  const ext = getFileExtension(url);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
};

// Validate file for routine upload
export const validateRoutineFile = (file) => {
  if (!file) return { isValid: true, error: null };
  
  // Check file size (10MB limit, same as multer config)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size cannot exceed 10MB'
    };
  }
  
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PDF and image files (JPEG, PNG, GIF, WebP) are allowed'
    };
  }
  
  return { isValid: true, error: null };
};