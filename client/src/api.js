import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Replace with your backend API URL

const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data.message || 'An error occurred while processing your request';
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response from the server. Please check your internet connection or try again later.';
  } else {
    // Something happened in setting up the request that triggered an Error
    return `Error: ${error.message}`;
  }
}

// Teacher API calls
export const addTeacher = async (teacherData) => {
  try {
    const response = await axios.post(`${API_URL}/teachers/addTeacher`, teacherData);
    return { success: true, message: 'Teacher added successfully', data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getAllTeachers = async () => {
  try {
    const response = await axios.get(`${API_URL}/teachers`);
    return { success: true, data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const updateTeacher = async (id, teacherData) => {
  try {
    const response = await axios.put(`${API_URL}/teachers/updateTeacher/${id}`, teacherData);
    return { success: true, message: 'Teacher updated successfully', data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const deleteTeacher = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/teachers/deleteTeacher/${id}`);
    return { success: true, message: 'Teacher deleted successfully', data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

// Check for duplicate teacher (email or contact number)
export const checkDuplicateTeacher = async (email, contactNumber) => {
  try {
    const response = await axios.get(`${API_URL}/teachers/checkDuplicate`, {
      params: { email, contactNumber },
    });
   
    
    return { success: true, data: response.data };

  } catch (error) {
    throw new Error(handleError(error));
  }
  
};


// Student API calls
export const addStudent = async (studentData) => {
  try {
    const response = await axios.post(`${API_URL}/students/addStudents`, studentData);
    return { success: true, message: 'Student added successfully', data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getAllStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/students`);
    return { success: true, data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const response = await axios.put(`${API_URL}/students/updateStudent/${id}`, studentData);
    return { success: true, message: 'Student updated successfully', data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/students/deleteStudent/${id}`);
    return { success: true, message: 'Student deleted successfully', data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const searchStudents = async (searchTerm) => {
  try {
    const response = await axios.get(`${API_URL}/students/search?name=${searchTerm}`);
    return { success: true, data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};

export const getStudentCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/students/count`);
    return { success: true, data: response.data };
  } catch (error) {
    throw new Error(handleError(error));
  }
};
