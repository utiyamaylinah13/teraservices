import { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";

// Endpoint: Mengambil Face Embedding berdasarkan Email (Untuk Login)
export const getFaceEmbeddingByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email wajib disertakan", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        faceCredentials: {
          where: { isActive: true },
          take: 1
        }
      }
    });

    if (!user) {
      return errorResponse(res, "User tidak ditemukan", 404);
    }

    if (!user.isFaceRecognitionActive || user.faceCredentials.length === 0) {
      return errorResponse(res, "Face Recognition belum diaktifkan untuk akun ini", 400);
    }

    return successResponse(res, "Data embedding wajah berhasil diambil", {
      email: user.email,
      fullName: user.fullName,
      embedding: user.faceCredentials[0].embedding
    });
  } catch (error) {
    console.error("GET FACE EMBEDDING ERROR:", error);
    return errorResponse(res, "Gagal mengambil data embedding wajah", 500);
  }
};
