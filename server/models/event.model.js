import db from "../config/db.config.js";

/**
 * Event Model for School Management System
 * 
 * Database Schema:
 * CREATE TABLE Events (
 *     EventID INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
 *     EventName VARCHAR(100) NOT NULL,
 *     EventType ENUM('Academic', 'Sports', 'Cultural', 'Other') NOT NULL DEFAULT 'Other',
 *     StartDate DATE NOT NULL,
 *     EndDate DATE NOT NULL,
 *     Venue VARCHAR(100),
 *     Description TEXT,
 *     CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */

// Valid event types from database schema
const VALID_EVENT_TYPES = ['Academic', 'Sports', 'Cultural', 'Other'];

// Get all events
const getAllEvents = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        EventID,
        EventName,
        EventType,
        StartDate,
        EndDate,
        Venue,
        Description,
        CreatedAt,
        UpdatedAt
      FROM Events
      ORDER BY StartDate ASC, CreatedAt DESC
    `);
    return rows;
  } catch (err) {
    throw new Error("Error fetching events: " + err.message);
  }
};

// Get event by ID
const getEventById = async (eventId) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const [rows] = await db.query(`
      SELECT 
        EventID,
        EventName,
        EventType,
        StartDate,
        EndDate,
        Venue,
        Description,
        CreatedAt,
        UpdatedAt
      FROM Events
      WHERE EventID = ?
    `, [eventId]);
    
    return rows[0] || null;
  } catch (err) {
    throw new Error("Error fetching event by ID: " + err.message);
  }
};

// Add new event
const addEvent = async (eventData) => {
  try {
    const { 
      eventName, 
      eventType, 
      startDate, 
      endDate, 
      venue, 
      description 
    } = eventData;

    // Validate required fields
    if (!eventName || !eventType || !startDate || !endDate) {
      throw new Error("Event name, type, start date, and end date are required");
    }

    // Validate event type
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      throw new Error(`Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}`);
    }

    // Validate event name length
    if (eventName.length > 100) {
      throw new Error("Event name cannot exceed 100 characters");
    }

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    if (endDateObj < startDateObj) {
      throw new Error("End date cannot be before start date");
    }

    // Validate venue length if provided
    if (venue && venue.length > 100) {
      throw new Error("Venue name cannot exceed 100 characters");
    }

    // Insert the event
    const [result] = await db.query(`
      INSERT INTO Events (EventName, EventType, StartDate, EndDate, Venue, Description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [eventName.trim(), eventType, startDate, endDate, venue?.trim() || null, description?.trim() || null]);

    return {
      success: true,
      eventId: result.insertId,
      message: `Event '${eventName}' created successfully`,
      data: {
        EventID: result.insertId,
        EventName: eventName.trim(),
        EventType: eventType,
        StartDate: startDate,
        EndDate: endDate,
        Venue: venue?.trim() || null,
        Description: description?.trim() || null
      }
    };
  } catch (err) {
    throw new Error("Error adding event: " + err.message);
  }
};

// Update event
const updateEvent = async (eventId, eventData) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    // Check if event exists
    const [existingEvent] = await db.query(`
      SELECT * FROM Events WHERE EventID = ?
    `, [eventId]);

    if (existingEvent.length === 0) {
      throw new Error("Event not found");
    }

    const { eventName, eventType, startDate, endDate, venue, description } = eventData;
    const updates = [];
    const params = [];

    // Build dynamic update query
    if (eventName !== undefined) {
      if (!eventName || eventName.trim().length === 0) {
        throw new Error("Event name cannot be empty");
      }
      if (eventName.length > 100) {
        throw new Error("Event name cannot exceed 100 characters");
      }
      updates.push("EventName = ?");
      params.push(eventName.trim());
    }

    if (eventType !== undefined) {
      if (!VALID_EVENT_TYPES.includes(eventType)) {
        throw new Error(`Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}`);
      }
      updates.push("EventType = ?");
      params.push(eventType);
    }

    if (startDate !== undefined) {
      const startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        throw new Error("Invalid start date format. Use YYYY-MM-DD");
      }
      updates.push("StartDate = ?");
      params.push(startDate);
    }

    if (endDate !== undefined) {
      const endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        throw new Error("Invalid end date format. Use YYYY-MM-DD");
      }
      updates.push("EndDate = ?");
      params.push(endDate);
    }

    // Validate date relationship if both dates are being updated
    if (startDate !== undefined && endDate !== undefined) {
      if (new Date(endDate) < new Date(startDate)) {
        throw new Error("End date cannot be before start date");
      }
    }

    if (venue !== undefined) {
      if (venue && venue.length > 100) {
        throw new Error("Venue name cannot exceed 100 characters");
      }
      updates.push("Venue = ?");
      params.push(venue?.trim() || null);
    }

    if (description !== undefined) {
      updates.push("Description = ?");
      params.push(description?.trim() || null);
    }

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    // Perform update
    params.push(eventId);
    const [result] = await db.query(`
      UPDATE Events 
      SET ${updates.join(', ')}
      WHERE EventID = ?
    `, params);

    if (result.affectedRows === 0) {
      throw new Error("No rows were updated");
    }

    return {
      success: true,
      message: "Event updated successfully",
      affectedRows: result.affectedRows
    };
  } catch (err) {
    throw new Error("Error updating event: " + err.message);
  }
};

// Delete event
const deleteEvent = async (eventId) => {
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    // Check if event exists
    const eventInfo = await getEventById(eventId);
    if (!eventInfo) {
      throw new Error("Event not found");
    }

    // Delete the event
    const [result] = await db.query(`
      DELETE FROM Events WHERE EventID = ?
    `, [eventId]);

    if (result.affectedRows === 0) {
      throw new Error("No event was deleted");
    }

    return {
      success: true,
      message: `Event '${eventInfo.EventName}' has been deleted successfully`,
      deletedEvent: {
        EventID: eventId,
        EventName: eventInfo.EventName,
        EventType: eventInfo.EventType,
        StartDate: eventInfo.StartDate,
        EndDate: eventInfo.EndDate,
        Venue: eventInfo.Venue,
        Description: eventInfo.Description
      }
    };
  } catch (err) {
    throw new Error("Error deleting event: " + err.message);
  }
};

// Get events by date range
const getEventsByDateRange = async (startDate, endDate) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        EventID,
        EventName,
        EventType,
        StartDate,
        EndDate,
        Venue,
        Description,
        CreatedAt,
        UpdatedAt
      FROM Events
      WHERE StartDate >= ? AND EndDate <= ?
      ORDER BY StartDate ASC
    `, [startDate, endDate]);
    
    return rows;
  } catch (err) {
    throw new Error("Error fetching events by date range: " + err.message);
  }
};

// Get events by type
const getEventsByType = async (eventType) => {
  try {
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      throw new Error(`Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}`);
    }

    const [rows] = await db.query(`
      SELECT 
        EventID,
        EventName,
        EventType,
        StartDate,
        EndDate,
        Venue,
        Description,
        CreatedAt,
        UpdatedAt
      FROM Events
      WHERE EventType = ?
      ORDER BY StartDate ASC
    `, [eventType]);
    
    return rows;
  } catch (err) {
    throw new Error("Error fetching events by type: " + err.message);
  }
};

export {
    VALID_EVENT_TYPES, addEvent, deleteEvent, getAllEvents,
    getEventById, getEventsByDateRange,
    getEventsByType, updateEvent
};
