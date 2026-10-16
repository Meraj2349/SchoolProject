import express from "express";
import { makeLocalFileUpload } from "../config/localFileUpload.js";
import authMiddleware, { optionalAuth } from "../middlewares/auth.middleware.js";
import { JOB_CIRCULAR_UPLOADS, jobCircularsController as circulars } from "../src/modules/content/index.js";

// The poster may be the circular as printed: an image or a PDF.
const upload = makeLocalFileUpload({
  dir: JOB_CIRCULAR_UPLOADS,
  prefix: "circular",
  types: ["jpg", "png", "webp", "pdf"],
  typeError: "file_type_not_allowed",
  sizeError: "file_too_large",
});

// Job circulars (নিয়োগ বিজ্ঞপ্তি) per branch or for the whole school.
const router = express.Router();

router.get("/", optionalAuth, circulars.listVisible); // the website: published only
router.get("/all", authMiddleware, circulars.list);
router.get("/:id", circulars.getVisible); // a circular's own page (a bad id is a translated 404)
router.post("/", authMiddleware, upload.single("poster"), circulars.create);
router.put("/:id", authMiddleware, upload.single("poster"), circulars.update);
router.patch("/:id/publish", authMiddleware, circulars.setVisibility);
router.delete("/:id", authMiddleware, circulars.remove);

export default router;
