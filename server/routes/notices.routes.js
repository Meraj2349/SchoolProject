import express from "express";
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
router.post("/add", addNoticeController);

// Delete a notice by ID
router.delete("/delete/:id", deleteNoticeController);

// Get all notices
router.get("/", getNoticesController);

// Show a specific notice by ID
router.put("/show/:id", showNoticeController);

// Edit a notice by ID
router.put("/edit/:id", editNoticeController);
// Toggle visibility of a notice
router.put("/toggle-visibility/:id", toggleNoticeVisibilityController);

export default router;
