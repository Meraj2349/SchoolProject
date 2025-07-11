import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import "./StudentPage.css";

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [organizedStudents, setOrganizedStudents] = useState({});
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    DateOfBirth: "",
    Gender: "Male",
    Class: "",
    Section: "",
    RollNumber: "",
    AdmissionDate: "",
    Address: "",
    ParentContact: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const organizeStudentsByClass = (students) => {
    const organized = {};
    students.forEach((student) => {
      if (!organized[student.Class]) {
        organized[student.Class] = {};
      }
      if (!organized[student.Class][student.Section]) {
        organized[student.Class][student.Section] = [];
      }
      organized[student.Class][student.Section].push(student);
    });
    return organized;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/students");
      if (response.ok) {
        const result = await response.json();
        const studentsData = result.success ? result.data : result;
        setStudents(studentsData);
        setOrganizedStudents(organizeStudentsByClass(studentsData));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch students");
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
      "FirstName",
      "LastName",
      "DateOfBirth",
      "Gender",
      "Class",
      "Section",
      "RollNumber",
    ];
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        setError(`The field "${field}" is required.`);
        return false;
      }
    }
    if (formData.ParentContact && !/^\d{10,15}$/.test(formData.ParentContact)) {
      setError("Parent contact must be 10-15 digits");
      return false;
    }
    const currentDate = new Date();
    const dobDate = new Date(formData.DateOfBirth);
    if (dobDate >= currentDate) {
      setError("Date of birth must be in the past");
      return false;
    }
    setError(null);
    return true;
  };

  const resetForm = () => {
    setFormData({
      FirstName: "",
      LastName: "",
      DateOfBirth: "",
      Gender: "Male",
      Class: "",
      Section: "",
      RollNumber: "",
      AdmissionDate: "",
      Address: "",
      ParentContact: "",
    });
    setEditId(null);
  };

  const handleAddStudent = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          DateOfBirth: formData.DateOfBirth.split("T")[0],
          AdmissionDate: formData.AdmissionDate ? formData.AdmissionDate.split("T")[0] : undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to add student");
      }
      fetchStudents();
      resetForm();
      setSuccess(result.message || "Student added successfully!");
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
      FirstName: student.FirstName,
      LastName: student.LastName,
      DateOfBirth: student.DateOfBirth ? student.DateOfBirth.split("T")[0] : "",
      Gender: student.Gender,
      Class: student.Class,
      Section: student.Section,
      RollNumber: student.RollNumber || "",
      AdmissionDate: student.AdmissionDate ? student.AdmissionDate.split("T")[0] : "",
      Address: student.Address || "",
      ParentContact: student.ParentContact || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editId || !validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/students/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          DateOfBirth: formData.DateOfBirth.split("T")[0],
          AdmissionDate: formData.AdmissionDate ? formData.AdmissionDate.split("T")[0] : undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update student");
      }
      fetchStudents();
      resetForm();
      setSuccess(result.message || "Student updated successfully!");
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
      const response = await fetch(`http://localhost:3000/api/students/${studentID}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete student");
      }
      fetchStudents();
      setSuccess(result.message || "Student deleted successfully!");
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
            <label htmlFor="FirstName">First Name*</label>
            <input
              id="FirstName"
              name="FirstName"
              type="text"
              placeholder="Enter first name"
              value={formData.FirstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="LastName">Last Name*</label>
            <input
              id="LastName"
              name="LastName"
              type="text"
              placeholder="Enter last name"
              value={formData.LastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="RollNumber">Roll Number*</label>
            <input
              id="RollNumber"
              name="RollNumber"
              type="text"
              placeholder="Enter roll number"
              value={formData.RollNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="DateOfBirth">Date of Birth*</label>
            <input
              id="DateOfBirth"
              name="DateOfBirth"
              type="date"
              value={formData.DateOfBirth}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="Gender">Gender*</label>
            <select
              id="Gender"
              name="Gender"
              value={formData.Gender}
              onChange={handleInputChange}
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="Class">Class*</label>
            <input
              id="Class"
              name="Class"
              type="text"
              placeholder="Enter class"
              value={formData.Class}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="Section">Section*</label>
            <input
              id="Section"
              name="Section"
              type="text"
              placeholder="Enter section"
              value={formData.Section}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="AdmissionDate">Admission Date</label>
            <input
              id="AdmissionDate"
              name="AdmissionDate"
              type="date"
              value={formData.AdmissionDate}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="Address">Address</label>
            <textarea
              id="Address"
              name="Address"
              placeholder="Enter address"
              value={formData.Address}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="ParentContact">Parent Contact</label>
            <input
              id="ParentContact"
              name="ParentContact"
              type="tel"
              placeholder="Enter parent contact (10-15 digits)"
              value={formData.ParentContact}
              onChange={handleInputChange}
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
              {loading
                ? "Processing..."
                : editId
                ? "Save Changes"
                : "Add Student"}
            </button>
          </div>
        </div>
        <div className="class-section-container">
          <div className="class-wise-container">
            <h2>Students by Class and Section</h2>
            {loading && students.length === 0 ? (
              <p>Loading students...</p>
            ) : Object.keys(organizedStudents).length === 0 ? (
              <p>No students found</p>
            ) : (
              Object.keys(organizedStudents)
                .sort()
                .map((classNum) => (
                  <div key={classNum} className="class-group">
                    <h3>Class {classNum}</h3>
                    {Object.keys(organizedStudents[classNum])
                      .sort()
                      .map((section) => (
                        <div key={section} className="section-group">
                          <h4>Section: {section}</h4>
                          <table>
                            <thead>
                              <tr>
                                <th>Roll No.</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>Date of Birth</th>
                                <th>Gender</th>
                                <th>Parent Contact</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {organizedStudents[classNum][section].map(
                                (student) => (
                                  <tr key={student.StudentID}>
                                    <td>{student.RollNumber || '-'}</td>
                                    <td>{student.FirstName}</td>
                                    <td>{student.LastName}</td>
                                    <td>
                                      {new Date(
                                        student.DateOfBirth
                                      ).toLocaleDateString()}
                                    </td>
                                    <td>{student.Gender}</td>
                                    <td>{student.ParentContact || '-'}</td>
                                    <td className="action-buttons">
                                      <button
                                        className="edit-btn"
                                        onClick={() =>
                                          handleEditStudent(student)
                                        }
                                        disabled={loading}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="delete-btn"
                                        onClick={() =>
                                          handleDeleteStudent(student.StudentID)
                                        }
                                        disabled={loading}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      ))}
                  </div>
                ))
            )}
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
                  <th>Roll No.</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Admission Date</th>
                  <th>Parent Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.StudentID}>
                    <td>{student.RollNumber || '-'}</td>
                    <td>{student.FirstName}</td>
                    <td>{student.LastName}</td>
                    <td>
                      {new Date(student.DateOfBirth).toLocaleDateString()}
                    </td>
                    <td>{student.Gender}</td>
                    <td>{student.Class}</td>
                    <td>{student.Section}</td>
                    <td>
                      {student.AdmissionDate ? new Date(student.AdmissionDate).toLocaleDateString() : '-'}
                    </td>
                    <td>{student.ParentContact || '-'}</td>
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