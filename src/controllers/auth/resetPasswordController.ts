import "dotenv/config";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { isValidPassword } from "./validation.js";
import { compareOtp } from "../../utils/otp.js";

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return errorResponse(
        res,
        "Email, OTP, password baru, dan konfirmasi password wajib diisi",
        400
      );
    }

    if (!isValidPassword(String(newPassword))) {
      return errorResponse(
        res,
        "Password baru minimal 8 karakter dan harus memiliki kombinasi huruf serta angka",
        400
      );
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, "Konfirmasi password tidak sama", 400);
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const otpData = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        purpose: "RESET_PASSWORD",
        verifiedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpData) {
      return errorResponse(res, "OTP reset password tidak ditemukan", 404);
    }

    if (otpData.expiresAt < new Date()) {
      return errorResponse(res, "OTP sudah kedaluwarsa", 400);
    }

    const isOtpValid = await compareOtp(String(otp), otpData.codeHash);

    if (!isOtpValid) {
      return errorResponse(res, "OTP tidak valid", 400);
    }

    const hashedPassword = await bcrypt.hash(
      String(newPassword),
      Number(process.env.BCRYPT_SALT_ROUNDS) || 10
    );

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          email: normalizedEmail,
        },
        data: {
          password: hashedPassword,
        },
      });

      await tx.otpCode.update({
        where: {
          id: otpData.id,
        },
        data: {
          verifiedAt: new Date(),
        },
      });
    });

    return successResponse(res, "Password berhasil direset");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};