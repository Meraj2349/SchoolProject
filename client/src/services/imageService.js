import axios from 'axios';

const API_URL = '/api/images';

// Add auth token to requests
const createAuthHeaders = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data' // Only for upload
    }
  };
};

// Upload image
export const uploadImage = async (formData, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/upload`, 
      formData, 
      createAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload image');
  }
};

// Get all images with optional filters
export const fetchImages = async ({ type, page = 1, limit = 12 }) => {
  try {
    const params = { page, limit };
    if (type) params.type = type;

    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch images');
  }
};

// Get single image by ID
export const fetchImage = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch image');
  }
};

// Delete image
export const deleteImage = async (id, token) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${id}`, 
      createAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete image');
  }
};