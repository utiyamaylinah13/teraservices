import "dotenv/config";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { generateToken } from "../../utils/jwt.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email dan password wajib diisi", 400);
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            gender: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, "Email atau password salah", 401);
    }

    const isPasswordValid = await bcrypt.compare(
      String(password),
      user.password
    );

    if (!isPasswordValid) {
      return errorResponse(res, "Email atau password salah", 401);
    }

    if (!user.isEmailVerified) {
      return errorResponse(
        res,
        "Akun belum diverifikasi. Silakan verifikasi OTP terlebih dahulu.",
        403
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    return successResponse(res, "Login berhasil", {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        isFaceRecognitionActive: user.isFaceRecognitionActive,
        hasChildData: user.children.length > 0,
        children: user.children,
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};
