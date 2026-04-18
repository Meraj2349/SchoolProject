import express from "express";
import upload from "../config/multer.config.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  getChairmanProfileController,
  updateChairmanProfileController,
} from "../controllers/chairman.controller.js";

const router = express.Router();

// Public – anyone can read the chairman profile
router.get("/", getChairmanProfileController);

// Protected – only admins can update
router.put(
  "/",
  authMiddleware,
  upload.single("image"),
  updateChairmanProfileController,
);

export default router;
