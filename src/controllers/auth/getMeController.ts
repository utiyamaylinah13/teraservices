import "dotenv/config";
import { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { AuthRequest } from "../../middlewares/authMiddleware.js";


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
            ageYear: true,
            heightCm: true,
            weightKg: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, "User tidak ditemukan", 404);
    }

    const children = (user as any).children as Array<unknown> | undefined;

    return successResponse(res, "Data user berhasil diambil", {
      ...user,
      hasChildData: Array.isArray(children) && children.length > 0,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};

export const logout = async (_req: Request, res: Response) => {
  return successResponse(res, "Logout berhasil");
};