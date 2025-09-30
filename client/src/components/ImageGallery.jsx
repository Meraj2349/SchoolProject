// components/ImageGallery.jsx
import { useEffect, useState } from 'react';
import imageService from '../api/imageService';
import '../assets/styles/ImageGallery.css';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [editModal, setEditModal] = useState({ show: false, image: null });
  
  // Upload form states
  const [uploadForm, setUploadForm] = useState({
    file: null,
    preview: '',
    description: '',
    imageType: ''
  });

  // Edit form states
  const [editForm, setEditForm] = useState({
    file: null,
    preview: '',
    description: '',
    imageType: ''
  });

  const imageTypes = ['student', 'teacher', 'school', 'event', 'notice'];

  useEffect(() => {
    loadImages();
  }, [selectedType]);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Handle keyboard shortcuts for modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (editModal.show) {
        if (event.key === 'Escape') {
          setEditModal({ show: false, image: null });
          setEditForm({
            file: null,
            preview: '',
            description: '',
            imageType: ''
          });
        } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          if (editForm.imageType && !loading) {
            handleUpdate();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editModal.show, editForm.imageType, loading]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading images for type:', selectedType);
      const data = await imageService.getImagesByType(selectedType);
      console.log('Received image data:', data);
      setImages(data);
    } catch (err) {
      console.error('Error loading images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e, type = 'upload') => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'upload') {
          setUploadForm({ ...uploadForm, file, preview: reader.result });
        } else {
          setEditForm({ ...editForm, file, preview: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!uploadForm.file || !uploadForm.imageType) {
      setError('Please select an image and type');
      return;
    }

    const formData = new FormData();
    formData.append('image', uploadForm.file);
    formData.append('description', uploadForm.description);
    formData.append('imageType', uploadForm.imageType);

    try {
      setLoading(true);
      const newImage = await imageService.uploadImage(formData);
      setImages([...images, newImage]);
      setSuccess('Image uploaded successfully!');
      
      // Reset form
      setUploadForm({
        file: null,
        preview: '',
        description: '',
        imageType: ''
      });
      e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setError('Invalid image ID');
      return;
    }
    
    // Enhanced confirmation dialog
    const isConfirmed = window.confirm(
      '⚠️ Delete Confirmation\n\n' +
      'Are you sure you want to permanently delete this image?\n\n' +
      'This action cannot be undone. The image will be removed from both the database and cloud storage.'
    );
    
    if (!isConfirmed) return;

    try {
      setLoading(true);
      setError('');
      
      // Show deleting progress
      setSuccess('Deleting image...');
      
      await imageService.deleteImage(id);
      
      // Update the images list by filtering out the deleted image
      setImages(images.filter(img => {
        const imgId = img._id || img.id || img.ImageID;
        return imgId !== id;
      }));
      
      setSuccess('✅ Image deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete image');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (image) => {
    setEditForm({
      file: null,
      preview: '',
      description: image.Description || '',
      imageType: image.ImageType || ''
    });
    setEditModal({ show: true, image });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      
      const imageId = editModal.image._id || editModal.image.id || editModal.image.ImageID;
      if (!imageId) {
        setError('Invalid image ID for update');
        return;
      }

      // Validate form data
      if (!editForm.imageType) {
        setError('Please select an image type');
        return;
      }
      
      // Show updating progress
      setSuccess('Updating image...');
      
      // Update metadata
      const updatedImage = await imageService.updateImage(imageId, {
        description: editForm.description,
        imageType: editForm.imageType
      });

      // If new file selected, replace image
      if (editForm.file) {
        const formData = new FormData();
        formData.append('image', editForm.file);
        await imageService.replaceImageFile(imageId, formData);
      }

      // Update the images list
      setImages(images.map(img => {
        const imgId = img._id || img.id || img.ImageID;
        return imgId === imageId ? { ...img, ...updatedImage } : img;
      }));
      
      setSuccess('✅ Image updated successfully!');
      setEditModal({ show: false, image: null });
      
      // Reset edit form
      setEditForm({
        file: null,
        preview: '',
        description: '',
        imageType: ''
      });
      
    } catch (err) {
      setError(err.message || 'Failed to update image');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-gallery-container">
      <h1>Image Gallery Management</h1>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Upload Section */}
      <div className="upload-section">
        <h2>Upload New Image</h2>
        <form onSubmit={handleUpload}>
          <div className="upload-area">
            <input
              type="file"
              id="file-input"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'upload')}
              hidden
            />
            <label htmlFor="file-input" className="upload-label">
              {uploadForm.preview ? (
                <img src={uploadForm.preview} alt="Preview" className="upload-preview" />
              ) : (
                <div className="upload-placeholder">
                  <svg className="upload-icon" viewBox="0 0 24 24">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                  </svg>
                  <p>Click to upload image</p>
                  <span>JPEG, PNG up to 10MB</span>
                </div>
              )}
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Image Type*</label>
              <select
                value={uploadForm.imageType}
                onChange={(e) => setUploadForm({...uploadForm, imageType: e.target.value})}
                required
              >
                <option value="">Select type</option>
                {imageTypes.map(type => (
                  <option key={`upload-${type}`} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                placeholder="Enter description"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </form>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <label>Filter by type:</label>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="all">All Images</option>
          {imageTypes.map(type => (
            <option key={`filter-${type}`} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Image Grid */}
      <div className="image-grid">
        {loading && <div className="loading">Loading...</div>}
        
        {!loading && images.length === 0 && (
          <div className="empty-state">No images found</div>
        )}

        {!loading && images.map((image) => {
          // Safety check for image ID
          const imageId = image._id || image.id || image.ImageID;
          if (!imageId) {
            console.warn('Image missing ID:', image);
            return null;
          }
          
          return (
            <div key={imageId} className="image-card">
              <div className="image-wrapper">
                <img src={image.ImagePath || image.ImageUrl} alt={image.Description || 'Image'} />
                <div className="image-overlay">
                  <button 
                    onClick={() => openEditModal(image)} 
                    className="btn-icon btn-edit"
                    title="Edit Image"
                    aria-label="Edit Image"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    <span className="btn-text">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(imageId)} 
                    className="btn-icon btn-delete"
                    title="Delete Image"
                    aria-label="Delete Image"
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    <span className="btn-text">Delete</span>
                  </button>
                </div>
              </div>
              <div className="image-info">
                <span className="image-type">{image.ImageType}</span>
                {image.Description && <p className="image-description">{image.Description}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editModal.show && (
        <div className="modal-overlay" onClick={() => setEditModal({ show: false, image: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Image</h2>
              <button 
                className="modal-close" 
                onClick={() => setEditModal({ show: false, image: null })}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="edit-preview">
                <img 
                  src={editForm.preview || editModal.image.ImagePath || editModal.image.ImageUrl} 
                  alt="Preview" 
                />
              </div>

              <div className="form-group">
                <label>Replace Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'edit')}
                />
              </div>

              <div className="form-group">
                <label>Image Type</label>
                <select
                  value={editForm.imageType}
                  onChange={(e) => setEditForm({...editForm, imageType: e.target.value})}
                >
                  {imageTypes.map(type => (
                    <option key={`edit-${type}`} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Enter description"
                />
              </div>

              <div className="modal-actions">
                <button 
                  onClick={handleUpdate} 
                  disabled={loading || !editForm.imageType}
                  className="btn btn-primary"
                  title={!editForm.imageType ? 'Please select an image type' : 'Save changes'}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="16" height="16" style={{marginRight: '8px'}}>
                        <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
                      </svg>
                      Update Image
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    setEditModal({ show: false, image: null });
                    setEditForm({
                      file: null,
                      preview: '',
                      description: '',
                      imageType: ''
                    });
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                  title="Cancel without saving changes"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" style={{marginRight: '8px'}}>
                    <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;