import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import Cookies from "js-cookie";
import "./SubjectsPage.css";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    subjectName: "",
    classId: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch all subjects
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Unauthorized. Please log in.");
        return;
      }

      const response = await fetch("http://localhost:3000/api/subjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch subjects");
      }

      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to fetch subjects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
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

    if (!formData.subjectName.trim() || !formData.classId) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Unauthorized. Please log in.");
        return;
      }

      const url = editId
        ? `http://localhost:3000/api/subjects/edit/${editId}`
        : "http://localhost:3000/api/subjects/add";
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save subject");
      }

      fetchSubjects();
      resetForm();
      setSuccess(editId ? "Subject updated successfully" : "Subject added successfully");
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
      const token = Cookies.get("token");
      if (!token) {
        setError("Unauthorized. Please log in.");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/subjects/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete subject");
      }

      fetchSubjects();
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
      classId: subject.ClassID,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      subjectName: "",
      classId: "",
    });
    setEditId(null);
    setError(null);
    setSuccess(null);
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
            <label htmlFor="classId">Class ID</label>
            <input
              type="number"
              id="classId"
              name="classId"
              placeholder="Enter class ID"
              value={formData.classId}
              onChange={handleInputChange}
              required
            />
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
          <h2>Subject List</h2>
          {loading && subjects.length === 0 ? (
            <p>Loading subjects...</p>
          ) : subjects.length === 0 ? (
            <p>No subjects found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Class Name</th>
                  <th>Section</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.SubjectID}>
                    <td>{subject.SubjectName}</td>
                    <td>{subject.ClassName}</td>
                    <td>{subject.Section}</td>
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