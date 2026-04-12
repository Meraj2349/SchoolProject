import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  deleteApplicationController,
  getAllApplicationsController,
  getApplicationByIdController,
  submitApplicationController,
  updateApplicationStatusController,
} from "../controllers/application.controller.js";

const router = express.Router();

// PUBLIC — submit a new application
router.post("/", submitApplicationController);

// PROTECTED — admin routes
router.get("/", authMiddleware, getAllApplicationsController);
router.get("/:id", authMiddleware, getApplicationByIdController);
router.put("/:id/status", authMiddleware, updateApplicationStatusController);
router.delete("/:id", authMiddleware, deleteApplicationController);

export default router;
