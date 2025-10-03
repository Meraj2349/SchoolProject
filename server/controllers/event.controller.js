import {
    addEvent,
    deleteEvent,
    getAllEvents,
    getEventById,
    getEventsByDateRange,
    getEventsByType,
    updateEvent
} from "../models/event.model.js";

// Get all events
export const getAllEventsController = async (req, res) => {
  try {
    const events = await getAllEvents();
    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events
    });
  } catch (error) {
    console.error("Error in getAllEventsController:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get event by ID
export const getEventByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required"
      });
    }

    const event = await getEventById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      data: event
    });
  } catch (error) {
    console.error("Error in getEventByIdController:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Add new event
export const addEventController = async (req, res) => {
  try {
    const { eventName, eventType, startDate, endDate, venue, description } = req.body;

    // Basic validation
    if (!eventName || !eventType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Event name, type, start date, and end date are required"
      });
    }

    const eventData = {
      eventName,
      eventType,
      startDate,
      endDate,
      venue,
      description
    };

    const result = await addEvent(eventData);
    
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error("Error in addEventController:", error);
    
    // Handle validation errors
    if (error.message.includes("Invalid") || 
        error.message.includes("required") || 
        error.message.includes("exceed") ||
        error.message.includes("cannot be")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update event
export const updateEventController = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required"
      });
    }

    const { eventName, eventType, startDate, endDate, venue, description } = req.body;

    // Check if at least one field is provided
    if (!eventName && !eventType && !startDate && !endDate && !venue && !description) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required for update"
      });
    }

    const eventData = {};
    if (eventName !== undefined) eventData.eventName = eventName;
    if (eventType !== undefined) eventData.eventType = eventType;
    if (startDate !== undefined) eventData.startDate = startDate;
    if (endDate !== undefined) eventData.endDate = endDate;
    if (venue !== undefined) eventData.venue = venue;
    if (description !== undefined) eventData.description = description;

    const result = await updateEvent(id, eventData);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Error in updateEventController:", error);
    
    // Handle not found and validation errors
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes("Invalid") || 
        error.message.includes("required") || 
        error.message.includes("exceed") ||
        error.message.includes("cannot be")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete event
export const deleteEventController = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required"
      });
    }

    const result = await deleteEvent(id);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.deletedEvent
    });
  } catch (error) {
    console.error("Error in deleteEventController:", error);
    
    // Handle not found error
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get events by date range
export const getEventsByDateRangeController = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    const events = await getEventsByDateRange(startDate, endDate);
    
    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events
    });
  } catch (error) {
    console.error("Error in getEventsByDateRangeController:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get events by type
export const getEventsByTypeController = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Event type is required"
      });
    }

    const events = await getEventsByType(type);
    
    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      data: events
    });
  } catch (error) {
    console.error("Error in getEventsByTypeController:", error);
    
    // Handle validation errors
    if (error.message.includes("Invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};