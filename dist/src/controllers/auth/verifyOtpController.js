import "dotenv/config";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { compareOtp } from "../../utils/otp.js";
import { generateToken } from "../../utils/jwt.js";
export const verifyOtp = async (req, res) => {
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
        const updatedUser = await prisma.$transaction(async (tx) => {
            await tx.otpCode.update({
                where: {
                    id: otpData.id,
                },
                data: {
                    verifiedAt: new Date(),
                },
            });
            const user = await tx.user.update({
                where: {
                    email: normalizedEmail,
                },
                data: {
                    isEmailVerified: true,
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
            return user;
        });
        const token = generateToken({
            id: String(updatedUser.id),
            email: updatedUser.email,
        });
        return successResponse(res, "Verifikasi OTP berhasil", {
            token,
            user: {
                id: updatedUser.id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                profileImage: updatedUser.profileImage,
                isEmailVerified: updatedUser.isEmailVerified,
                isFaceRecognitionActive: updatedUser.isFaceRecognitionActive,
                hasChildData: updatedUser.children.length > 0,
                children: updatedUser.children,
            },
        });
    }
    catch (error) {
        console.error(error);
        return errorResponse(res, "Terjadi kesalahan pada server", 500);
    }
};
//# sourceMappingURL=verifyOtpController.js.map