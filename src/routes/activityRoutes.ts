import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getTodayActivities, updateActivityStatus } from "../controllers/activityController.js";

export const activityRoutes = Router();

activityRoutes.get("/today/:childId", authMiddleware, getTodayActivities);
activityRoutes.patch("/:activityId/status", authMiddleware, updateActivityStatus);