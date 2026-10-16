import express from "express";
import { makeLocalFileUpload } from "../config/localFileUpload.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { rateLimit } from "../src/shared/http/rateLimit.js";
import { jobApplicationController as applications, jobApplicationCvs } from "../src/modules/job-applications/index.js";

// CVs go to a private folder first and are moved under their circular once the application is saved.
const cvUpload = makeLocalFileUpload({
  dir: jobApplicationCvs.incomingDir,
  prefix: "cv",
  types: ["pdf", "jpg", "png"],
  typeError: "cv_type_not_allowed",
  sizeError: "file_too_large",
});
const HOUR = 60 * 60 * 1000;

const router = express.Router();

// Public: anyone may apply to an open circular, a few times an hour per address.
router.post("/", rateLimit({ max: 5, windowMs: HOUR }), cvUpload.single("cv"), applications.submit);

// Admins: a branch admin handles their branch's applications, the super admin all.
router.get("/", authMiddleware, applications.list);
router.get("/counts", authMiddleware, applications.counts);
router.get("/:id", authMiddleware, applications.get);
router.get("/:id/cv", authMiddleware, applications.cv);
router.put("/:id/status", authMiddleware, applications.setStatus);
router.delete("/:id", authMiddleware, applications.remove);

export default router;
