import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import eventsApi from "../../../api/eventsApi";
import Sidebar from "../../../components/Sidebar";
import "./EventsPage.css";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    eventName: "",
    eventType: "",
    startDate: "",
    endDate: "",
    venue: "",
    description: ""
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Valid event types
  const EVENT_TYPES = ['Academic', 'Sports', 'Cultural', 'Other'];

  // Check admin authentication
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventsApi.getAllEvents();
      console.log("Events API response:", response);
      
      // Handle different response structures
      let eventsData = [];
      if (Array.isArray(response)) {
        eventsData = response;
      } else if (response && Array.isArray(response.data)) {
        eventsData = response.data;
      }
      
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error.message || "Failed to fetch events. Please try again.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { eventName, eventType, startDate, endDate } = formData;
    
    if (!eventName.trim()) {
      setError("Event name is required.");
      return false;
    }
    
    if (!eventType) {
      setError("Event type is required.");
      return false;
    }
    
    if (!startDate) {
      setError("Start date is required.");
      return false;
    }
    
    if (!endDate) {
      setError("End date is required.");
      return false;
    }

    // Validate date relationship
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.");
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
        // Update existing event
        await eventsApi.updateEvent(editId, formData);
        setSuccess("Event updated successfully!");
      } else {
        // Create new event
        await eventsApi.addEvent(formData);
        setSuccess("Event created successfully!");
      }
      
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || `Failed to ${editId ? "update" : "create"} event`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setLoading(true);
    try {
      await eventsApi.deleteEvent(eventId);
      fetchEvents();
      setSuccess("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      setError(error.message || "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      eventName: "",
      eventType: "",
      startDate: "",
      endDate: "",
      venue: "",
      description: ""
    });
    setEditId(null);
  };

  const handleEdit = (event) => {
    setEditId(event.EventID);
    setFormData({
      eventName: event.EventName,
      eventType: event.EventType,
      startDate: event.StartDate ? event.StartDate.split('T')[0] : "",
      endDate: event.EndDate ? event.EndDate.split('T')[0] : "",
      venue: event.Venue || "",
      description: event.Description || ""
    });
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

  // Get event type badge class
  const getEventTypeBadge = (eventType) => {
    const badges = {
      'Academic': 'badge-blue',
      'Sports': 'badge-green',
      'Cultural': 'badge-purple',
      'Other': 'badge-gray'
    };
    return badges[eventType] || 'badge-gray';
  };

  return (
    <div className="events-page">
      <Sidebar />
      <div className="content">
        <h1 className="page-title">Manage Events</h1>

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
            {editId ? "Edit Event" : "Create New Event"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="eventName">
                  <span className="label-icon">📚</span>
                  Event Name *
                </label>
                <input
                  id="eventName"
                  name="eventName"
                  type="text"
                  placeholder="Enter event name"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventType">
                  <span className="label-icon">🏷️</span>
                  Event Type *
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Event Type</option>
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">
                  <span className="label-icon">📅</span>
                  Start Date *
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  <span className="label-icon">📅</span>
                  End Date *
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate} // Prevent end date before start date
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="venue">
                  <span className="label-icon">📍</span>
                  Venue
                </label>
                <input
                  id="venue"
                  name="venue"
                  type="text"
                  placeholder="Enter venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">
                  <span className="label-icon">📄</span>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter event description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-btn">
                <span className="btn-icon">
                  {loading ? "⏳" : editId ? "💾" : "➕"}
                </span>
                {loading ? "Processing..." : editId ? "Update Event" : "Create Event"}
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
              Events List ({Array.isArray(events) ? events.length : 0})
            </h2>
          </div>
          
          {loading && (!Array.isArray(events) || events.length === 0) ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading events...</p>
            </div>
          ) : (!Array.isArray(events) || events.length === 0) ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No events scheduled</h3>
              <p>Create your first event to get started.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Venue</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(events) && events.map((event) => (
                    <tr key={event.EventID}>
                      <td>
                        <div className="event-name">
                          <strong>{event.EventName}</strong>
                          {event.Description && (
                            <div className="event-description">
                              {event.Description.length > 50 
                                ? `${event.Description.substring(0, 50)}...`
                                : event.Description
                              }
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`event-badge ${getEventTypeBadge(event.EventType)}`}>
                          {event.EventType}
                        </span>
                      </td>
                      <td>
                        <span className="date-display">
                          {formatDate(event.StartDate)}
                        </span>
                      </td>
                      <td>
                        <span className="date-display">
                          {formatDate(event.EndDate)}
                        </span>
                      </td>
                      <td>{event.Venue || '-'}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => handleEdit(event)}
                            disabled={loading}
                            title="Edit event"
                          >
                            <span className="btn-icon">✏️</span>
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(event.EventID)}
                            disabled={loading}
                            title="Delete event"
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

export default EventsPage;