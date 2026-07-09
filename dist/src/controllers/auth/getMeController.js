import "dotenv/config";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
export const getMe = async (req, res) => {
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
        const children = user.children;
        return successResponse(res, "Data user berhasil diambil", {
            ...user,
            hasChildData: Array.isArray(children) && children.length > 0,
        });
    }
    catch (error) {
        console.error(error);
        return errorResponse(res, "Terjadi kesalahan pada server", 500);
    }
};
export const logout = async (_req, res) => {
    return successResponse(res, "Logout berhasil");
};
//# sourceMappingURL=getMeController.js.map