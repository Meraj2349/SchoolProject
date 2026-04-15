import express from "express";
import upload from "../config/multer.config.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  createBranchController,
  deleteBranchController,
  getAllBranchesController,
  getBranchByIdController,
  getBranchStatsController,
  updateBranchController,
} from "../controllers/branch.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllBranchesController);
router.get("/stats/overview", authMiddleware, getBranchStatsController);
router.get("/:id", getBranchByIdController);

// Protected routes (require auth)
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createBranchController,
);
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  updateBranchController,
);
router.delete("/:id", authMiddleware, deleteBranchController);

export default router;
