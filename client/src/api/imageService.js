// services/imageService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/images';

const imageService = {
  // Upload image
  uploadImage: async (formData) => {
    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Upload failed');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Failed to upload image');
      }
    }
  },

  // Get all images by type
  getImagesByType: async (type) => {
    try {
      const response = await axios.get(`${API_URL}/type/${type}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch images');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Failed to fetch images');
      }
    }
  },

  // Get single image
  getImage: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Image not found');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Failed to fetch image');
      }
    }
  },

  // Update image metadata
  updateImage: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Update failed');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Failed to update image');
      }
    }
  },

  // Replace image file
  replaceImageFile: async (id, formData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Replace failed');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Failed to replace image');
      }
    }
  },

  // Delete image
  deleteImage: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Delete failed');
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error('Failed to delete image');
      }
    }
  },
};

export default imageService;