import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { dashboardController } from "../src/modules/dashboard/index.js";

const router = express.Router();

// Headline numbers for the admin dashboard, scoped to the admin's branch.
router.get("/summary", authMiddleware, dashboardController.summary);

export default router;
