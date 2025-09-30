// components/EnhancedImageGallery.jsx
import { useEffect, useState } from 'react';
import imageService from '../api/imageService';
import studentAPI from '../api/studentApi';
import teacherApi from '../api/teacherApi';
import '../assets/styles/EnhancedImageGallery.css';

const EnhancedImageGallery = () => {
  const [images, setImages] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
    imageType: '',
    studentId: '',
    teacherId: '',
    associatedId: ''
  });

  // Edit form states
  const [editForm, setEditForm] = useState({
    file: null,
    preview: '',
    description: '',
    imageType: '',
    studentId: '',
    teacherId: '',
    associatedId: ''
  });

  const imageTypes = ['student', 'teacher', 'school', 'event', 'notice'];

  useEffect(() => {
    loadInitialData();
  }, []);

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

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [studentsData, teachersData] = await Promise.all([
        studentAPI.getAllStudents(),
        teacherApi.getAllTeachers()
      ]);
      
      setStudents(studentsData.data || studentsData || []);
      setTeachers(teachersData.data || teachersData || []);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load students and teachers data');
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      setLoading(true);
      setError('');
      let data;
      
      if (selectedType === 'all' || selectedType === 'details') {
        data = await imageService.getImagesWithDetails();
      } else {
        data = await imageService.getImagesByType(selectedType);
      }
      
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

  const handleImageTypeChange = (type, formType = 'upload') => {
    if (formType === 'upload') {
      setUploadForm({
        ...uploadForm,
        imageType: type,
        studentId: '',
        teacherId: '',
        associatedId: ''
      });
    } else {
      setEditForm({
        ...editForm,
        imageType: type,
        studentId: '',
        teacherId: '',
        associatedId: ''
      });
    }
  };

  const validateForm = (form) => {
    if (!form.file && !editModal.show) {
      return 'Please select an image';
    }
    if (!form.imageType) {
      return 'Please select an image type';
    }
    if (form.imageType === 'student' && !form.studentId) {
      return 'Please select a student';
    }
    if (form.imageType === 'teacher' && !form.teacherId) {
      return 'Please select a teacher';
    }
    return null;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm(uploadForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append('image', uploadForm.file);
    formData.append('description', uploadForm.description);
    formData.append('imageType', uploadForm.imageType);
    
    if (uploadForm.studentId) {
      formData.append('studentId', uploadForm.studentId);
    }
    if (uploadForm.teacherId) {
      formData.append('teacherId', uploadForm.teacherId);
    }
    if (uploadForm.associatedId) {
      formData.append('associatedId', uploadForm.associatedId);
    }

    try {
      setLoading(true);
      const newImage = await imageService.uploadImage(formData);
      await loadImages(); // Reload to get updated data
      setSuccess('Image uploaded successfully!');
      
      // Reset form
      setUploadForm({
        file: null,
        preview: '',
        description: '',
        imageType: '',
        studentId: '',
        teacherId: '',
        associatedId: ''
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
    
    const isConfirmed = window.confirm(
      '⚠️ Delete Confirmation\\n\\n' +
      'Are you sure you want to permanently delete this image?\\n\\n' +
      'This action cannot be undone. The image will be removed from both the database and cloud storage.'
    );
    
    if (!isConfirmed) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('Deleting image...');
      
      await imageService.deleteImage(id);
      await loadImages(); // Reload to get updated data
      setSuccess('✅ Image deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (image) => {
    setEditForm({
      file: null,
      preview: '',
      description: image.Description || '',
      imageType: image.ImageType || '',
      studentId: image.StudentID || '',
      teacherId: image.TeacherID || '',
      associatedId: image.AssociatedID || ''
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

      const validationError = validateForm({ ...editForm, file: editForm.file || 'existing' });
      if (validationError && validationError !== 'Please select an image') {
        setError(validationError);
        return;
      }
      
      setSuccess('Updating image...');
      
      // Update metadata
      const updateData = {
        description: editForm.description,
        imageType: editForm.imageType
      };

      if (editForm.studentId) updateData.studentId = editForm.studentId;
      if (editForm.teacherId) updateData.teacherId = editForm.teacherId;
      if (editForm.associatedId) updateData.associatedId = editForm.associatedId;

      await imageService.updateImage(imageId, updateData);

      // If new file selected, replace image
      if (editForm.file) {
        const formData = new FormData();
        formData.append('image', editForm.file);
        await imageService.replaceImageFile(imageId, formData);
      }

      await loadImages(); // Reload to get updated data
      setSuccess('✅ Image updated successfully!');
      setEditModal({ show: false, image: null });
      
      // Reset edit form
      setEditForm({
        file: null,
        preview: '',
        description: '',
        imageType: '',
        studentId: '',
        teacherId: '',
        associatedId: ''
      });
      
    } catch (err) {
      setError(err.message || 'Failed to update image');
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (student) => {
    if (!student) return 'Select Student';
    return `${student.FirstName} ${student.LastName} (${student.RollNumber})`;
  };

  const getTeacherName = (teacher) => {
    if (!teacher) return 'Select Teacher';
    return `${teacher.FirstName} ${teacher.LastName} (${teacher.Subject})`;
  };

  const getImageTitle = (image) => {
    if (image.StudentFirstName) {
      return `${image.StudentFirstName} ${image.StudentLastName} (${image.RollNumber})`;
    }
    if (image.TeacherFirstName) {
      return `${image.TeacherFirstName} ${image.TeacherLastName} (${image.Subject})`;
    }
    return image.Description || 'No title';
  };

  return (
    <div className="enhanced-image-gallery-container">
      <h1>Enhanced Image Gallery Management</h1>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="alert-close">×</button>
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        <h2>📤 Upload New Image</h2>
        <form onSubmit={handleUpload} className="upload-form">
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

          <div className="form-grid">
            <div className="form-group">
              <label>Image Type *</label>
              <select
                value={uploadForm.imageType}
                onChange={(e) => handleImageTypeChange(e.target.value, 'upload')}
                required
              >
                <option value="">Select type</option>
                {imageTypes.map(type => (
                  <option key={`upload-${type}`} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {uploadForm.imageType === 'student' && (
              <div className="form-group">
                <label>Select Student *</label>
                <select
                  value={uploadForm.studentId}
                  onChange={(e) => setUploadForm({...uploadForm, studentId: e.target.value})}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.StudentID} value={student.StudentID}>
                      {getStudentName(student)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {uploadForm.imageType === 'teacher' && (
              <div className="form-group">
                <label>Select Teacher *</label>
                <select
                  value={uploadForm.teacherId}
                  onChange={(e) => setUploadForm({...uploadForm, teacherId: e.target.value})}
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.TeacherID} value={teacher.TeacherID}>
                      {getTeacherName(teacher)}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
            {loading ? (
              <>
                <div className="spinner"></div>
                Uploading...
              </>
            ) : (
              <>
                📤 Upload Image
              </>
            )}
          </button>
        </form>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h3>🔍 Filter Images</h3>
        <div className="filter-controls">
          <div className="form-group">
            <label>Filter by type:</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">All Images</option>
              <option value="details">All with Details</option>
              {imageTypes.map(type => (
                <option key={`filter-${type}`} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Images
                </option>
              ))}
            </select>
          </div>
          <button onClick={loadImages} className="btn btn-secondary">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-number">{images.length}</div>
          <div className="stat-label">
            {selectedType === 'all' ? 'Total Images' : `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Images`}
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="image-grid">
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading images...</p>
          </div>
        )}
        
        {!loading && images.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📸</div>
            <h3>No images found</h3>
            <p>Upload your first image to get started</p>
          </div>
        )}

        {!loading && images.map((image) => {
          const imageId = image._id || image.id || image.ImageID;
          if (!imageId) {
            console.warn('Image missing ID:', image);
            return null;
          }
          
          return (
            <div key={imageId} className="image-card">
              <div className="image-wrapper">
                <img 
                  src={image.ImagePath || image.ImageUrl} 
                  alt={image.Description || 'Image'} 
                  className="image-display"
                />
                <div className="image-overlay">
                  <button 
                    onClick={() => openEditModal(image)} 
                    className="btn-icon btn-edit"
                    title="Edit Image"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(imageId)} 
                    className="btn-icon btn-delete"
                    title="Delete Image"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              
              <div className="image-info">
                <div className="image-type-badge">
                  {image.ImageType}
                </div>
                <h4 className="image-title">
                  {getImageTitle(image)}
                </h4>
                {image.Description && (
                  <p className="image-description">{image.Description}</p>
                )}
                <div className="image-meta">
                  <span className="upload-date">
                    📅 {new Date(image.UploadDate).toLocaleDateString()}
                  </span>
                </div>
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
              <h2>✏️ Edit Image</h2>
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
                <label>Replace Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'edit')}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Image Type *</label>
                  <select
                    value={editForm.imageType}
                    onChange={(e) => handleImageTypeChange(e.target.value, 'edit')}
                    required
                  >
                    <option value="">Select type</option>
                    {imageTypes.map(type => (
                      <option key={`edit-${type}`} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {editForm.imageType === 'student' && (
                  <div className="form-group">
                    <label>Select Student *</label>
                    <select
                      value={editForm.studentId}
                      onChange={(e) => setEditForm({...editForm, studentId: e.target.value})}
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student.StudentID} value={student.StudentID}>
                          {getStudentName(student)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editForm.imageType === 'teacher' && (
                  <div className="form-group">
                    <label>Select Teacher *</label>
                    <select
                      value={editForm.teacherId}
                      onChange={(e) => setEditForm({...editForm, teacherId: e.target.value})}
                      required
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map(teacher => (
                        <option key={teacher.TeacherID} value={teacher.TeacherID}>
                          {getTeacherName(teacher)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group full-width">
                  <label>Description</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Enter description"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  onClick={handleUpdate} 
                  disabled={loading || !editForm.imageType}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      ✅ Update Image
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
                      imageType: '',
                      studentId: '',
                      teacherId: '',
                      associatedId: ''
                    });
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedImageGallery;