import { ActivityLog } from "../models/ActivityLog.js";
/**
 * Mencatat aktivitas user ke MongoDB.
 * Dipanggil secara fire-and-forget (tidak memblokir response).
 */
export const logUserActivity = (options) => {
    const { userId, action, details, req } = options;
    // Fire-and-forget: tidak di-await agar tidak memblokir response API
    ActivityLog.create({
        userId,
        action,
        details: details ?? {},
        ipAddress: req?.ip ?? req?.socket?.remoteAddress ?? "unknown",
        userAgent: req?.headers?.["user-agent"] ?? "unknown",
    }).catch((err) => {
        // Logging error hanya di console, tidak sampai ke user
        console.error(`[ActivityLog] Gagal menyimpan log (${action}):`, err);
    });
};
//# sourceMappingURL=logger.js.map