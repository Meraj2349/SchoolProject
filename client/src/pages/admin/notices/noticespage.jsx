import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import "./NoticesPage.css";

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for token and redirect if not authenticated
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Fetch notices
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch("http://localhost:3000/api/notices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notices");
      }

      const data = await response.json();
      setNotices(data);
    } catch (error) {
      console.error("Error fetching notices:", error);
      setError("Failed to fetch notices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotice = async () => {
    if (!title || !description) {
      setError("Title and description are required");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch("http://localhost:3000/api/notices/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add notice");
      }

      fetchNotices();
      setTitle("");
      setDescription("");
      setSuccess("Notice added successfully");
    } catch (error) {
      console.error("Error adding notice:", error);
      setError(error.message || "Failed to add notice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotice = (notice) => {
    setEditId(notice.NoticeID);
    setTitle(notice.Title);
    setDescription(notice.Description);
  };

  const handleSaveEdit = async () => {
    if (!editId) {
      setError("No notice selected for editing.");
      return;
    }

    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/notices/edit/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update notice");
      }

      fetchNotices();
      setEditId(null);
      setTitle("");
      setDescription("");
      setSuccess("Notice updated successfully");
    } catch (error) {
      console.error("Error updating notice:", error);
      setError(error.message || "Failed to update notice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/notices/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete notice");
      }

      fetchNotices();
      setSuccess("Notice deleted successfully");
    } catch (error) {
      console.error("Error deleting notice:", error);
      setError(error.message || "Failed to delete notice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (id, currentVisibility) => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/notices/toggle-visibility/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ show: !currentVisibility }), // Toggle the visibility
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to toggle visibility");
      }

      fetchNotices(); // Refresh the notices list
      setSuccess("Notice visibility updated successfully.");
    } catch (error) {
      console.error("Error toggling visibility:", error);
      setError(
        error.message || "Failed to toggle visibility. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notices-page">
      <Sidebar />
      <div className="content">
        <h1 className="page-title">Manage Notices</h1>

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
          <h2>{editId ? "Edit Notice" : "Add Notice"}</h2>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter notice title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter notice description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <button onClick={editId ? handleSaveEdit : handleAddNotice}>
            {editId ? "Save Changes" : "Add Notice"}
          </button>
          {editId && (
            <button
              className="cancel-btn"
              onClick={() => {
                setEditId(null);
                setTitle("");
                setDescription("");
              }}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="table-container">
          <h2>Manage Notices</h2>
          {loading && notices.length === 0 ? (
            <p>Loading notices...</p>
          ) : notices.length === 0 ? (
            <p>No notices found</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Actions</th>
                  <th>Visibility</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((notice) => (
                  <tr key={notice.NoticeID}>
                    <td>{notice.Title}</td>
                    <td>{notice.Description}</td>
                    <td>
                      <button onClick={() => handleEditNotice(notice)}>
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteNotice(notice.NoticeID)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={notice.Show}
                        onChange={() =>
                          handleToggleVisibility(notice.NoticeID, notice.Show)
                        }
                      />
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

export default NoticesPage;