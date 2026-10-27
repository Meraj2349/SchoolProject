import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { requireWriteBranch } from "../src/shared/http/requireWriteBranch.js";
import { examController as exams } from "../src/modules/exams/index.js";

const router = express.Router();

// Public: every exam name, for the public result page's exam picker.
router.get("/public/names", exams.names);

router.use(authMiddleware);

router.get("/", exams.list);
// A new exam goes to the branch the admin works in (a super admin picks one).
router.post("/by-class", requireWriteBranch, exams.create);
router.put("/:id", exams.update);
router.delete("/:id", exams.remove);

export default router;
