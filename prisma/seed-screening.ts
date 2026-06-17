import xlsx from "xlsx";
import prisma from "../src/lib/prisma.js";

type ScoringType = "RISK" | "PROTECTIVE";

const EXCEL_PATH = "prisma/data/screening_questions.xlsx";

// Karena target aplikasi Mas Roziq 2–6 tahun,
// sheet usia 1 tahun tidak di-import dulu.
const TARGET_MIN_AGE_YEAR = 1;

const domainMap: Record<string, string> = {
  Komunikasi: "COMMUNICATION_SPEECH",
  Fisik: "PHYSICAL_MOTOR",
  Kognitif: "COGNITIVE_PROBLEM_SOLVING",
  Sosial: "SOCIAL_EMOTIONAL",
};

const getOptionsByScoringType = (scoringType: ScoringType) => {
  if (scoringType === "RISK") {
    return [
      {
        label: "Tidak",
        value: "no",
        score: 0,
        orderNumber: 1,
      },
      {
        label: "Kadang-kadang",
        value: "sometimes",
        score: 1,
        orderNumber: 2,
      },
      {
        label: "Ya",
        value: "yes",
        score: 2,
        orderNumber: 3,
      },
    ];
  }

  return [
    {
      label: "Tidak",
      value: "no",
      score: 2,
      orderNumber: 1,
    },
    {
      label: "Kadang-kadang",
      value: "sometimes",
      score: 1,
      orderNumber: 2,
    },
    {
      label: "Ya",
      value: "yes",
      score: 0,
      orderNumber: 3,
    },
  ];
};

const getAgeYearFromSheetName = (sheetName: string) => {
  const match = sheetName.match(/Usia\s+(\d+)\s+Tahun/i);

  if (!match) {
    return null;
  }

  return Number(match[1]);
};

async function main() {
  const workbook = xlsx.readFile(EXCEL_PATH);

  let totalQuestions = 0;
  let totalOptions = 0;

  for (const sheetName of workbook.SheetNames) {
    const ageYear = getAgeYearFromSheetName(sheetName);

    if (!ageYear) {
      console.log(`Lewati sheet karena format usia tidak dikenali: ${sheetName}`);
      continue;
    }

    if (ageYear < TARGET_MIN_AGE_YEAR) {
      console.log(`Lewati sheet usia ${ageYear} tahun`);
      continue;
    }

    const minAgeYears = ageYear;
    const maxAgeYears = ageYear === 5 ? 6 : ageYear;

    const sheet = workbook.Sheets[sheetName];

    const rows = xlsx.utils.sheet_to_json<{
      Domain?: string;
      ScreeningQuestion?: string;
      ScoringType?: string;
    }>(sheet, {
      defval: "",
    });

    let currentDomain = "";
    let orderPerDomain: Record<string, number> = {
      COMMUNICATION_SPEECH: 0,
      PHYSICAL_MOTOR: 0,
      COGNITIVE_PROBLEM_SOLVING: 0,
      SOCIAL_EMOTIONAL: 0,
    };

    for (const row of rows) {
      const rawDomain = String(row.Domain || "").trim();
      const questionText = String(row.ScreeningQuestion || "").trim();
      const scoringType = String(row.ScoringType || "")
        .trim()
        .toUpperCase() as ScoringType;

      if (rawDomain) {
        currentDomain = rawDomain;
      }

      if (!questionText) {
        continue;
      }

      const domainCode = domainMap[currentDomain];

      if (!domainCode) {
        throw new Error(
          `Domain tidak valid di sheet ${sheetName}: ${currentDomain}`
        );
      }

      if (scoringType !== "RISK" && scoringType !== "PROTECTIVE") {
        throw new Error(
          `ScoringType tidak valid pada pertanyaan: ${questionText}. Gunakan RISK atau PROTECTIVE.`
        );
      }

      orderPerDomain[domainCode] += 1;

      const existingQuestion = await prisma.screeningQuestion.findFirst({
        where: {
          question: questionText,
          domain: domainCode as any,
          minAgeYears,
          maxAgeYears,
        },
      });

      let question;

      if (existingQuestion) {
        question = await prisma.screeningQuestion.update({
          where: {
            id: existingQuestion.id,
          },
          data: {
            domain: domainCode as any,
            question: questionText,
            type: "MULTIPLE_CHOICE" as any,
            isRequired: true,
            orderNumber: orderPerDomain[domainCode],
            isActive: true,
            minAgeYears,
            maxAgeYears,
          },
        });

        await prisma.screeningOption.deleteMany({
          where: {
            questionId: question.id,
          },
        });
      } else {
        question = await prisma.screeningQuestion.create({
          data: {
            domain: domainCode as any,
            question: questionText,
            type: "MULTIPLE_CHOICE" as any,
            isRequired: true,
            orderNumber: orderPerDomain[domainCode],
            isActive: true,
            minAgeYears,
            maxAgeYears,
          },
        });

        totalQuestions += 1;
      }

      const options = getOptionsByScoringType(scoringType);

      await prisma.screeningOption.createMany({
        data: options.map((option) => ({
          questionId: question.id,
          label: option.label,
          value: option.value,
          score: option.score,
          orderNumber: option.orderNumber,
        })),
      });

      totalOptions += options.length;
    }

    console.log(`Selesai import sheet: ${sheetName}`);
  }

  console.log("Import screening selesai.");
  console.log(`Pertanyaan baru: ${totalQuestions}`);
  console.log(`Opsi dibuat/diupdate: ${totalOptions}`);
}

main()
  .catch((error) => {
    console.error("Import screening gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });