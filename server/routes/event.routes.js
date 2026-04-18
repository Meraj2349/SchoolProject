import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  addEventController,
  deleteEventController,
  getAllEventsController,
  getEventByIdController,
  getEventsByDateRangeController,
  getEventsByTypeController,
  updateEventController,
} from "../controllers/event.controller.js";

const router = express.Router();

// Public GET routes (no auth required for reading events)
router.get("/", getAllEventsController);
router.get("/date-range", getEventsByDateRangeController);
router.get("/type/:type", getEventsByTypeController);
router.get("/:id", getEventByIdController);

// Protected write routes (require auth for branch scoping on mutations)
router.post("/", authMiddleware, addEventController);
router.put("/:id", authMiddleware, updateEventController);
router.delete("/:id", authMiddleware, deleteEventController);

export default router;
