import db from "../config/db.config.js";

/**
 * Event Model for School Management System
 *
 * Branch scoping logic for events:
 *  - branchId == null (super_admin): show ALL events (no filter)
 *  - branchId set (branch_admin): show branch-specific events PLUS global events
 *    (branch_id IS NULL means school-wide / global)
 *    → WHERE (branch_id = ? OR branch_id IS NULL)
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
 *     branch_id INT NULL,
 *     CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */

// Valid event types from database schema
const VALID_EVENT_TYPES = ["Academic", "Sports", "Cultural", "Other"];

// Build the branch WHERE clause for events (special logic: null branch_id = global)
const eventBranchClause = (branchId) => {
  if (branchId == null) return { clause: "", params: [] };
  return { clause: "AND (branch_id = ? OR branch_id IS NULL)", params: [branchId] };
};

// Get all events (branch-scoped with global fallback)
const getAllEvents = async (branchId = null) => {
  const { clause, params } = eventBranchClause(branchId);
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
        branch_id,
        CreatedAt,
        UpdatedAt
      FROM Events
      WHERE 1=1 ${clause}
      ORDER BY StartDate ASC, CreatedAt DESC
    `, params);
    return rows;
  } catch (err) {
    throw new Error("Error fetching events: " + err.message);
  }
};

// Get event by ID (branch-scoped with global fallback)
const getEventById = async (eventId, branchId = null) => {
  const { clause, params } = eventBranchClause(branchId);
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const [rows] = await db.query(
      `SELECT
        EventID,
        EventName,
        EventType,
        StartDate,
        EndDate,
        Venue,
        Description,
        branch_id,
        CreatedAt,
        UpdatedAt
      FROM Events
      WHERE EventID = ? ${clause}`,
      [eventId, ...params],
    );

    return rows[0] || null;
  } catch (err) {
    throw new Error("Error fetching event by ID: " + err.message);
  }
};

// Add new event
const addEvent = async (eventData, branchId = null) => {
  try {
    const { eventName, eventType, startDate, endDate, venue, description } =
      eventData;

    if (!eventName || !eventType || !startDate || !endDate) {
      throw new Error(
        "Event name, type, start date, and end date are required",
      );
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      throw new Error(
        `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(", ")}`,
      );
    }

    if (eventName.length > 100) {
      throw new Error("Event name cannot exceed 100 characters");
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    if (endDateObj < startDateObj) {
      throw new Error("End date cannot be before start date");
    }

    if (venue && venue.length > 100) {
      throw new Error("Venue name cannot exceed 100 characters");
    }

    let sql, values;
    if (branchId != null) {
      sql = `INSERT INTO Events (EventName, EventType, StartDate, EndDate, Venue, Description, branch_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      values = [
        eventName.trim(),
        eventType,
        startDate,
        endDate,
        venue?.trim() || null,
        description?.trim() || null,
        branchId,
      ];
    } else {
      sql = `INSERT INTO Events (EventName, EventType, StartDate, EndDate, Venue, Description) VALUES (?, ?, ?, ?, ?, ?)`;
      values = [
        eventName.trim(),
        eventType,
        startDate,
        endDate,
        venue?.trim() || null,
        description?.trim() || null,
      ];
    }

    const [result] = await db.query(sql, values);

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
        Description: description?.trim() || null,
        branch_id: branchId,
      },
    };
  } catch (err) {
    throw new Error("Error adding event: " + err.message);
  }
};

// Update event (branch-scoped)
const updateEvent = async (eventId, eventData, branchId = null) => {
  const { clause: branchScope, params: branchParams } = eventBranchClause(branchId);
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const [existingEvent] = await db.query(
      `SELECT * FROM Events WHERE EventID = ? ${branchScope}`,
      [eventId, ...branchParams],
    );

    if (existingEvent.length === 0) {
      throw new Error("Event not found");
    }

    const { eventName, eventType, startDate, endDate, venue, description } =
      eventData;
    const updates = [];
    const params = [];

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
        throw new Error(
          `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(", ")}`,
        );
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

    params.push(eventId);
    const [result] = await db.query(
      `UPDATE Events SET ${updates.join(", ")} WHERE EventID = ?`,
      params,
    );

    if (result.affectedRows === 0) {
      throw new Error("No rows were updated");
    }

    return {
      success: true,
      message: "Event updated successfully",
      affectedRows: result.affectedRows,
    };
  } catch (err) {
    throw new Error("Error updating event: " + err.message);
  }
};

// Delete event (branch-scoped)
const deleteEvent = async (eventId, branchId = null) => {
  const { clause: branchScope, params: branchParams } = eventBranchClause(branchId);
  try {
    if (!eventId) {
      throw new Error("Event ID is required");
    }

    const eventInfo = await getEventById(eventId, branchId);
    if (!eventInfo) {
      throw new Error("Event not found");
    }

    const [result] = await db.query(
      `DELETE FROM Events WHERE EventID = ? ${branchScope}`,
      [eventId, ...branchParams],
    );

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
        Description: eventInfo.Description,
      },
    };
  } catch (err) {
    throw new Error("Error deleting event: " + err.message);
  }
};

// Get events by date range (branch-scoped with global fallback)
const getEventsByDateRange = async (startDate, endDate, branchId = null) => {
  const { clause, params } = eventBranchClause(branchId);
  try {
    const [rows] = await db.query(
      `SELECT
        EventID,
        EventName,
        EventType,
        StartDate,
        EndDate,
        Venue,
        Description,
        branch_id,
        CreatedAt,
        UpdatedAt
      FROM Events
      WHERE StartDate >= ? AND EndDate <= ? ${clause}
      ORDER BY StartDate ASC`,
      [startDate, endDate, ...params],
    );

    return rows;
  } catch (err) {
    throw new Error("Error fetching events by date range: " + err.message);
  }
};

// Get events by type (branch-scoped with global fallback)
const getEventsByType = async (eventType, branchId = null) => {
  const { clause, params } = eventBranchClause(branchId);
  try {
    if (!VALID_EVENT_TYPES.includes(eventType)) {
      throw new Error(
        `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(", ")}`,
      );
    }

    const [rows] = await db.query(
      `SELECT
        EventID,
        EventName,
        EventType,
        StartDate,
        EndDate,
        Venue,
        Description,
        branch_id,
        CreatedAt,
        UpdatedAt
      FROM Events
      WHERE EventType = ? ${clause}
      ORDER BY StartDate ASC`,
      [eventType, ...params],
    );

    return rows;
  } catch (err) {
    throw new Error("Error fetching events by type: " + err.message);
  }
};

export {
  VALID_EVENT_TYPES,
  addEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getEventsByDateRange,
  getEventsByType,
  updateEvent,
};
