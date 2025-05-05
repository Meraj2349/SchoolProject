import express from "express";
import {
  addMessageController,
  deleteMessageController,
  getMessagesController,
  editMessageController,
  toggleMessageVisibilityController,
} from "../controllers/messages.controller.js";

const router = express.Router();

// Add a new message
router.post("/add", addMessageController);

// Delete a message by ID
router.delete("/delete/:id", deleteMessageController);

// Get all messages
router.get("/", getMessagesController);

// Edit a message by ID
router.put("/edit/:id", editMessageController);

// Toggle the show/hide status of a message
router.put("/toggle-visibility/:id", toggleMessageVisibilityController);

export default router;