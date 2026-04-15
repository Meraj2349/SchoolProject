import express from "express";
import upload from "../config/multer.config.js";
import authMiddleware, { authorize } from "../middlewares/auth.middleware.js";
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
router.get("/stats/overview", getBranchStatsController);
router.get("/:id", getBranchByIdController);

// Protected routes — super_admin only
router.post(
  "/",
  authMiddleware,
  authorize("super_admin"),
  upload.single("image"),
  createBranchController,
);
router.put(
  "/:id",
  authMiddleware,
  authorize("super_admin"),
  upload.single("image"),
  updateBranchController,
);
router.delete("/:id", authMiddleware, authorize("super_admin"), deleteBranchController);

export default router;
