import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Sidebar from "../../../components/Sidebar";
import "./MessagesPage.css";

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    messages: "", // Matches backend field name
    show: false,  // Matches backend field name
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

  // Fetch all messages
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch("http://localhost:3000/api/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to fetch messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.messages.trim()) {
      setError("Message content is required.");
      return;
    }

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const url = editId
        ? `http://localhost:3000/api/messages/edit/${editId}`
        : "http://localhost:3000/api/messages/add";
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
        throw new Error(errorData.message || "Operation failed");
      }

      fetchMessages();
      resetForm();
      setSuccess(editId ? "Message updated successfully" : "Message added successfully");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || `Failed to ${editId ? "update" : "add"} message`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    setLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await fetch(`http://localhost:3000/api/messages/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      fetchMessages();
      setSuccess("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message:", error);
      setError(error.message || "Failed to delete message");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (message) => {
    setEditId(message.MessageID);
    setFormData({
      messages: message.Messages,
      show: message.Show,
    });
  };

  const resetForm = () => {
    setFormData({
      messages: "",
      show: false,
    });
    setEditId(null);
  };

  const handleToggleVisibility = async (id, currentVisibility) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`http://localhost:3000/api/messages/toggle-visibility/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ show: !currentVisibility }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle visibility");
      }

      fetchMessages();
      setSuccess("Visibility updated successfully");
    } catch (error) {
      console.error("Error toggling visibility:", error);
      setError("Failed to update visibility");
    }
  };

  return (
    <div className="messages-page">
      <Sidebar />
      <div className="content">
        <h1 className="page-title">Manage Messages</h1>

        {success && (
          <div className="alert success" onClick={() => setSuccess(null)}>
            <span>{success}</span>
            <button className="close-btn">&times;</button>
          </div>
        )}
        {error && (
          <div className="alert error" onClick={() => setError(null)}>
            <span>{error}</span>
            <button className="close-btn">&times;</button>
          </div>
        )}

        <div className="form-container">
          <h2>{editId ? "Edit Message" : "Add Message"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="messages">Message Content</label>
              <textarea
                id="messages"
                name="messages"
                placeholder="Enter your message here"
                value={formData.messages}
                onChange={handleInputChange}
                required
                rows="4"
              />
            </div>
            <div className="form-group checkbox-group">
              <input
                id="show"
                name="show"
                type="checkbox"
                checked={formData.show}
                onChange={handleInputChange}
              />
              <label htmlFor="show">Visible to users</label>
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="primary-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : editId ? (
                  "Update Message"
                ) : (
                  "Add Message"
                )}
              </button>
              {editId && (
                <button 
                  type="button" 
                  className="secondary-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="table-container">
          <h2>Message List</h2>
          {loading && messages.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <p>No messages found</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Message Content</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((message) => (
                    <tr key={message.MessageID}>
                      <td>{message.Messages}</td>
                      <td>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={message.Show}
                            onChange={() => handleToggleVisibility(message.MessageID, message.Show)}
                          />
                          <span className="slider"></span>
                        </label>
                      </td>
                      <td className="actions">
                        <button 
                          className="edit-btn"
                          onClick={() => handleEdit(message)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(message.MessageID)}
                        >
                          Delete
                        </button>
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

export default MessagesPage;