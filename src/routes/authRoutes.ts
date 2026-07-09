import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { register } from "../controllers/auth/registerController.js";
import { verifyOtp } from "../controllers/auth/verifyOtpController.js";
import { login } from "../controllers/auth/loginController.js";
import { getMe, logout } from "../controllers/auth/getMeController.js";
import { requestResetPassword } from "../controllers/auth/requestResetPasswordController.js";
import { resetPassword } from "../controllers/auth/resetPasswordController.js";
import { resendOtp } from "../controllers/auth/resendOtpController.js";
import { getFaceEmbeddingByEmail } from "../controllers/auth/faceAuthController.js";

const router = Router();
    
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);
router.post("/request-reset-password", authMiddleware, requestResetPassword);
router.post("/reset-password", authMiddleware, resetPassword);
router.post("/request-reset-password", requestResetPassword);
router.post("/get-face-embedding", getFaceEmbeddingByEmail);

export default router;