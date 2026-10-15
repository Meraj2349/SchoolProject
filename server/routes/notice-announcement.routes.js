import express from "express";
import { makeLocalImageUpload } from "../config/localImageUpload.js";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import {
  announcementsController as announcements,
  NOTICE_ANNOUNCEMENT_UPLOADS,
} from "../src/modules/content/index.js";

const upload = makeLocalImageUpload({ dir: NOTICE_ANNOUNCEMENT_UPLOADS, prefix: "notice" });

const router = express.Router();

// Image notices, per branch or for the whole school.
router.get("/", optionalAuth, announcements.listVisible); // the website: published only
router.get("/all", authMiddleware, announcements.list);
router.post("/", authMiddleware, upload.single("image"), announcements.create);
router.put("/:id", authMiddleware, upload.single("image"), announcements.update);
router.patch("/:id/publish", authMiddleware, announcements.setVisibility);
router.delete("/:id", authMiddleware, announcements.remove);

export default router;
