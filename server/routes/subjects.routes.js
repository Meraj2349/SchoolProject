import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  addSubjectController,
  deleteSubjectController,
  editSubjectController,
  getSubjectsController,
} from "../controllers/subjects.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getSubjectsController);
router.post("/add", addSubjectController);
router.put("/edit/:id", editSubjectController);
router.delete("/delete/:id", deleteSubjectController);

export default router;
