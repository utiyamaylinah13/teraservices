import "dotenv/config";
import prisma from "../../lib/prisma.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { generateOtp, hashOtp, getOtpExpiredAt } from "../../utils/otp.js";
import { sendOtpEmail } from "../../utils/mail.js";
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return errorResponse(res, "Email wajib diisi", 400);
        }
        const normalizedEmail = String(email).toLowerCase().trim();
        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });
        if (!user) {
            return errorResponse(res, "Email tidak terdaftar", 404);
        }
        if (user.isEmailVerified) {
            return errorResponse(res, "Email sudah diverifikasi", 400);
        }
        const otp = generateOtp();
        const hashedOtp = await hashOtp(otp);
        const newOtp = await prisma.$transaction(async (tx) => {
            await tx.otpCode.deleteMany({
                where: {
                    email: normalizedEmail,
                    purpose: "VERIFY_EMAIL",
                    verifiedAt: null,
                },
            });
            const createdOtp = await tx.otpCode.create({
                data: {
                    userId: user.id,
                    email: normalizedEmail,
                    codeHash: hashedOtp,
                    purpose: "VERIFY_EMAIL",
                    expiresAt: getOtpExpiredAt(),
                },
            });
            return createdOtp;
        });
        try {
            await sendOtpEmail(normalizedEmail, otp, "VERIFY_EMAIL");
        }
        catch (mailError) {
            console.error("Gagal mengirim ulang OTP:", mailError);
            await prisma.otpCode.delete({
                where: {
                    id: newOtp.id,
                },
            });
            return errorResponse(res, "Gagal mengirim ulang OTP ke email. Silakan coba lagi nanti.", 500);
        }
        return successResponse(res, "OTP baru berhasil dikirim ke email.", {
            email: normalizedEmail,
            expiredIn: "1 menit",
            devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
        });
    }
    catch (error) {
        console.error(error);
        return errorResponse(res, "Terjadi kesalahan pada server", 500);
    }
};
//# sourceMappingURL=resendOtpController.js.map