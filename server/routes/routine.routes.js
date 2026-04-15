import express from "express";
import upload from "../config/multer.config.js";
import * as RoutineController from "../controllers/routine.controller.js";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js"; // For admin authentication

const router = express.Router();

// ========== Public Routes (Students/Parents can view routines) ==========
// optionalAuth: allows unauthenticated access but honours ?branch_id for filtering
// Routes follow Classes table structure (ClassID, ClassName, Section)

// Get all routines with ClassName and Section details
router.get("/", optionalAuth, RoutineController.getAllRoutines);

// Get routine by RoutineID with class details
router.get("/:id", optionalAuth, RoutineController.getRoutineById);

// Get routines by ClassName and Section (filter by ClassName and Section)
router.get(
  "/filter/class-section",
  optionalAuth,
  RoutineController.getRoutinesByClassSection,
);

// Get routines by ClassID (specific class)
router.get("/class/:classId", optionalAuth, RoutineController.getRoutinesByClassId);

// Search routines (search in RoutineTitle, ClassName, Section, Description)
router.get("/search/query", optionalAuth, RoutineController.searchRoutines);

// Get all available classes from Classes table (ClassID, ClassName, Section)
router.get("/options/classes", optionalAuth, RoutineController.getAllClasses);

// Get filter options (distinct ClassName and Section from Classes table)
router.get("/options/filters", optionalAuth, RoutineController.getFilterOptions);

// Get sections by ClassName (for dynamic section loading from Classes table)
router.get(
  "/options/sections/:className",
  optionalAuth,
  RoutineController.getSectionsByClassName,
);

// ========== Admin Routes (Require Authentication) ==========
// Admin can create, update, delete routines with ClassID

// Create new routine with file upload (ClassID required from Classes table)
router.post(
  "/",
  authMiddleware,
  upload.single("routineFile"),
  RoutineController.createRoutine,
);

// Update routine with optional file upload (ClassID can be updated)
router.put(
  "/:id",
  authMiddleware,
  upload.single("routineFile"),
  RoutineController.updateRoutine,
);

// Delete routine (soft delete) - shows ClassName and Section in response
router.delete("/:id", authMiddleware, RoutineController.deleteRoutine);

export default router;
