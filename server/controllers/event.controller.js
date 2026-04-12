import { t } from "../config/i18n.js";
import {
  addEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getEventsByDateRange,
  getEventsByType,
  updateEvent,
} from "../models/event.model.js";

// Get all events
export const getAllEventsController = async (req, res) => {
  const lang = req.language;
  try {
    const events = await getAllEvents();
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error in getAllEventsController:", error);
    res
      .status(500)
      .json({
        success: false,
        message: t("event_fetch_failed", lang),
        error: error.message,
      });
  }
};

// Get event by ID
export const getEventByIdController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: t("event_title_required", lang) });
    }

    const event = await getEventById(id);

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: t("event_not_found", lang) });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error("Error in getEventByIdController:", error);
    res
      .status(500)
      .json({
        success: false,
        message: t("internal_server_error", lang),
        error: error.message,
      });
  }
};

// Add new event
export const addEventController = async (req, res) => {
  const lang = req.language;
  try {
    const { eventName, eventType, startDate, endDate, venue, description } =
      req.body;

    if (!eventName || !eventType || !startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: t("event_required_fields", lang) });
    }

    const eventData = {
      eventName,
      eventType,
      startDate,
      endDate,
      venue,
      description,
    };
    const result = await addEvent(eventData);

    res
      .status(201)
      .json({
        success: true,
        message: t("event_created", lang),
        data: result.data,
      });
  } catch (error) {
    console.error("Error in addEventController:", error);

    if (
      error.message.includes("Invalid") ||
      error.message.includes("required") ||
      error.message.includes("exceed") ||
      error.message.includes("cannot be")
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res
      .status(500)
      .json({
        success: false,
        message: t("internal_server_error", lang),
        error: error.message,
      });
  }
};

// Update event
export const updateEventController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: t("event_title_required", lang) });
    }

    const { eventName, eventType, startDate, endDate, venue, description } =
      req.body;

    if (
      !eventName &&
      !eventType &&
      !startDate &&
      !endDate &&
      !venue &&
      !description
    ) {
      return res
        .status(400)
        .json({ success: false, message: t("event_required_fields", lang) });
    }

    const eventData = {};
    if (eventName !== undefined) eventData.eventName = eventName;
    if (eventType !== undefined) eventData.eventType = eventType;
    if (startDate !== undefined) eventData.startDate = startDate;
    if (endDate !== undefined) eventData.endDate = endDate;
    if (venue !== undefined) eventData.venue = venue;
    if (description !== undefined) eventData.description = description;

    await updateEvent(id, eventData);

    res.status(200).json({ success: true, message: t("event_updated", lang) });
  } catch (error) {
    console.error("Error in updateEventController:", error);

    if (error.message.includes("not found")) {
      return res
        .status(404)
        .json({ success: false, message: t("event_not_found", lang) });
    }

    if (
      error.message.includes("Invalid") ||
      error.message.includes("required") ||
      error.message.includes("exceed") ||
      error.message.includes("cannot be")
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res
      .status(500)
      .json({
        success: false,
        message: t("internal_server_error", lang),
        error: error.message,
      });
  }
};

// Delete event
export const deleteEventController = async (req, res) => {
  const lang = req.language;
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: t("event_title_required", lang) });
    }

    const result = await deleteEvent(id);

    res
      .status(200)
      .json({
        success: true,
        message: t("event_deleted", lang),
        data: result.deletedEvent,
      });
  } catch (error) {
    console.error("Error in deleteEventController:", error);

    if (error.message.includes("not found")) {
      return res
        .status(404)
        .json({ success: false, message: t("event_not_found", lang) });
    }

    res
      .status(500)
      .json({
        success: false,
        message: t("internal_server_error", lang),
        error: error.message,
      });
  }
};

// Get events by date range
export const getEventsByDateRangeController = async (req, res) => {
  const lang = req.language;
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: t("event_dates_required", lang) });
    }

    const events = await getEventsByDateRange(startDate, endDate);

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error in getEventsByDateRangeController:", error);
    res
      .status(500)
      .json({
        success: false,
        message: t("internal_server_error", lang),
        error: error.message,
      });
  }
};

// Get events by type
export const getEventsByTypeController = async (req, res) => {
  const lang = req.language;
  try {
    const { type } = req.params;

    if (!type) {
      return res
        .status(400)
        .json({ success: false, message: t("event_title_required", lang) });
    }

    const events = await getEventsByType(type);

    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error in getEventsByTypeController:", error);

    if (error.message.includes("Invalid")) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res
      .status(500)
      .json({
        success: false,
        message: t("internal_server_error", lang),
        error: error.message,
      });
  }
};
