import express from "express";
import upload from "../config/multer.config.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import * as ImageController from "../controllers/image.controller.js";

const router = express.Router();

// Create
router.post("/", authMiddleware, upload.single("image"), ImageController.uploadImage);

// Read
router.get("/", ImageController.getAllImagesWithDetails); // List all images
router.get("/details", ImageController.getAllImagesWithDetails); // Get all images with student/teacher details
router.get("/type/:type", ImageController.getImagesByType);
router.get("/student/:studentId", ImageController.getImagesByStudent); // Get images by student ID
router.get("/teacher/:teacherId", ImageController.getImagesByTeacher); // Get images by teacher ID
router.get("/:id", ImageController.getImage);

// Update
router.put("/:id", authMiddleware, ImageController.updateImage); // Update metadata only
router.put(
  "/:id/image",
  authMiddleware,
  upload.single("image"),
  ImageController.replaceImageFile,
); // Replace image file

// Delete
router.delete("/:id", authMiddleware, ImageController.deleteImage);

export default router;
