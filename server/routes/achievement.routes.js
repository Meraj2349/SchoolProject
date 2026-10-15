import express from "express";
import { makeLocalImageUpload } from "../config/localImageUpload.js";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { ACHIEVEMENT_UPLOADS, achievementsController as achievements } from "../src/modules/content/index.js";

const upload = makeLocalImageUpload({ dir: ACHIEVEMENT_UPLOADS, prefix: "achievement" });

// The honours board: achievements per branch or for the whole school.
const router = express.Router();

router.get("/", optionalAuth, achievements.listVisible); // the website: published only
router.get("/all", authMiddleware, achievements.list);
router.post("/", authMiddleware, upload.single("image"), achievements.create);
router.put("/:id", authMiddleware, upload.single("image"), achievements.update);
router.patch("/:id/publish", authMiddleware, achievements.setVisibility);
router.delete("/:id", authMiddleware, achievements.remove);

export default router;
