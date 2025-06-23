import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "../../../components/Sidebar";
import "./ClassesPage.css";

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    className: "",
    section: "",
    teacherId: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Check admin authentication
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Fetch all classes and teachers
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch("http://localhost:3000/api/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }

      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setError("Failed to fetch classes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("http://localhost:3000/api/teachers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.className || !formData.section || !formData.teacherId) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const url = editId 
        ? `http://localhost:3000/api/classes/edit/${editId}`
        : "http://localhost:3000/api/classes/add";
      
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          className: formData.className,
          section: formData.section,
          teacherId: formData.teacherId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      fetchClasses();
      resetForm();
      setSuccess(editId ? "Class updated successfully" : "Class added successfully");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || `Failed to ${editId ? "update" : "add"} class`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(`http://localhost:3000/api/classes/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete class");
      }

      fetchClasses();
      setSuccess("Class deleted successfully");
    } catch (error) {
      console.error("Error deleting class:", error);
      setError(error.message || "Failed to delete class");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      className: "",
      section: "",
      teacherId: ""
    });
    setEditId(null);
  };

  const handleEdit = (cls) => {
    setEditId(cls.ClassID);
    setFormData({
      className: cls.ClassName,
      section: cls.Section,
      teacherId: cls.TeacherID.toString()
    });
  };

  return (
    <div className="classes-page">
      <Sidebar />
      <div className="content">
        <h1 className="page-title">Manage Classes</h1>

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

        <div className="form-container">
          <h2>{editId ? "Edit Class" : "Add Class"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="className">Class Name</label>
              <input
                id="className"
                name="className"
                type="text"
                placeholder="Enter class name"
                value={formData.className}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="section">Section</label>
              <input
                id="section"
                name="section"
                type="text"
                placeholder="Enter section"
                value={formData.section}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="teacherId">Teacher</label>
              <select
                id="teacherId"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map(teacher => (
                  <option key={teacher.TeacherID} value={teacher.TeacherID}>
                    {teacher.FirstName} {teacher.LastName}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : editId ? "Save Changes" : "Add Class"}
            </button>
            {editId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <div className="table-container">
          <h2>Class List</h2>
          {loading && classes.length === 0 ? (
            <p>Loading classes...</p>
          ) : classes.length === 0 ? (
            <p>No classes found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Section</th>
                  <th>Teacher</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls.ClassID}>
                    <td>{cls.ClassName}</td>
                    <td>{cls.Section}</td>
                    <td>{cls.TeacherFirstName ? `${cls.TeacherFirstName} ${cls.TeacherLastName}` : "Not assigned"}</td>
                    <td>
                      <button onClick={() => handleEdit(cls)}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(cls.ClassID)}>
                        Delete
                      </button>
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

export default ClassesPage;