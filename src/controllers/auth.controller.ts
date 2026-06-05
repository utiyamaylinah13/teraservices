import "dotenv/config";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { generateToken } from "../utils/jwt.js";
import {
  generateOtp,
  hashOtp,
  compareOtp,
  getOtpExpiredAt,
} from "../utils/otp.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password: string) => {
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
};

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
          userId: newUser.id,
          email: normalizedEmail,
          codeHash: hashedOtp,
          purpose: "VERIFY_EMAIL",
          expiresAt: getOtpExpiredAt(),
        },
      });

      return newUser;
    });

    return successResponse(
      res,
      "Register berhasil. Silakan verifikasi OTP.",
      {
        user,
        devOtp: otp,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, "Email dan OTP wajib diisi", 400);
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const otpData = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        purpose: "VERIFY_EMAIL",
        verifiedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpData) {
      return errorResponse(res, "OTP tidak ditemukan", 404);
    }

    if (otpData.expiresAt < new Date()) {
      return errorResponse(res, "OTP sudah kedaluwarsa", 400);
    }

    const isOtpValid = await compareOtp(String(otp), otpData.codeHash);

    if (!isOtpValid) {
      return errorResponse(res, "OTP tidak valid", 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.otpCode.update({
        where: {
          id: otpData.id,
        },
        data: {
          verifiedAt: new Date(),
        },
      });

      await tx.user.update({
        where: {
          email: normalizedEmail,
        },
        data: {
          isEmailVerified: true,
        },
      });
    });

    return successResponse(res, "Verifikasi OTP berhasil");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};

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

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User tidak terautentikasi", 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profileImage: true,
        isEmailVerified: true,
        isFaceRecognitionActive: true,
        children: {
          select: {
            id: true,
            name: true,
            gender: true,
            birthDate: true,
            ageMonths: true,
            heightCm: true,
            weightKg: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, "User tidak ditemukan", 404);
    }

    return successResponse(res, "Data user berhasil diambil", {
      ...user,
      hasChildData: user.children.length > 0,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};

export const logout = async (_req: Request, res: Response) => {
  return successResponse(res, "Logout berhasil");
};