import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  getPublishedController,
  getAllController,
  createController,
  updateController,
  togglePublishController,
  removeController,
} from "../controllers/notice-announcement.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage for notice announcement images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/uploads/notice-announcements"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "notice-" + uniqueSuffix + path.extname(file.originalname).toLowerCase(),
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ].includes(file.mimetype);

  if (extValid && mimeValid) {
    return cb(null, true);
  }
  cb(new Error("Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

const router = express.Router();

// Public route
router.get("/", getPublishedController);

// Admin routes (require auth)
router.get("/all", authMiddleware, getAllController);
router.post("/", authMiddleware, upload.single("image"), createController);
router.put("/:id", authMiddleware, upload.single("image"), updateController);
router.patch("/:id/publish", authMiddleware, togglePublishController);
router.delete("/:id", authMiddleware, removeController);

export default router;
