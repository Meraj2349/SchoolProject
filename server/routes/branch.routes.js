import express from "express";
import upload from "../config/multer.config.js";
import authMiddleware, { authorize } from "../middlewares/auth.middleware.js";
import { branchController } from "../src/modules/branch/index.js";
import { requireRole } from "../src/shared/http/requireRole.js";

const router = express.Router();

// Super admins: per-branch counts and this month's fees (not public).
router.get("/admin/overview", authMiddleware, requireRole("super_admin"), branchController.overview);

// Public routes
router.get("/", branchController.list);
router.get("/stats/overview", branchController.stats);
router.get("/:id", branchController.getById);

// Protected routes — super_admin only
router.post(
  "/",
  authMiddleware,
  authorize("super_admin"),
  upload.single("image"),
  branchController.create,
);
router.put(
  "/:id",
  authMiddleware,
  authorize("super_admin"),
  upload.single("image"),
  branchController.update,
);
router.delete("/:id", authMiddleware, authorize("super_admin"), branchController.remove);

export default router;
