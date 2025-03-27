import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "../../../components/Sidebar";
import "./TeacherPage.css";

const TeacherPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    subject: "",
    contactNumber: "",
    email: "",
    joiningDate: "",
    address: "",
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

  // Fetch all teachers
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
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
      } else {
        throw new Error("Failed to fetch teachers");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setError("Failed to fetch teachers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "subject",
      "contactNumber",
      "email",
      "joiningDate",
      "address",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        setError(`The field "${field}" is required.`);
        return false;
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate contact number format (basic validation)
    if (!/^[\d-]{10,15}$/.test(formData.contactNumber)) {
      setError("Please enter a valid contact number (10-15 digits)");
      return false;
    }

    setError(null);
    return true;
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      subject: "",
      contactNumber: "",
      email: "",
      joiningDate: "",
      address: "",
    });
    setEditId(null);
  };

  const prepareBackendData = () => {
    return {
      FirstName: formData.firstName,
      LastName: formData.lastName,
      Subject: formData.subject,
      ContactNumber: formData.contactNumber,
      Email: formData.email,
      JoiningDate: formData.joiningDate.split("T")[0],
      Address: formData.address
    };
  };

  const handleAddTeacher = async () => {
    if (!validateForm()) return;

    const backendFormData = prepareBackendData();
    console.log("Submitting to backend:", backendFormData);

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        "http://localhost:3000/api/teachers/addTeacher",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(backendFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add teacher");
      }

      const data = await response.json();
      fetchTeachers();
      resetForm();
      setSuccess(data.message || "Teacher added successfully!");
    } catch (error) {
      console.error("Error adding teacher:", error);
      setError(error.message || "Failed to add teacher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditId(teacher.TeacherID);
    setFormData({
      firstName: teacher.FirstName,
      lastName: teacher.LastName,
      subject: teacher.Subject,
      contactNumber: teacher.ContactNumber,
      email: teacher.Email,
      joiningDate: teacher.JoiningDate ? teacher.JoiningDate.split("T")[0] : "",
      address: teacher.Address,
    });
  };

  const handleSaveEdit = async () => {
    if (!editId || !validateForm()) return;

    const backendFormData = prepareBackendData();

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/teachers/updateTeacher/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(backendFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update teacher");
      }

      const data = await response.json();
      fetchTeachers();
      resetForm();
      setSuccess(data.message || "Teacher updated successfully!");
    } catch (error) {
      console.error("Error updating teacher:", error);
      setError(error.message || "Failed to update teacher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherID) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/teachers/deleteTeacher/${teacherID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete teacher");
      }

      const data = await response.json();
      fetchTeachers();
      setSuccess(data.message || "Teacher deleted successfully!");
    } catch (error) {
      console.error("Error deleting teacher:", error);
      setError(error.message || "Failed to delete teacher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-page">
      <Sidebar />
      <div className="content">
        <h1 className="page-title">Manage Teachers</h1>

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
          <h2>{editId ? "Edit Teacher" : "Add Teacher"}</h2>
          <div className="form-group">
            <label htmlFor="firstName">First Name*</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name*</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject*</label>
            <input
              id="subject"
              name="subject"
              type="text"
              placeholder="Enter subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number*</label>
            <input
              id="contactNumber"
              name="contactNumber"
              type="text"
              placeholder="Enter contact number (e.g., 123-456-7890)"
              value={formData.contactNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email*</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="joiningDate">Joining Date*</label>
            <input
              id="joiningDate"
              name="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address*</label>
            <textarea
              id="address"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <div className="form-actions">
            {editId && (
              <button className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button
              className={editId ? "save-btn" : "add-btn"}
              onClick={editId ? handleSaveEdit : handleAddTeacher}
              disabled={loading}
            >
              {loading ? "Processing..." : editId ? "Save Changes" : "Add Teacher"}
            </button>
          </div>
        </div>

        <div className="table-container">
          <h2>Teacher List</h2>
          {loading && teachers.length === 0 ? (
            <p>Loading teachers...</p>
          ) : teachers.length === 0 ? (
            <p>No teachers found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Subject</th>
                  <th>Contact Number</th>
                  <th>Email</th>
                  <th>Joining Date</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.TeacherID}>
                    <td>{teacher.FirstName}</td>
                    <td>{teacher.LastName}</td>
                    <td>{teacher.Subject}</td>
                    <td>{teacher.ContactNumber}</td>
                    <td>{teacher.Email}</td>
                    <td>{new Date(teacher.JoiningDate).toLocaleDateString()}</td>
                    <td>{teacher.Address}</td>
                    <td className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditTeacher(teacher)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteTeacher(teacher.TeacherID)}
                        disabled={loading}
                      >
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

export default TeacherPage;