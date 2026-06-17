import { Router } from "express";
import {
  getScreeningQuestionsByChild,
  startScreening,
  submitScreening,
  getScreeningResult,
  getScreeningHistoryByChild,
} from "../controllers/screeningController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/questions/:childId", authMiddleware, getScreeningQuestionsByChild);
router.post("/start/:childId", authMiddleware, startScreening);
router.post("/submit/:sessionId", authMiddleware, submitScreening);
router.get("/result/:sessionId", authMiddleware, getScreeningResult);
router.get("/history/:childId", authMiddleware, getScreeningHistoryByChild);

export default router;