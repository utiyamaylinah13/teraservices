import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { logUserActivity } from "../utils/logger.js";
import { ActivityLog } from "../models/ActivityLog.js";
// Endpoint: Update Profil User
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return errorResponse(res, "Unauthorized", 401);
        const { fullName, phone, profileImage } = req.body;
        const dataToUpdate = {};
        if (fullName)
            dataToUpdate.fullName = fullName;
        if (phone !== undefined)
            dataToUpdate.phone = phone;
        if (profileImage !== undefined)
            dataToUpdate.profileImage = profileImage;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                profileImage: true,
            }
        });
        logUserActivity({
            userId,
            action: "UPDATE_PROFILE",
            details: { updatedFields: Object.keys(dataToUpdate) },
            req,
        });
        return successResponse(res, "Profil berhasil diperbarui", updatedUser);
    }
    catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        return errorResponse(res, "Gagal memperbarui profil", 500);
    }
};
// Endpoint: Simpan Face Embedding dari Flutter
export const saveFaceEmbedding = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return errorResponse(res, "Unauthorized", 401);
        const { embedding, deviceName, deviceId } = req.body;
        if (!embedding) {
            return errorResponse(res, "Data embedding wajah wajib disertakan", 400);
        }
        // Menonaktifkan credential wajah lama milik user ini (opsional, jika 1 user = 1 wajah aktif)
        await prisma.faceCredential.updateMany({
            where: { userId },
            data: { isActive: false }
        });
        // Menyimpan embedding wajah baru
        const newCredential = await prisma.faceCredential.create({
            data: {
                userId,
                embedding,
                deviceName,
                deviceId,
                isActive: true
            }
        });
        // Memperbarui status Face Recognition di tabel User
        await prisma.user.update({
            where: { id: userId },
            data: { isFaceRecognitionActive: true }
        });
        logUserActivity({
            userId,
            action: "SAVE_FACE_EMBEDDING",
            details: { deviceName: deviceName ?? null, deviceId: deviceId ?? null },
            req,
        });
        return successResponse(res, "Data wajah berhasil disimpan", newCredential);
    }
    catch (error) {
        console.error("SAVE FACE EMBEDDING ERROR:", error);
        return errorResponse(res, "Gagal menyimpan data wajah", 500);
    }
};
// Endpoint: Mengambil Riwayat Aktivitas User dari MongoDB
export const getUserActivityLogs = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return errorResponse(res, "Unauthorized", 401);
        const page = parseInt(req.query.page ?? "1");
        const limit = parseInt(req.query.limit ?? "20");
        const action = req.query.action;
        const filter = { userId };
        if (action)
            filter.action = action.toUpperCase();
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            ActivityLog.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ActivityLog.countDocuments(filter),
        ]);
        return successResponse(res, "Riwayat aktivitas berhasil diambil", {
            logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("GET USER ACTIVITY LOGS ERROR:", error);
        return errorResponse(res, "Gagal mengambil riwayat aktivitas", 500);
    }
};
// Endpoint: Upload Foto Profil User
export const uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return errorResponse(res, "Unauthorized", 401);
        if (!req.file) {
            return errorResponse(res, "Tidak ada file foto yang diunggah", 400);
        }
        // Format URL foto profil statis
        const photoUrl = `${req.protocol}://${req.get("host")}/uploads/profile-photos/${req.file.filename}`;
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profileImage: photoUrl },
            select: {
                id: true,
                fullName: true,
                email: true,
                profileImage: true,
            }
        });
        logUserActivity({
            userId,
            action: "UPDATE_PROFILE",
            details: { updatedFields: ["profileImage"], photoUrl },
            req,
        });
        return successResponse(res, "Foto profil berhasil diperbarui", {
            photoUrl,
            user: updatedUser
        });
    }
    catch (error) {
        console.error("UPLOAD PROFILE PHOTO ERROR:", error);
        return errorResponse(res, "Gagal mengunggah foto profil", 500);
    }
};
//# sourceMappingURL=userController.js.map