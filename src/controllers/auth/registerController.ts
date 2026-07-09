import "dotenv/config";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { generateOtp, hashOtp, getOtpExpiredAt } from "../../utils/otp.js";
import { sendOtpEmail } from "../../utils/mail.js";
import { isValidEmail, isValidPassword } from "./validation.js";
import { logUserActivity } from "../../utils/logger.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword, phone } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return errorResponse(
        res,
        "Nama lengkap, email, password, dan konfirmasi password wajib diisi",
        400
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return errorResponse(res, "Format email tidak valid", 400);
    }

    if (!isValidPassword(String(password))) {
      return errorResponse(
        res,
        "Password minimal 8 karakter dan harus memiliki kombinasi huruf serta angka",
        400
      );
    }

    if (password !== confirmPassword) {
      return errorResponse(res, "Konfirmasi password tidak sama", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return errorResponse(res, "Email sudah terdaftar", 400);
    }

    const hashedPassword = await bcrypt.hash(
      String(password),
      Number(process.env.BCRYPT_SALT_ROUNDS)
    );

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: String(fullName),
          email: normalizedEmail,
          password: hashedPassword,
          phone: phone ? String(phone) : null,
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });

      await tx.otpCode.create({
        data: {
          userId: String(newUser.id),
          email: normalizedEmail,
          codeHash: hashedOtp,
          purpose: "VERIFY_EMAIL",
          expiresAt: getOtpExpiredAt(),
        },
      });

      return newUser;
    });

    try {
        await sendOtpEmail(normalizedEmail, otp, "VERIFY_EMAIL");
    } catch (mailError) {
        console.error("Gagal mengirim OTP ke email:", mailError);

        return errorResponse(
          res, 
          "Gagal mengirim OTP ke email. Silakan coba lagi nanti.", 
          500
        );
    }

    logUserActivity({
      userId: user.id,
      action: "REGISTER",
      details: { email: user.email, fullName: user.fullName },
      req,
    });

    return successResponse(
      res,
      "Register berhasil. Silakan verifikasi OTP.",
      {
        user,
        devOtp:  process.env.NODE_ENV === "development" ? otp : undefined,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};