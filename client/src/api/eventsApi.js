// api/eventsApi.js
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:3000/api/events";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Get all events
export const getAllEvents = async () => {
  try {
    const response = await fetch(API_BASE_URL, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch events");
    }

    const data = await response.json();
    return data.data; // Return the events array
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${eventId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch event");
    }

    const data = await response.json();
    return data.data; // Return the event object
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

// Add new event
export const addEvent = async (eventData) => {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add event");
    }

    const data = await response.json();
    return data; // Return the full response
  } catch (error) {
    console.error("Error adding event:", error);
    throw error;
  }
};

// Update event
export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${eventId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update event");
    }

    const data = await response.json();
    return data; // Return the full response
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

// Delete event
export const deleteEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${eventId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete event");
    }

    const data = await response.json();
    return data; // Return the full response
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// Get events by date range
export const getEventsByDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(`${API_BASE_URL}/date-range?startDate=${startDate}&endDate=${endDate}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch events by date range");
    }

    const data = await response.json();
    return data.data; // Return the events array
  } catch (error) {
    console.error("Error fetching events by date range:", error);
    throw error;
  }
};

// Get events by type
export const getEventsByType = async (eventType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/type/${eventType}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch events by type");
    }

    const data = await response.json();
    return data.data; // Return the events array
  } catch (error) {
    console.error("Error fetching events by type:", error);
    throw error;
  }
};

// Default export object for easier imports
const eventsApi = {
  getAllEvents,
  getEventById,
  addEvent,
  updateEvent,
  deleteEvent,
  getEventsByDateRange,
  getEventsByType
};

export default eventsApi;