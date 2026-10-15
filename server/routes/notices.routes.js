import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  addNoticeController,
  deleteNoticeController,
  getNoticesController,
  showNoticeController,
  editNoticeController,
  toggleNoticeVisibilityController,
} from "../controllers/notices.controller.js";

const router = express.Router();

// Add a new notice
router.post("/add", authMiddleware, addNoticeController);

// Delete a notice by ID
router.delete("/delete/:id", authMiddleware, deleteNoticeController);

// Get all notices
router.get("/", getNoticesController);

// Show a specific notice by ID
router.put("/show/:id", authMiddleware, showNoticeController);

// Edit a notice by ID
router.put("/edit/:id", authMiddleware, editNoticeController);
// Toggle visibility of a notice
router.put("/toggle-visibility/:id", authMiddleware, toggleNoticeVisibilityController);

export default router;
