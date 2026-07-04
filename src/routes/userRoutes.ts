import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { updateProfile, saveFaceEmbedding, getUserActivityLogs } from "../controllers/userController.js";

export const userRoutes = Router();

userRoutes.put("/profile", authMiddleware, updateProfile);
userRoutes.post("/face-embedding", authMiddleware, saveFaceEmbedding);
userRoutes.get("/activity-logs", authMiddleware, getUserActivityLogs);
