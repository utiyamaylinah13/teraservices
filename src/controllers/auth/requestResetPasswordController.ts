import "dotenv/config";
import { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { generateOtp, getOtpExpiredAt, hashOtp } from "../../utils/otp.js";
import { sendOtpEmail } from "../../utils/mail.js";

export const requestResetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email wajib diisi", 400);
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return errorResponse(res, "Email tidak terdaftar", 404);
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        email: normalizedEmail,
        codeHash: hashedOtp,
        purpose: "RESET_PASSWORD",
        expiresAt: getOtpExpiredAt(),
      },
    });

    try {
      await sendOtpEmail(normalizedEmail, otp, "RESET_PASSWORD");
    } catch (mailError) {
      console.error("Gagal mengirim OTP reset password:", mailError);

      return errorResponse(
        res, 
        "Gagal mengirim OTP reset password ke email. Silakan coba lagi nanti.", 
        500
      );

    }

    return successResponse(res, "OTP reset password berhasil dikirim ke email.", {
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        error: error instanceof Error ? error.message : error,
    });
  }
};