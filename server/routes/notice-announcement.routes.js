import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import {
  announcementsController as announcements,
  NOTICE_ANNOUNCEMENT_UPLOADS as UPLOAD_DIR,
} from "../src/modules/content/index.js";

// Multer storage for notice announcement images (directory is git-ignored,
// so create it — multer will not).
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
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

// Image notices, per branch or for the whole school.
router.get("/", optionalAuth, announcements.listVisible); // the website: published only
router.get("/all", authMiddleware, announcements.list);
router.post("/", authMiddleware, upload.single("image"), announcements.create);
router.put("/:id", authMiddleware, upload.single("image"), announcements.update);
router.patch("/:id/publish", authMiddleware, announcements.setVisibility);
router.delete("/:id", authMiddleware, announcements.remove);

export default router;
