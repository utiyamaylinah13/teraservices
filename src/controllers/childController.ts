import {Response} from 'express';
import prisma from '../lib/prisma.js';
import {successResponse, errorResponse} from '../utils/response.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

const normalizeGender = (gender: string) => {
  const value = gender.toUpperCase().trim();

  if (["MALE", "LAKI-LAKI", "LAKI", "L"].includes(value)) {
    return "MALE";
  }

  if (["FEMALE", "PEREMPUAN", "P"].includes(value)) {
    return "FEMALE";
  }

  return null;
};

const calculateAgeYear = (birthDate: Date) => {
  const today = new Date();

  let ageYear = today.getFullYear() - birthDate.getFullYear();

  return ageYear;
};

export const createChild = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User tidak terautentikasi", 401);
    }

    const { name, birthDate, ageYear, gender, heightCm, weightKg, initialDevelopmentNote,photo } = req.body ?? {};

    if (!name || !gender || heightCm === undefined || weightKg === undefined || ageYear === undefined || birthDate === undefined) {
      return errorResponse(
        res,
        "Nama anak, jenis kelamin, tanggal lahir, usia, tinggi badan, dan berat badan wajib diisi",
        400
      );
    }

    const normalizedGender = normalizeGender(String(gender));

    if (!normalizedGender) {
      return errorResponse(
        res,
        "Jenis kelamin tidak valid. Gunakan MALE/FEMALE atau laki-laki/perempuan",
        400
      );
    }

    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg);

    if (Number.isNaN(parsedHeight) || parsedHeight <= 0) {
      return errorResponse(
        res, 
        "Tinggi badan harus berupa angka positif", 
        400
    );
    }

    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      return errorResponse(
        res, 
        "Berat badan harus berupa angka positif", 
        400
        );
    }

    let parsedBirthDate: Date | null = null;
    let finalAgeYear: number | null = null;

    if (birthDate) {
      parsedBirthDate = new Date(String(birthDate));

      if (Number.isNaN(parsedBirthDate.getTime())) {
        return errorResponse(
          res,
          "Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD",
          400
        );
      }

      if (parsedBirthDate > new Date()) {
        return errorResponse(
          res,
          "Tanggal lahir tidak boleh melebihi tanggal hari ini",
          400
        );
      }

      finalAgeYear = calculateAgeYear(parsedBirthDate);
    } else {
      finalAgeYear = Number(ageYear);

      if (Number.isNaN(finalAgeYear) || finalAgeYear < 0) {
        return errorResponse(res, "Usia anak harus berupa angka positif", 400);
      }
    }

    const child = await prisma.$transaction(async (tx) => {
      const createdChild = await tx.child.create({
        data: {
          userId: String(req.user!.id),
          name: String(name),
          birthDate: parsedBirthDate,
          ageYear: finalAgeYear,
          gender: normalizedGender,
          heightCm: parsedHeight,
          weightKg: parsedWeight,
          initialDevelopmentNote: initialDevelopmentNote
            ? String(initialDevelopmentNote)
            : null,
          photo: photo ? String(photo) : null,
        },
      });

      await tx.growthRecord.create({
        data: {
          childId: createdChild.id,
          heightCm: parsedHeight,
          weightKg: parsedWeight,
          note: "Data awal anak",
        },
      });

      return createdChild;
    });

    return successResponse(res, "Data anak berhasil disimpan", child, 201);
  } catch (error) {
    console.error("CREATE CHILD ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};

export const getMyChildren = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User tidak terautentikasi", 401);
    }

    const children = await prisma.child.findMany({
      where: {
        userId: String(req.user!.id),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        growthRecords: {
          orderBy: {
            recordedAt: "desc",
          },
          take: 1,
        },
      },
    });

    return successResponse(
        res, 
        "Data anak berhasil diambil", 
        children);
  } catch (error) {
    console.error("GET MY CHILDREN ERROR:", error);
    return errorResponse(
        res, 
        "Terjadi kesalahan pada server", 
        500);
  }
};

export const getChildById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User tidak terautentikasi", 401);
    }

    const childId = Number(req.params.id);

    if (Number.isNaN(childId)) {
      return errorResponse(res, "ID anak tidak valid", 400);
    }

    const child = await prisma.child.findFirst({
      where: {
        id: String(childId),
        userId: String(req.user!.id),
      },
      include: {
        growthRecords: {
          orderBy: {
            recordedAt: "desc",
          },
        },
        screeningSessions: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!child) {
      return errorResponse(res, "Data anak tidak ditemukan", 404);
    }

    return successResponse(res, "Detail anak berhasil diambil", child);
  } catch (error) {
    console.error("GET CHILD BY ID ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};