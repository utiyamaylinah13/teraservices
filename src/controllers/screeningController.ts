import { Response } from "express";
import prisma from "../lib/prisma.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import type { AnswerInput, DomainKey } from "../types/screeningType.js";
import { DOMAIN_LABELS, DOMAIN_WEIGHTS } from "../constants/screeningConstant.js";
import { calculateChildAge } from "../helper/childAgeHelper.js";
import {
  getRiskCategory,
  getPriorityDomains,
  getMainIndicationByPriorityDomains,
  getIndicationSummary,
  getGeneralRecommendationText,
  getResultDescription,
  getScreeningQuestionsByAgeMonth,
} from "../helper/screeningHelper.js";
import { generateActivitiesForChild } from "./activityController.js";


export const getScreeningQuestionsByChild = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User tidak terautentikasi", 401);
    }

    const childId = req.params.childId;

    if (!childId) {
      return errorResponse(res, "ID anak wajib diisi", 400);
    }

    const child = await prisma.child.findFirst({
      where: {
        id: String(childId),
        userId: req.user.id,
      },
    });

    if (!child) {
      return errorResponse(res, "Data anak tidak ditemukan", 404);
    }

    if (!child.birthDate) {
      return errorResponse(res, "Tanggal lahir anak belum tersedia", 400);
    }

    const age = calculateChildAge(child.birthDate);
    const childAgeMonth = age.ageMonth;

    const questions = await getScreeningQuestionsByAgeMonth(childAgeMonth);

    return successResponse(res, "Pertanyaan screening berhasil diambil", {
      child: {
        id: child.id,
        name: child.name,
        birthDate: child.birthDate,
        ageYear: age.ageYear,
        ageMonth: age.ageMonth,
        ageText: age.ageText,
      },
      totalQuestions: questions.length,
      questions,
    });
  } catch (error) {
    console.error("GET SCREENING QUESTIONS ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};

export const startScreening = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User tidak terautentikasi", 401);
    }

    const childId = req.params.childId;

    if (!childId) {
      return errorResponse(res, "ID anak wajib diisi", 400);
    }

    const child = await prisma.child.findFirst({
      where: {
        id: String(childId),
        userId: req.user.id,
      },
    });

    if (!child) {
      return errorResponse(res, "Data anak tidak ditemukan", 404);
    }

    if (!child.birthDate) {
      return errorResponse(res, "Tanggal lahir anak belum tersedia", 400);
    }

    const age = calculateChildAge(child.birthDate);
    const childAgeMonth = age.ageMonth;

    const questions = await getScreeningQuestionsByAgeMonth(childAgeMonth);

    if (questions.length === 0) {
      return errorResponse(
        res,
        "Pertanyaan screening untuk usia anak ini belum tersedia",
        400
      );
    }

    const session = await prisma.screeningSession.create({
      data: {
        childId: child.id,
        status: "IN_PROGRESS",
        progressCurrentStep: 0,
        progressTotalStep: questions.length,
      },
    });

    return successResponse(
      res,
      "Sesi screening berhasil dimulai",
      {
        session,
        child: {
          id: child.id,
          name: child.name,
          birthDate: child.birthDate,
          ageYear: age.ageYear,
          ageMonth: age.ageMonth,
          ageText: age.ageText,
        },
        totalQuestions: questions.length,
        questions,
      },
      201
    );
  } catch (error) {
    console.error("START SCREENING ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};

export const submitScreening = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User tidak terautentikasi", 401);
    }

    const sessionId = req.params.sessionId;
    const { answers } = req.body ?? {};

    if (!sessionId) {
      return errorResponse(res, "ID sesi screening wajib diisi", 400);
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return errorResponse(res, "Jawaban screening wajib diisi", 400);
    }

    const session = await prisma.screeningSession.findFirst({
      where: {
        id: String(sessionId),
        child: {
          userId: req.user.id,
        },
      },
      include: {
        child: true,
      },
    });

    if (!session) {
      return errorResponse(res, "Sesi screening tidak ditemukan", 404);
    }

    if (session.status === "COMPLETED") {
      return errorResponse(res, "Sesi screening sudah selesai", 400);
    }

    if (!session.child.birthDate) {
      return errorResponse(res, "Tanggal lahir anak belum tersedia", 400);
    }

    const age = calculateChildAge(session.child.birthDate);
    const allowedQuestions = await getScreeningQuestionsByAgeMonth(age.ageMonth);
    const allowedQuestionIds = allowedQuestions.map((question) => question.id);

    const questionIds = answers.map((item: AnswerInput) =>
      String(item.questionId)
    );

    const uniqueQuestionIds = [...new Set(questionIds)];

    const hasInvalidAgeQuestion = uniqueQuestionIds.some(
      (questionId) => !allowedQuestionIds.includes(questionId)
    );

    if (hasInvalidAgeQuestion) {
      return errorResponse(
        res,
        "Terdapat pertanyaan yang tidak sesuai dengan usia anak",
        400
      );
    }

    if (uniqueQuestionIds.length !== answers.length) {
      return errorResponse(
        res,
        "Terdapat pertanyaan yang dijawab lebih dari satu kali",
        400
      );
    }

    if (answers.length !== allowedQuestions.length) {
      return errorResponse(
        res,
        `Jawaban belum lengkap. Total pertanyaan adalah ${allowedQuestions.length}, tetapi jawaban yang dikirim ${answers.length}.`,
        400
      );
    }

    const questions = await prisma.screeningQuestion.findMany({
      where: {
        id: {
          in: uniqueQuestionIds,
        },
        isActive: true,
      },
      include: {
        options: true,
      },
    });

    if (questions.length !== uniqueQuestionIds.length) {
      return errorResponse(
        res,
        "Ada pertanyaan yang tidak valid atau tidak aktif",
        400
      );
    }

    const domainScores: Record<DomainKey, number> = {
      COMMUNICATION_SPEECH: 0,
      PHYSICAL_MOTOR: 0,
      COGNITIVE_PROBLEM_SOLVING: 0,
      SOCIAL_EMOTIONAL: 0,
    };

    const domainMaxScores: Record<DomainKey, number> = {
      COMMUNICATION_SPEECH: 0,
      PHYSICAL_MOTOR: 0,
      COGNITIVE_PROBLEM_SOLVING: 0,
      SOCIAL_EMOTIONAL: 0,
    };

    let rawTotalScore = 0;

    const answerData = answers.map((item: AnswerInput) => {
      const questionId = String(item.questionId);
      const optionId = item.optionId ? String(item.optionId) : null;

      if (!optionId) {
        throw new Error("Pilihan jawaban wajib diisi");
      }

      const question = questions.find((q) => q.id === questionId);

      if (!question) {
        throw new Error("Pertanyaan tidak ditemukan");
      }

      const selectedOption = question.options.find(
        (option) => option.id === optionId
      );

      if (!selectedOption) {
        throw new Error("Pilihan jawaban tidak valid");
      }

      const domain = question.domain as DomainKey;
      const score = selectedOption.score;

      rawTotalScore += score;
      domainScores[domain] += score;

      return {
        screeningSessionId: session.id,
        questionId,
        optionId,
        answerValue: item.answerValue ? String(item.answerValue) : null,
        score,
      };
    });

    questions.forEach((question) => {
      const domain = question.domain as DomainKey;

      const maxOptionScore = question.options.reduce((max, option) => {
        return option.score > max ? option.score : max;
      }, 0);

      domainMaxScores[domain] += maxOptionScore;
    });

    const domainPercentages: Record<DomainKey, number> = {
      COMMUNICATION_SPEECH: domainMaxScores.COMMUNICATION_SPEECH
        ? Number(
            (
              (domainScores.COMMUNICATION_SPEECH /
                domainMaxScores.COMMUNICATION_SPEECH) *
              100
            ).toFixed(2)
          )
        : 0,

      PHYSICAL_MOTOR: domainMaxScores.PHYSICAL_MOTOR
        ? Number(
            (
              (domainScores.PHYSICAL_MOTOR /
                domainMaxScores.PHYSICAL_MOTOR) *
              100
            ).toFixed(2)
          )
        : 0,

      COGNITIVE_PROBLEM_SOLVING:
        domainMaxScores.COGNITIVE_PROBLEM_SOLVING
          ? Number(
              (
                (domainScores.COGNITIVE_PROBLEM_SOLVING /
                  domainMaxScores.COGNITIVE_PROBLEM_SOLVING) *
                100
              ).toFixed(2)
            )
          : 0,

      SOCIAL_EMOTIONAL: domainMaxScores.SOCIAL_EMOTIONAL
        ? Number(
            (
              (domainScores.SOCIAL_EMOTIONAL /
                domainMaxScores.SOCIAL_EMOTIONAL) *
              100
            ).toFixed(2)
          )
        : 0,
    };

    const finalScore = Number(
      (
        domainPercentages.COMMUNICATION_SPEECH *
          DOMAIN_WEIGHTS.COMMUNICATION_SPEECH +
        domainPercentages.PHYSICAL_MOTOR * DOMAIN_WEIGHTS.PHYSICAL_MOTOR +
        domainPercentages.COGNITIVE_PROBLEM_SOLVING *
          DOMAIN_WEIGHTS.COGNITIVE_PROBLEM_SOLVING +
        domainPercentages.SOCIAL_EMOTIONAL * DOMAIN_WEIGHTS.SOCIAL_EMOTIONAL
      ).toFixed(2)
    );

    const priorityDomains = getPriorityDomains(domainPercentages);

    const priorityDomain = priorityDomains.length === 1 ? priorityDomains[0] : null;

    const category = getRiskCategory(finalScore);

    const mainIndication = getMainIndicationByPriorityDomains(
      priorityDomains,
      finalScore
    );

    const indicationSummary = getIndicationSummary(
      category,
      priorityDomains
    );

    const resultDescription = getResultDescription(
      finalScore,
      category,
      priorityDomains,
      domainPercentages
    );

    const recommendationText = getGeneralRecommendationText(
      category,
      priorityDomains
    );

    const recomendationActivity = await generateActivitiesForChild(
      session.child.id,
      session.id,
      age.ageMonth,
      priorityDomains,
      mainIndication
    );

    const result = await prisma.$transaction(async (tx) => {
      await tx.screeningAnswer.deleteMany({
        where: {
          screeningSessionId: session.id,
        },
      });

      await tx.screeningAnswer.createMany({
        data: answerData,
      });

      const updatedSession = await tx.screeningSession.update({
        where: {
          id: session.id,
        },
        data: {
          status: "COMPLETED",
          progressCurrentStep: answerData.length,
          progressTotalStep: questions.length,
          finalScore: Math.round(finalScore),

          communicationSpeechScore: domainScores.COMMUNICATION_SPEECH,
          physicalMotorScore: domainScores.PHYSICAL_MOTOR,
          cognitiveProblemSolvingScore:
            domainScores.COGNITIVE_PROBLEM_SOLVING,
          socialEmotionalScore: domainScores.SOCIAL_EMOTIONAL,

          mainIndication: mainIndication as any,
          indicationSummary,
          resultDescription,
          recommendationText,
          completedAt: new Date(),
        },
        include: {
          child: true,
          answers: {
            include: {
              question: true,
              option: true,
            },
          },
        },
      });

      return updatedSession;
    });

    return successResponse(res, "Screening berhasil diselesaikan", {
      screening: result,
      calculation: {
        method: "Simple Additive Weighting (SAW)",
        rawTotalScore,
        finalScore,
        category,
        priorityDomain,
        priorityDomains,
        priorityDomainLabel: priorityDomain
          ? DOMAIN_LABELS[priorityDomain]
          : "Beberapa domain perkembangan",
        priorityDomainLabels: priorityDomains.map(
          (domain) => DOMAIN_LABELS[domain]
        ),
        weights: DOMAIN_WEIGHTS,
        domainScores,
        domainMaxScores,
        domainPercentages,
        disclaimer:
          "Hasil screening ini bukan diagnosis final dan tidak menggantikan pemeriksaan profesional.",
      },
      recomendationActivity
    });
  } catch (error) {
    console.error("SUBMIT SCREENING ERROR:", error);

    if (error instanceof Error) {
      return errorResponse(res, error.message, 400);
    }

    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};

export const getScreeningResult = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User tidak terautentikasi", 401);
    }

    const sessionId = req.params.sessionId;

    if (!sessionId) {
      return errorResponse(res, "ID sesi screening wajib diisi", 400);
    }

    const session = await prisma.screeningSession.findFirst({
      where: {
        id: String(sessionId),
        child: {
          userId: req.user.id,
        },
      },
      include: {
        // child: true,
        // answers: {
        //   include: {
        //     question: true,
        //     option: true,
        //   },
        // },
          dailyActivities: true
      },
    });

    if (!session) {
      return errorResponse(res, "Hasil screening tidak ditemukan", 404);
    }

    return successResponse(res, "Hasil screening berhasil diambil", session);
  } catch (error) {
    console.error("GET SCREENING RESULT ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};

export const getScreeningHistoryByChild = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, "User tidak terautentikasi", 401);
    }

    const childId = req.params.childId;

    if (!childId) {
      return errorResponse(res, "ID anak wajib diisi", 400);
    }

    const child = await prisma.child.findFirst({
      where: {
        id: String(childId),
        userId: req.user.id,
      },
    });

    if (!child) {
      return errorResponse(res, "Data anak tidak ditemukan", 404);
    }

    const histories = await prisma.screeningSession.findMany({
      where: {
        childId: String(childId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        answers: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    });

    return successResponse(
      res,
      "Riwayat screening berhasil diambil",
      histories
    );
  } catch (error) {
    console.error("GET SCREENING HISTORY ERROR:", error);
    return errorResponse(res, "Terjadi kesalahan pada server", 500);
  }
};