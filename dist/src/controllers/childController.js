import prisma from '../lib/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { calculateChildAge } from '../helper/childAgeHelper.js';
const normalizeGender = (gender) => {
    const value = gender.toUpperCase().trim();
    if (["MALE", "LAKI-LAKI", "LAKI", "L"].includes(value)) {
        return "MALE";
    }
    if (["FEMALE", "PEREMPUAN", "P"].includes(value)) {
        return "FEMALE";
    }
    return null;
};
export const createChild = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, "User tidak terautentikasi", 401);
        }
        const { name, birthDate, gender, heightCm, weightKg, initialDevelopmentNote, photo } = req.body ?? {};
        if (!name || !gender || heightCm === undefined || weightKg === undefined || birthDate === undefined) {
            return errorResponse(res, "Nama anak, jenis kelamin, tanggal lahir, usia, tinggi badan, dan berat badan wajib diisi", 400);
        }
        const normalizedGender = normalizeGender(String(gender));
        if (!normalizedGender) {
            return errorResponse(res, "Jenis kelamin tidak valid. Gunakan MALE/FEMALE atau laki-laki/perempuan", 400);
        }
        const parsedHeight = Number(heightCm);
        const parsedWeight = Number(weightKg);
        if (Number.isNaN(parsedHeight) || parsedHeight <= 0) {
            return errorResponse(res, "Tinggi badan harus berupa angka positif", 400);
        }
        if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
            return errorResponse(res, "Berat badan harus berupa angka positif", 400);
        }
        const parsedBirthDate = new Date(String(birthDate));
        if (Number.isNaN(parsedBirthDate.getTime())) {
            return errorResponse(res, "Tanggal lahir tidak valid", 400);
        }
        if (parsedBirthDate > new Date()) {
            return errorResponse(res, "Tanggal lahir tidak boleh melebihi tanggal hari ini", 400);
        }
        const age = calculateChildAge(parsedBirthDate);
        if (age.ageMonth < 12 || age.ageMonth > 60) {
            return errorResponse(res, "Usia anak harus berada pada rentang 1 sampai 5 tahun", 400);
        }
        const child = await prisma.$transaction(async (tx) => {
            const createdChild = await tx.child.create({
                data: {
                    userId: req.user.id,
                    name: name,
                    birthDate: parsedBirthDate,
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
        return successResponse(res, "Data anak berhasil disimpan", child);
    }
    catch (error) {
        console.error("CREATE CHILD ERROR:", error);
        return errorResponse(res, "Terjadi kesalahan pada server", 500);
    }
};
export const getMyChildren = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, "User tidak terautentikasi", 401);
        }
        const children = await prisma.child.findMany({
            where: {
                userId: req.user.id,
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
        const childrenWithAge = children.map((child) => {
            if (!child.birthDate) {
                return {
                    ...child,
                    ageYear: null,
                    ageMonth: null,
                    ageText: null
                };
            }
            const age = calculateChildAge(child.birthDate);
            return {
                ...child,
                ageYear: age.ageYear,
                ageMonth: age.ageMonth,
                ageText: age.ageText
            };
        });
        return successResponse(res, "Data anak berhasil diambil", childrenWithAge);
    }
    catch (error) {
        console.error("GET MY CHILDREN ERROR:", error);
        return errorResponse(res, "Terjadi kesalahan pada server", 500);
    }
};
export const getChildById = async (req, res) => {
    try {
        if (!req.user) {
            return errorResponse(res, "User tidak terautentikasi", 401);
        }
        const childId = req.params.id;
        if (!childId) {
            return errorResponse(res, "ID anak wajib diisi", 400);
        }
        const child = await prisma.child.findFirst({
            where: {
                id: String(childId),
                userId: req.user.id,
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
        const age = child.birthDate ? calculateChildAge(child.birthDate) :
            {
                ageYear: null,
                ageMonth: null,
                ageText: null
            };
        return successResponse(res, "Detail anak berhasil diambil", {
            ...child,
            ageYear: age.ageText,
            ageMonth: age.ageMonth,
            ageText: age.ageText
        });
    }
    catch (error) {
        console.error("GET CHILD BY ID ERROR:", error);
        return errorResponse(res, "Terjadi kesalahan pada server", 500);
    }
};
//# sourceMappingURL=childController.js.map