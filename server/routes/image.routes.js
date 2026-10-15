import express from "express";
import upload from "../config/multer.config.js";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { galleryController as images } from "../src/modules/gallery/index.js";

// Gallery images, per branch or for the whole school. Reads show the chosen
// branch (?branch_id, or a branch admin's own) plus whole-school images.
const router = express.Router();

router.get("/", optionalAuth, images.list);
router.get("/details", optionalAuth, images.list);
router.get("/type/:type", optionalAuth, images.byType);
router.get("/student/:studentId", optionalAuth, images.byStudent);
router.get("/teacher/:teacherId", optionalAuth, images.byTeacher);
router.get("/:id", optionalAuth, images.get);

router.post("/", authMiddleware, upload.single("image"), images.upload);
router.put("/:id", authMiddleware, images.update); // metadata only
router.put("/:id/image", authMiddleware, upload.single("image"), images.replaceFile);
router.delete("/:id", authMiddleware, images.remove);

export default router;
