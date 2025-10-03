import express from "express";
import {
    addEventController,
    deleteEventController,
    getAllEventsController,
    getEventByIdController,
    getEventsByDateRangeController,
    getEventsByTypeController,
    updateEventController
} from "../controllers/event.controller.js";

const router = express.Router();

// Route to get all events
router.get("/", getAllEventsController);

// Route to get events by date range
// Example: /api/events/date-range?startDate=2025-10-01&endDate=2025-10-31
router.get("/date-range", getEventsByDateRangeController);

// Route to get events by type
// Example: /api/events/type/Sports
router.get("/type/:type", getEventsByTypeController);

// Route to get a specific event by ID
router.get("/:id", getEventByIdController);

// Route to add a new event
router.post("/", addEventController);

// Route to update an event
router.put("/:id", updateEventController);

// Route to delete an event
router.delete("/:id", deleteEventController);

export default router;