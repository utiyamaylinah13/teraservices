import { Request, Response } from "express";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { generateToken } from "../../utils/jwt.js"; 

// Fungsi Matematika Euclidean Distance
const calculateEuclideanDistance = (emb1: number[], emb2: number[]) => {
  if (emb1.length !== emb2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < emb1.length; i++) {
    sum += Math.pow(emb1[i] - emb2[i], 2);
  }
  return Math.sqrt(sum);
};


export const registerFace = async (req: Request, res: Response) => {
  try {
    const { embedding } = req.body;
    // Mengambil user ID dari authMiddleware
    const userId = (req as any).user?.id; 

    if (!userId) {
      return errorResponse(res, "Akses ditolak, token tidak valid", 401);
    }

    if (!embedding || !Array.isArray(embedding)) {
      return errorResponse(res, "Data embedding wajah tidak valid", 400);
    }

    // 1. Nonaktifkan data credential wajah yang lama jika ada (isActive = false)
    await prisma.faceCredential.updateMany({
      where: { userId: userId },
      data: { isActive: false }
    });

    // 2. Simpan data credential wajah yang baru
    await prisma.faceCredential.create({
      data: {
        userId: userId,
        embedding: embedding,
        isActive: true,
      }
    });

    // 3. Update status isFaceRecognitionActive milik user menjadi true
    await prisma.user.update({
      where: { id: userId },
      data: { isFaceRecognitionActive: true }
    });

    return successResponse(res, "Data wajah berhasil didaftarkan");
  } catch (error) {
    console.error("REGISTER FACE ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan saat mendaftarkan wajah", 500);
  }
};

export const faceLoginIdentification = async (req: Request, res: Response) => {
  try {
    const { embedding } = req.body;

    if (!embedding || !Array.isArray(embedding)) {
      return errorResponse(res, "Data embedding wajah tidak valid", 400);
    }

    const faceCredentials = await prisma.faceCredential.findMany({
      where: { isActive: true },
      include: { 
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            isFaceRecognitionActive: true,
            isEmailVerified: true,
            children: {
              select: {
                id: true,
                name: true,
                gender: true,
              }
            }
          }
        }
      }
    });

    if (faceCredentials.length === 0) {
      return errorResponse(res, "Belum ada data wajah yang terdaftar di sistem", 404);
    }

    // 2. Proses Pencocokan (Pencarian Vektor)
    let bestMatch = null;
    let minDistance = Infinity;
    
    // Tentukan nilai toleransi kemiripan (Makin kecil makin ketat. Coba angka 1.0 - 1.2)
    const THRESHOLD = 1.0; 

    for (const record of faceCredentials) {
      const dbEmbedding = record.embedding as number[];
      const distance = calculateEuclideanDistance(embedding, dbEmbedding);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = record;
      }
    }

    // 3. Evaluasi Hasil
    if (bestMatch && minDistance <= THRESHOLD) {
      const user = bestMatch.user;

      if (!user.isFaceRecognitionActive) {
        return errorResponse(res, "Fitur face login sedang dinonaktifkan oleh pengguna ini", 403);
      }

      // Catat ke tabel FaceAuthLog dengan status SUCCESS
      await prisma.faceAuthLog.create({
        data: {
          userId: user.id,
          email: user.email,
          status: "SUCCESS",
          distance: minDistance,
          threshold: THRESHOLD,
          message: "Login wajah berhasil"
        }
      });

      const token = generateToken({
        id : user.id,
        email: user.email,
      });

      return successResponse(res, "Login berhasil", {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          hasChildData : user.children.length > 0,
          isFaceRecognitionActive: user.isFaceRecognitionActive,
          isEmailVerified: user.isEmailVerified,
          children : user.children
        },
        similarityDistance: minDistance,
        token: token
      });
      
    } else {
      // Jika wajah asing, catat dengan status FAILED
      await prisma.faceAuthLog.create({
        data: {
          status: "FAILED",
          distance: minDistance !== Infinity ? minDistance : null,
          threshold: THRESHOLD,
          message: "Wajah tidak dikenali atau belum terdaftar"
        }
      });

      return errorResponse(res, "Wajah tidak dikenali. Silakan gunakan email dan password.", 401);
    }
  } catch (error) {
    console.error("FACE LOGIN IDENTIFICATION ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan pada server saat memproses wajah", 500);
  }
};