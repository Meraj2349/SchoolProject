import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "../../../components/Sidebar";
import "./StudentPage.css";

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "Male",
    class: "",
    section: "",
    admissionDate: "",
    address: "",
    parentContact: "",
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

  // Fetch all students
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch("http://localhost:3000/api/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        throw new Error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to fetch students. Please try again.");
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
      "dateOfBirth",
      "gender",
      "class",
      "section",
      "admissionDate",
      "address",
      "parentContact",
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        setError(`The field "${field}" is required.`);
        return false;
      }
    }

    // Validate parent contact format
    if (!/^\d{10,15}$/.test(formData.parentContact)) {
      setError("Parent contact must be 10-15 digits");
      return false;
    }

    setError(null);
    return true;
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "Male",
      class: "",
      section: "",
      admissionDate: "",
      address: "",
      parentContact: "",
    });
    setEditId(null);
  };

  const prepareBackendData = () => {
    return {
      FirstName: formData.firstName,
      LastName: formData.lastName,
      DateOfBirth: formData.dateOfBirth.split("T")[0],
      Gender: formData.gender,
      Class: formData.class,
      Section: formData.section,
      AdmissionDate: formData.admissionDate.split("T")[0],
      Address: formData.address,
      ParentContact: formData.parentContact
    };
  };

  const handleAddStudent = async () => {
    if (!validateForm()) return;

    const backendFormData = prepareBackendData();
    console.log("Submitting to backend:", backendFormData);

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/students/addStudents`,
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
        throw new Error(errorData.message || "Failed to add student");
      }

      const data = await response.json();
      fetchStudents();
      resetForm();
      setSuccess(data.message || "Student added successfully!");
    } catch (error) {
      console.error("Error adding student:", error);
      setError(error.message || "Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditId(student.StudentID);
    setFormData({
      firstName: student.FirstName,
      lastName: student.LastName,
      dateOfBirth: student.DateOfBirth ? student.DateOfBirth.split("T")[0] : "",
      gender: student.Gender,
      class: student.Class,
      section: student.Section,
      admissionDate: student.AdmissionDate ? student.AdmissionDate.split("T")[0] : "",
      address: student.Address,
      parentContact: student.ParentContact,
    });
  };

  const handleSaveEdit = async () => {
    if (!editId || !validateForm()) return;

    const backendFormData = prepareBackendData();

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/students/updateStudent/${editId}`,
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
        throw new Error(errorData.message || "Failed to update student");
      }

      const data = await response.json();
      fetchStudents();
      resetForm();
      setSuccess(data.message || "Student updated successfully!");
    } catch (error) {
      console.error("Error updating student:", error);
      setError(error.message || "Failed to update student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentID) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/students/deleteStudent/${studentID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete student");
      }

      const data = await response.json();
      fetchStudents();
      setSuccess(data.message || "Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
      setError(error.message || "Failed to delete student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-page">
      <Sidebar />
      <div className="content">
        <h1 className="page-title">Manage Students</h1>

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
          <h2>{editId ? "Edit Student" : "Add Student"}</h2>
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
            <label htmlFor="dateOfBirth">Date of Birth*</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender*</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="class">Class*</label>
            <input
              id="class"
              name="class"
              type="text"
              placeholder="Enter class"
              value={formData.class}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="section">Section*</label>
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
            <label htmlFor="admissionDate">Admission Date*</label>
            <input
              id="admissionDate"
              name="admissionDate"
              type="date"
              value={formData.admissionDate}
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
          <div className="form-group">
            <label htmlFor="parentContact">Parent Contact*</label>
            <input
              id="parentContact"
              name="parentContact"
              type="tel"
              placeholder="Enter parent contact (10-15 digits)"
              value={formData.parentContact}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-actions">
            {editId && (
              <button className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button
              className={editId ? "save-btn" : "add-btn"}
              onClick={editId ? handleSaveEdit : handleAddStudent}
              disabled={loading}
            >
              {loading ? "Processing..." : editId ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </div>

        <div className="table-container">
          <h2>Student List</h2>
          {loading && students.length === 0 ? (
            <p>Loading students...</p>
          ) : students.length === 0 ? (
            <p>No students found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Admission Date</th>
                  <th>Address</th>
                  <th>Parent Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.StudentID}>
                    <td>{student.FirstName}</td>
                    <td>{student.LastName}</td>
                    <td>{new Date(student.DateOfBirth).toLocaleDateString()}</td>
                    <td>{student.Gender}</td>
                    <td>{student.Class}</td>
                    <td>{student.Section}</td>
                    <td>{new Date(student.AdmissionDate).toLocaleDateString()}</td>
                    <td>{student.Address}</td>
                    <td>{student.ParentContact}</td>
                    <td className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditStudent(student)}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteStudent(student.StudentID)}
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

export default StudentPage;