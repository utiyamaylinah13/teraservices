import { Router } from "express";
import { getScreeningQuestionsByChild, startScreening, submitScreening, getScreeningResult, getScreeningHistoryByChild, } from "../controllers/screeningController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
export const screningRoutes = Router();
screningRoutes.get("/questions/:childId", authMiddleware, getScreeningQuestionsByChild);
screningRoutes.post("/start/:childId", authMiddleware, startScreening);
screningRoutes.post("/submit/:sessionId", authMiddleware, submitScreening);
screningRoutes.get("/result/:sessionId", authMiddleware, getScreeningResult);
screningRoutes.get("/history/:childId", authMiddleware, getScreeningHistoryByChild);
//# sourceMappingURL=screeningRoutes.js.map