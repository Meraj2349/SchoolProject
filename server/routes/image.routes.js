import express from "express";
import upload from "../config/multer.config.js";
import * as ImageController from "../controllers/image.controller.js";

const router = express.Router();

// Create
router.post("/", upload.single("image"), ImageController.uploadImage);

// Read
router.get("/type/:type", ImageController.getImagesByType);
router.get("/:id", ImageController.getImage);

// Update
router.put("/:id", ImageController.updateImage); // Update metadata only
router.put("/:id/image", upload.single("image"), ImageController.replaceImageFile); // Replace image file

// Delete
router.delete("/:id", ImageController.deleteImage);

export default router;