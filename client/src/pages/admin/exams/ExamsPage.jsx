import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import examsApi from "../../../api/examsApi";
import Sidebar from "../../../components/Sidebar";
import "./ExamsPage.css";

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    examName: "",
    examType: "",
    className: "",
    sectionName: "",
    examDate: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Valid exam types from the model
  const EXAM_TYPES = ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'Final'];

  // Check admin authentication
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Fetch all exams and classes
  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  // Auto-clear success and error messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await examsApi.getAllExams();
      console.log("Exams API response:", response); // Debug log
      
      // Handle different response structures
      let examsData = [];
      if (Array.isArray(response)) {
        examsData = response;
      } else if (response && Array.isArray(response.data)) {
        examsData = response.data;
      } else if (response && response.exams && Array.isArray(response.exams)) {
        examsData = response.exams;
      }
      
      setExams(examsData);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setError(error.message || "Failed to fetch exams. Please try again.");
      setExams([]); // Ensure exams is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("http://localhost:3000/api/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setClasses(data || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassChange = (e) => {
    const className = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      className: className,
      sectionName: '' // Reset section when class changes
    }));
  };

  const validateForm = () => {
    const { examName, examType, className, sectionName, examDate } = formData;
    
    if (!examName.trim()) {
      setError("Exam name is required.");
      return false;
    }
    
    if (!examType) {
      setError("Exam type is required.");
      return false;
    }
    
    if (!className) {
      setError("Class name is required.");
      return false;
    }
    
    if (!sectionName) {
      setError("Section name is required.");
      return false;
    }
    
    if (!examDate) {
      setError("Exam date is required.");
      return false;
    }

    // Validate exam date is not in the past
    const selectedDate = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError("Exam date cannot be in the past.");
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        // Update existing exam
        await examsApi.updateExam(editId, {
          ExamName: formData.examName.trim(),
          ExamType: formData.examType,
          ExamDate: formData.examDate
        });
        setSuccess("Exam updated successfully!");
      } else {
        // Create new exam
        await examsApi.addExamByClassDetails({
          examName: formData.examName.trim(),
          examType: formData.examType,
          className: formData.className,
          sectionName: formData.sectionName,
          examDate: formData.examDate
        });
        setSuccess("Exam created successfully!");
      }
      
      fetchExams();
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || `Failed to ${editId ? "update" : "create"} exam`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    setLoading(true);
    try {
      await examsApi.deleteExam(examId);
      fetchExams();
      setSuccess("Exam deleted successfully!");
    } catch (error) {
      console.error("Error deleting exam:", error);
      setError(error.message || "Failed to delete exam");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      examName: "",
      examType: "",
      className: "",
      sectionName: "",
      examDate: ""
    });
    setEditId(null);
  };

  const handleEdit = (exam) => {
    setEditId(exam.ExamID);
    setFormData({
      examName: exam.ExamName,
      examType: exam.ExamType,
      className: exam.ClassName || "",
      sectionName: exam.Section || "",
      examDate: exam.ExamDate ? exam.ExamDate.split('T')[0] : ""
    });
  };

  // Get unique classes for dropdown
  const getUniqueClasses = () => {
    const uniqueClassNames = [...new Set(classes.map(c => c.ClassName).filter(Boolean))];
    return uniqueClassNames.sort();
  };

  // Get sections for selected class
  const getUniqueSections = (className) => {
    if (!className) return [];
    const sections = classes
      .filter(c => c.ClassName === className)
      .map(c => c.Section)
      .filter(Boolean);
    return [...new Set(sections)].sort();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  // Format exam type with badge styling
  const getExamTypeBadge = (examType) => {
    const badges = {
      'Monthly': 'badge-blue',
      'Quarterly': 'badge-green',
      'Half-Yearly': 'badge-orange',
      'Annual': 'badge-purple',
      'Final': 'badge-red'
    };
    return badges[examType] || 'badge-gray';
  };

  return (
    <div className="exams-page">
      <Sidebar />
      <div className="content">
        <h1 className="page-title">Manage Exams</h1>

        {success && (
          <div className="alert success" onClick={() => setSuccess(null)}>
            <span className="alert-icon">✓</span>
            {success}
          </div>
        )}
        {error && (
          <div className="alert error" onClick={() => setError(null)}>
            <span className="alert-icon">⚠</span>
            {error}
          </div>
        )}

        <div className="form-container">
          <h2>
            <span className="form-icon">📝</span>
            {editId ? "Edit Exam" : "Create New Exam"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="examName">
                  <span className="label-icon">📚</span>
                  Exam Name
                </label>
                <input
                  id="examName"
                  name="examName"
                  type="text"
                  placeholder="Enter exam name"
                  value={formData.examName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="examType">
                  <span className="label-icon">🏷️</span>
                  Exam Type
                </label>
                <select
                  id="examType"
                  name="examType"
                  value={formData.examType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Exam Type</option>
                  {EXAM_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="className">
                  <span className="label-icon">🎓</span>
                  Class Name
                </label>
                <select
                  id="className"
                  name="className"
                  value={formData.className}
                  onChange={handleClassChange}
                  required
                  disabled={editId} // Disable class selection when editing
                >
                  <option value="">Select Class</option>
                  {getUniqueClasses().map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="sectionName">
                  <span className="label-icon">📋</span>
                  Section
                </label>
                <select
                  id="sectionName"
                  name="sectionName"
                  value={formData.sectionName}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.className || editId} // Disable section selection when editing
                >
                  <option value="">Select Section</option>
                  {formData.className && getUniqueSections(formData.className).map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="examDate">
                  <span className="label-icon">📅</span>
                  Exam Date
                </label>
                <input
                  id="examDate"
                  name="examDate"
                  type="date"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-btn">
                <span className="btn-icon">
                  {loading ? "⏳" : editId ? "💾" : "➕"}
                </span>
                {loading ? "Processing..." : editId ? "Update Exam" : "Create Exam"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  <span className="btn-icon">❌</span>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h2>
              <span className="table-icon">📊</span>
              Exam List ({Array.isArray(exams) ? exams.length : 0})
            </h2>
          </div>
          
          {loading && (!Array.isArray(exams) || exams.length === 0) ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading exams...</p>
            </div>
          ) : (!Array.isArray(exams) || exams.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No exams scheduled</h3>
              <p>Create your first exam to get started.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Exam Name</th>
                    <th>Type</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(exams) && exams.map((exam) => (
                    <tr key={exam.ExamID}>
                      <td>
                        <div className="exam-name">
                          <strong>{exam.ExamName}</strong>
                        </div>
                      </td>
                      <td>
                        <span className={`exam-badge ${getExamTypeBadge(exam.ExamType)}`}>
                          {exam.ExamType}
                        </span>
                      </td>
                      <td>{exam.ClassName || '-'}</td>
                      <td>{exam.Section || '-'}</td>
                      <td>
                        <span className="date-display">
                          {formatDate(exam.ExamDate)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(exam)}
                            disabled={loading}
                            title="Edit exam"
                          >
                            <span className="btn-icon">✏️</span>
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(exam.ExamID)}
                            disabled={loading}
                            title="Delete exam"
                          >
                            <span className="btn-icon">🗑️</span>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamsPage;