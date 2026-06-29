import { Response } from "express";
import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";

export const getActivityStats = async (req: AuthRequest, res: Response) => {
    try {
        const childId = String(req.params.childId);
        const weeklyProgress = await prisma.weeklyActivityProgress.findFirst({
            where: { childId },
            orderBy: { weekStartDate: 'desc' }
        });
        console.log("Hasil query weeklyProgress:", weeklyProgress);

    return successResponse(res, "Data statistik dashboard berhasil diambil", {
        progressPercent: weeklyProgress?.progressPercent,
        completedActivity: weeklyProgress?.completedActivity,
        totalActivity: weeklyProgress?.totalActivity
    });
  } catch (error) {
    console.error("DASHBOARD STATS ERROR:", error);
    return errorResponse(res, "Gagal mengambil data dashboard", 500);
  }
};

export const getLastScreeningStats = async (req : AuthRequest, res : Response) => {
    try {
        const childId = String(req.params.childId);
        const lastScreening = await prisma.screeningSession.findFirst({
            where: { childId,
                status: 'COMPLETED' },
            orderBy: { completedAt: 'desc' }
        });

        return successResponse(res, "data statistik secreening trakhir diambil",{
            radar: lastScreening ? {
                labels: ["Komunikasi", "Motorik", "Kognitif", "Sosial"],
                values: [
                lastScreening.communicationSpeechScore,
                lastScreening.physicalMotorScore,
                lastScreening.cognitiveProblemSolvingScore,
                lastScreening.socialEmotionalScore
                ]
            } : null
        })
    } catch (error) {
        console.error(res, error);
        return errorResponse(res, "gagal mengambil data screening terakhir", 500);
    }
}

export const getscreeningHistoryStats = async (req : AuthRequest, res : Response) => {
    try {
        const childId = String(req.params.childId);

        const screeningHistory = await prisma.screeningSession.findMany({
            where: { childId, 
                status: 'COMPLETED' },
            orderBy: { completedAt: 'asc' },
            take: 5
        });

        return successResponse(res, "data berhasil diambil", {
            trend: screeningHistory.map(s => ({
                date: s.completedAt?.toISOString().split('T')[0],
                score: s.finalScore
            }))
        });
    } catch (error) {
        console.error(res, error);
        return errorResponse(res, "gagal mengambil data screening terakhir", 500);

    }
}