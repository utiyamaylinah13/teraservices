import mongoose, { Schema } from "mongoose";
const ActivityLogSchema = new Schema({
    userId: { type: String, required: true, index: true },
    action: {
        type: String,
        required: true,
        enum: [
            "LOGIN",
            "REGISTER",
            "LOGOUT",
            "SAVE_FACE_EMBEDDING",
            "UPDATE_PROFILE",
            "COMPLETE_ACTIVITY",
            "SUBMIT_SCREENING",
        ],
        index: true,
    },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
    userAgent: { type: String },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
// Index untuk mempercepat query per user & waktu
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
export const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);
//# sourceMappingURL=ActivityLog.js.map