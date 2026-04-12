import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  getActiveNewsController,
  getAllNewsController,
  createNewsController,
  updateNewsController,
  deleteNewsController,
} from "../controllers/news.controller.js";

const router = express.Router();

// Public routes
router.get("/", getActiveNewsController);

// Admin routes (require auth)
router.get("/all", authMiddleware, getAllNewsController);
router.post("/", authMiddleware, createNewsController);
router.put("/:id", authMiddleware, updateNewsController);
router.delete("/:id", authMiddleware, deleteNewsController);

export default router;
