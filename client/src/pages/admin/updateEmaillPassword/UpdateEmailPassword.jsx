import React, { useState } from "react";
import Cookies from "js-cookie";
import Sidebar from "../../../components/Sidebar";
import "./UpdateEmailPasswordPage.css";

const UpdateEmailPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Password validation
    if (formData.newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters");
      return;
    }

    try {
      const token = Cookies.get("token");
      if (!token) {
        setErrorMessage("You must be logged in to perform this action");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/api/admin/updateEmailPassword",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update credentials");
      }

      setSuccessMessage(data.message);
      setFormData({
        email: "",
        currentPassword: "",
        newPassword: "",
      });
    } catch (error) {
      console.error("Update error:", error);
      setErrorMessage(error.message || "An error occurred. Please try again.");
    }
  };

  return (
    <div className="update-email-password-page">
      <Sidebar />
      <div className="content">
        <h1>Update Email and Password</h1>
        {successMessage && <div className="alert success">{successMessage}</div>}
        {errorMessage && <div className="alert error">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">New Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter new email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password (min 8 characters)</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleInputChange}
              minLength="8"
              required
            />
          </div>
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateEmailPassword;