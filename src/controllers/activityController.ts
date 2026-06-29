import { Response } from "express";
import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import type { DomainKey, MainIndication } from "../types/screeningType.js";
import { ActivityStatus, ScreeningDomain, IndicationType } from "../../generated/prisma/client.js";

export const generateActivitiesForChild = async (
  childId: string,
  screeningSessionId: string,
  ageMonth: number,
  priorityDomains: DomainKey[],
  mainIndication: MainIndication
) => {
  try {
    const priorityTemplates = await prisma.activityTemplate.findMany({
      where: {
        isActive: true,
        minAgeMonth: { lte: ageMonth },
        maxAgeMonth: { gte: ageMonth },
        OR: [
          { relatedIndication: mainIndication as IndicationType },
          { domain: { in: priorityDomains as ScreeningDomain[] } }
        ]
      },
      take: 7,
    });

    const secondaryTemplates = await prisma.activityTemplate.findMany({
      where: {
        isActive: true,
        minAgeMonth: { lte: ageMonth },
        maxAgeMonth: { gte: ageMonth },
        domain: { notIn: priorityDomains as ScreeningDomain[] }
      },
      take: 7,
    });

    const combinedTemplates = [];
    const maxLength = Math.max(priorityTemplates.length, secondaryTemplates.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (priorityTemplates[i]) combinedTemplates.push(priorityTemplates[i]);
      if (secondaryTemplates[i]) combinedTemplates.push(secondaryTemplates[i]);
    }

    if (combinedTemplates.length === 0) return [];

    const today = new Date();
    const dailyActivitiesData = combinedTemplates.map((template, index) => {
      const scheduledDate = new Date(today);
      const daysToAdd = Math.floor(index / 2); 
      scheduledDate.setDate(today.getDate() + daysToAdd);

      if (index % 2 === 0) {
        scheduledDate.setHours(9, 0, 0, 0);
      } else {
        scheduledDate.setHours(16, 0, 0, 0); 
      }

      const reminderAt = new Date(scheduledDate);
      reminderAt.setMinutes(reminderAt.getMinutes() - 15);

      return {
        childId,
        screeningSessionId,
        templateId: template.id,
        title: template.title,
        domain: template.domain,
        relatedIndication: template.relatedIndication,
        description: template.description,
        purpose: template.purpose,
        durationMinutes: template.durationMinutes,
        difficulty: template.difficulty,
        toolsNeeded: template.toolsNeeded ?? [],
        steps: template.steps ?? [],
        successIndicator: template.successIndicator,
        parentTips: template.parentTips,
        scheduledDate, 
        reminderAt, 
        status: ActivityStatus.NOT_STARTED
      };
    });

    await prisma.dailyActivity.createMany({
      data: dailyActivitiesData,
      skipDuplicates: true,
    });

    // Otomatis inisiasi Progress Mingguan (REQ-048)
    const weekEndDate = new Date(today);
    weekEndDate.setDate(today.getDate() + 7);
    
    await prisma.weeklyActivityProgress.create({
      data: {
        childId,
        weekStartDate: today,
        weekEndDate: weekEndDate,
        totalActivity: dailyActivitiesData.length,
        completedActivity: 0,
        missedActivity: 0,
        progressPercent: 0
      }
    });

    return dailyActivitiesData;
  } catch (error) {
    console.error("GENERATE ACTIVITIES ERROR:", error);
    throw error;
  }
};

// Endpoint: Mengambil aktivitas anak untuk hari ini
export const getTodayActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { childId } = req.params;

    if (!childId) {
      return errorResponse(res, "ID Anak wajib disertakan", 400);
    }
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const activities = await prisma.dailyActivity.findMany({
      where: {
        childId: String(childId),
        scheduledDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    return successResponse(res, "Aktivitas hari ini berhasil diambil", activities);
  } catch (error) {
    console.error("GET TODAY ACTIVITIES ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan server", 500);
  }
};

// Endpoint: Mengupdate status aktivitas (misal: Selesai dimainkan)
export const updateActivityStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { activityId } = req.params;
    const { 
      status, 
      childResponse, 
      successLevel, 
      obstacleNote, 
      parentNote 
    } = req.body; 

    if (!activityId || !status) {
      return errorResponse(res, "ID Aktivitas dan status wajib disertakan", 400);
    }

    const upperStatus = String(status).toUpperCase(); 

    const activityUpdateData: any = {
      status: upperStatus as ActivityStatus,
    };

    const now = new Date();
    if (upperStatus === "IN_PROGRESS") {
      activityUpdateData.startedAt = now;
    } else if (upperStatus === "COMPLETED") {
      activityUpdateData.completedAt = now;
    } else if (upperStatus === "MISSED") {
      activityUpdateData.missedAt = now;
    }

    console.log("DEBUG - Data yang akan disimpan:", activityUpdateData);

    const result = await prisma.$transaction(
      async (tx) => {
        const updatedActivity = await tx.dailyActivity.update({
          where: { id: String(activityId) },
          data: activityUpdateData,
        });

        const isCompleted = upperStatus === "COMPLETED";

        // Simpan Catatan Orang Tua
        if (isCompleted && (childResponse || successLevel || obstacleNote || parentNote)) {
          await tx.activityNote.upsert({
            where: { dailyActivityId: updatedActivity.id },
            update: {
              childResponse,
              successLevel: successLevel ? Number(successLevel) : null,
              obstacleNote,
              parentNote
            },
            create: {
              dailyActivityId: updatedActivity.id,
              childResponse,
              successLevel: successLevel ? Number(successLevel) : null,
              obstacleNote,
              parentNote
            }
          });
        }

        const weeklyProgress = await tx.weeklyActivityProgress.findFirst({
          where: { childId: updatedActivity.childId },
          orderBy: { createdAt: 'desc' } 
        });

        if (weeklyProgress) {
          const totalCompleted = await tx.dailyActivity.count({
            where: { 
              childId: updatedActivity.childId, 
              status: "COMPLETED", 
              scheduledDate: { gte: weeklyProgress.weekStartDate, lte: weeklyProgress.weekEndDate } 
            }
          });

          const totalMissed = await tx.dailyActivity.count({
            where: { 
              childId: updatedActivity.childId, 
              status: "MISSED", 
              scheduledDate: { gte: weeklyProgress.weekStartDate, lte: weeklyProgress.weekEndDate } 
            }
          });

          // 4. PERBAIKAN: Keamanan mencegah pembagian dengan 0 (NaN)
          const totalAct = weeklyProgress.totalActivity > 0 ? weeklyProgress.totalActivity : 1;
          const percentage = (totalCompleted / totalAct) * 100;

          await tx.weeklyActivityProgress.update({
            where: { id: weeklyProgress.id },
            data: {
              completedActivity: totalCompleted,
              missedActivity: totalMissed,
              progressPercent: Number(percentage.toFixed(2))
            }
          });
        } else {
          console.log("DEBUG - Weekly Progress tidak ditemukan!");
        }

        return updatedActivity;
      },
      {
        maxWait: 5000, 
        timeout: 10000, 
      }
    );

    return successResponse(res, "Status aktivitas berhasil diperbarui", result);
  } catch (error) {
    console.error("UPDATE ACTIVITY STATUS ERROR:", error);
    return errorResponse(res, "Gagal memperbarui aktivitas", 500);
  }
};