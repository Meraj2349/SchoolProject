import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  addMessageController,
  deleteMessageController,
  getMessagesController,
  editMessageController,
  toggleMessageVisibilityController,
} from "../controllers/messages.controller.js";

const router = express.Router();

// Add a new message
router.post("/add", authMiddleware, addMessageController);

// Delete a message by ID
router.delete("/delete/:id", authMiddleware, deleteMessageController);

// Get all messages
router.get("/", getMessagesController);

// Edit a message by ID
router.put("/edit/:id", authMiddleware, editMessageController);

// Toggle the show/hide status of a message
router.put("/toggle-visibility/:id", authMiddleware, toggleMessageVisibilityController);

export default router;
