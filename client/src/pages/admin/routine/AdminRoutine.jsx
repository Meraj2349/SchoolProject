import { useEffect, useState } from 'react';
import {
    createRoutine,
    deleteRoutine,
    formatDateForInput,
    formatRoutineDate,
    getAllClasses,
    getAllRoutines,
    updateRoutine,
    validateRoutineData,
    validateRoutineFile
} from '../../../api/routineApi';
import Sidebar from '../../../components/Sidebar';
import './AdminRoutine.css';

const AdminRoutine = () => {
  // State management
  const [routines, setRoutines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [formData, setFormData] = useState({
    RoutineTitle: '',
    ClassID: '',
    RoutineDate: '',
    Description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routinesResponse, classesResponse] = await Promise.all([
        getAllRoutines(),
        getAllClasses()
      ]);
      
      setRoutines(routinesResponse.routines || []);
      setClasses(classesResponse.classes || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validation = validateRoutineFile(file);
      if (!validation.isValid) {
        setErrors(prev => ({
          ...prev,
          file: validation.error
        }));
        setSelectedFile(null);
      } else {
        setErrors(prev => ({
          ...prev,
          file: ''
        }));
        setSelectedFile(file);
      }
    } else {
      setSelectedFile(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateRoutineData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      if (editingRoutine) {
        // Update existing routine
        const response = await updateRoutine(editingRoutine.RoutineID, formData, selectedFile);
        setMessage(`Routine "${response.routine.RoutineTitle}" updated successfully!`);
      } else {
        // Create new routine
        const response = await createRoutine(formData, selectedFile);
        setMessage(`Routine "${response.routine.RoutineTitle}" created successfully for ${response.classInfo.ClassName} - ${response.classInfo.Section}!`);
      }
      
      // Reset form and reload data
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving routine:', error);
      setMessage('Error saving routine: ' + error.message);
    }
  };

  // Handle edit
  const handleEdit = (routine) => {
    setEditingRoutine(routine);
    setFormData({
      RoutineTitle: routine.RoutineTitle,
      ClassID: routine.ClassID.toString(),
      RoutineDate: formatDateForInput(routine.RoutineDate),
      Description: routine.Description || ''
    });
    setSelectedFile(null);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (routine) => {
    if (window.confirm(`Are you sure you want to delete "${routine.RoutineTitle}" for ${routine.ClassName} - ${routine.Section}?`)) {
      try {
        const response = await deleteRoutine(routine.RoutineID);
        setMessage(`Routine "${response.deletedRoutine.RoutineTitle}" deleted successfully!`);
        await loadData();
      } catch (error) {
        console.error('Error deleting routine:', error);
        setMessage('Error deleting routine: ' + error.message);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      RoutineTitle: '',
      ClassID: '',
      RoutineDate: '',
      Description: ''
    });
    setSelectedFile(null);
    setErrors({});
    setEditingRoutine(null);
    setShowForm(false);
  };

  // Get class display name
  const getClassDisplayName = (classInfo) => {
    return `${classInfo.ClassName} - ${classInfo.Section}`;
  };

  if (loading) {
    return <div className="admin-routine-loading">Loading routines...</div>;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main-content">
        <div className="admin-routine-container">
          <div className="admin-routine-header">
            <h2>Manage Routines</h2>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancel' : 'Add New Routine'}
            </button>
          </div>

      {message && (
        <div className={`admin-routine-message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      {/* Routine Form */}
      {showForm && (
        <div className="admin-routine-form-container">
          <h3>{editingRoutine ? 'Edit Routine' : 'Add New Routine'}</h3>
          <form onSubmit={handleSubmit} className="admin-routine-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="RoutineTitle">Routine Title *</label>
                <input
                  type="text"
                  id="RoutineTitle"
                  name="RoutineTitle"
                  value={formData.RoutineTitle}
                  onChange={handleInputChange}
                  className={errors.RoutineTitle ? 'error' : ''}
                  placeholder="Enter routine title"
                />
                {errors.RoutineTitle && <span className="error-message">{errors.RoutineTitle}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="ClassID">Class *</label>
                <select
                  id="ClassID"
                  name="ClassID"
                  value={formData.ClassID}
                  onChange={handleInputChange}
                  className={errors.ClassID ? 'error' : ''}
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.ClassID} value={cls.ClassID}>
                      {getClassDisplayName(cls)}
                    </option>
                  ))}
                </select>
                {errors.ClassID && <span className="error-message">{errors.ClassID}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="RoutineDate">Routine Date *</label>
                <input
                  type="date"
                  id="RoutineDate"
                  name="RoutineDate"
                  value={formData.RoutineDate}
                  onChange={handleInputChange}
                  className={errors.RoutineDate ? 'error' : ''}
                />
                {errors.RoutineDate && <span className="error-message">{errors.RoutineDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="routineFile">Routine File (PDF/Image)</label>
                <input
                  type="file"
                  id="routineFile"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileChange}
                  className={errors.file ? 'error' : ''}
                />
                {errors.file && <span className="error-message">{errors.file}</span>}
                {selectedFile && (
                  <div className="file-info">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="Description">Description</label>
              <textarea
                id="Description"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter routine description (optional)"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {editingRoutine ? 'Update Routine' : 'Create Routine'}
              </button>
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Routines List */}
      <div className="admin-routine-list">
        <h3>All Routines ({routines.length})</h3>
        {routines.length === 0 ? (
          <div className="no-routines">
            No routines found. Click "Add New Routine" to create one.
          </div>
        ) : (
          <div className="routine-grid">
            {routines.map(routine => (
              <div key={routine.RoutineID} className="routine-card">
                <div className="routine-header">
                  <h4>{routine.RoutineTitle}</h4>
                  <div className="routine-class">
                    {routine.ClassName} - {routine.Section}
                  </div>
                </div>
                
                <div className="routine-details">
                  <div className="routine-date">
                    <strong>Date:</strong> {formatRoutineDate(routine.RoutineDate)}
                  </div>
                  
                  {routine.Description && (
                    <div className="routine-description">
                      <strong>Description:</strong> {routine.Description}
                    </div>
                  )}
                  
                  {routine.FileURL && (
                    <div className="routine-file">
                      <strong>File:</strong> 
                      <a 
                        href={routine.FileURL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        View File ({routine.FileType?.toUpperCase()})
                      </a>
                    </div>
                  )}
                  
                  <div className="routine-meta">
                    <small>Created: {formatRoutineDate(routine.CreatedDate)}</small>
                  </div>
                </div>
                
                <div className="routine-actions">
                  <button 
                    className="btn-edit"
                    onClick={() => handleEdit(routine)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDelete(routine)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoutine;