import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getActivityStats, getLastScreeningStats, getscreeningHistoryStats } from "../controllers/grafikController.js";
export const grafikRoutes = Router();
grafikRoutes.get('/activities-stats/:childId', authMiddleware, getActivityStats);
grafikRoutes.get('/last-screening-stats/:childId', authMiddleware, getLastScreeningStats);
grafikRoutes.get('/screening-history-stats/:childId', authMiddleware, getscreeningHistoryStats);
//# sourceMappingURL=grafikRoutes.js.map