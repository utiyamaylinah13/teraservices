import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { updateProfile, saveFaceEmbedding, getUserActivityLogs, uploadProfilePhoto } from "../controllers/userController.js";
import { uploadProfile } from "../middlewares/uploadMiddleware.js";

export const userRoutes = Router();

userRoutes.put("/profile", authMiddleware, updateProfile);
userRoutes.put("/profile/photo", authMiddleware, uploadProfile.single("photo"), uploadProfilePhoto);
userRoutes.post("/face-embedding", authMiddleware, saveFaceEmbedding);
userRoutes.get("/activity-logs", authMiddleware, getUserActivityLogs);
