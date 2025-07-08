import { useEffect, useState } from "react";
import { addSubject, deleteSubject, getAllClasses, getAllSubjects, updateSubject } from "../../../api/subjectsApi";
import Sidebar from "../../../components/Sidebar";
import "./SubjectsPage.css";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(''); // For filtering
  const [formData, setFormData] = useState({
    subjectName: "",
    className: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all subjects
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to fetch subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all classes
  const fetchClasses = async () => {
    try {
      const data = await getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError("Failed to fetch classes. Please try again.");
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subjectName.trim() || !formData.className.trim()) {
      setError("Subject name and class name are required.");
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        await updateSubject(editId, formData);
        setSuccess("Subject updated successfully");
      } else {
        await addSubject(formData);
        setSuccess("Subject added successfully");
      }

      await fetchSubjects();
      await fetchClasses(); // Refresh classes in case a new one was created
      resetForm();
    } catch (error) {
      console.error("Error saving subject:", error);
      setError(error.message || "Failed to save subject.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete action
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    setLoading(true);
    try {
      await deleteSubject(id);
      await fetchSubjects();
      setSuccess("Subject deleted successfully");
    } catch (error) {
      console.error("Error deleting subject:", error);
      setError(error.message || "Failed to delete subject.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit action
  const handleEdit = (subject) => {
    setEditId(subject.SubjectID);
    setFormData({
      subjectName: subject.SubjectName,
      className: subject.ClassName,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      subjectName: "",
      className: "",
    });
    setEditId(null);
    setError(null);
    setSuccess(null);
  };

  // Get filtered subjects
  const getFilteredSubjects = () => {
    if (!selectedClass) return subjects;
    return subjects.filter(subject => subject.ClassName === selectedClass);
  };

  // Get unique class names from subjects
  const getUniqueClassNames = () => {
    const classNames = [...new Set(subjects.map(subject => subject.ClassName))];
    return classNames.sort();
  };

  return (
    <div className="subjects-page">
      <Sidebar />
      <div className="content">
        <h1>Manage Subjects</h1>

        {success && (
          <div className="alert success" onClick={() => setSuccess(null)}>
            {success}
          </div>
        )}
        {error && (
          <div className="alert error" onClick={() => setError(null)}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="subjectName">Subject Name</label>
            <input
              type="text"
              id="subjectName"
              name="subjectName"
              placeholder="Enter subject name"
              value={formData.subjectName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="className">Class</label>
            <select
              id="className"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls.ClassName} value={cls.ClassName}>
                  {cls.ClassName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : editId ? "Update Subject" : "Add Subject"}
            </button>
            {editId && (
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="table-container">
          <div className="table-header">
            <h2>Subject List</h2>
            <div className="class-filter">
              <label htmlFor="classFilter">Filter by Class:</label>
              <select 
                id="classFilter" 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {getUniqueClassNames().map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {loading && subjects.length === 0 ? (
            <p>Loading subjects...</p>
          ) : getFilteredSubjects().length === 0 ? (
            <p>{selectedClass ? `No subjects found for ${selectedClass}` : "No subjects found"}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Class Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredSubjects().map((subject) => (
                  <tr key={subject.SubjectID}>
                    <td>{subject.SubjectName}</td>
                    <td>{subject.ClassName}</td>
                    <td>
                      <button onClick={() => handleEdit(subject)}>Edit</button>
                      <button onClick={() => handleDelete(subject.SubjectID)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;