import express from "express";
import upload from "../config/multer.config.js";
import authMiddleware, { authorize } from "../middlewares/auth.middleware.js";
import {
  getChairmanProfileController,
  updateChairmanProfileController,
} from "../controllers/chairman.controller.js";

const router = express.Router();

// Public – anyone can read the chairman profile
router.get("/", getChairmanProfileController);

// Protected – one school-wide profile, so only a super admin can update it
router.put(
  "/",
  authMiddleware,
  authorize("super_admin"),
  upload.single("image"),
  updateChairmanProfileController,
);

export default router;
