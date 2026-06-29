import prisma from "../src/lib/prisma";
import fs from "fs";
import csv from "csv-parser";

// Fungsi untuk menyesuaikan Enum Domain
const mapDomain = (csvDomain: string) => {
  switch (csvDomain) {
    case "COMMUNICATION_SPEECH":
      return "COMMUNICATION_SPEECH";
    case "FINE_MOTOR":
    case "GROSS_MOTOR":
      return "PHYSICAL_MOTOR"; // Digabung sesuai schema kamu
    case "COGNITIVE":
      return "COGNITIVE_PROBLEM_SOLVING";
    case "SOCIAL_INDEPENDENCE":
      return "SOCIAL_EMOTIONAL";
    default:
      return "PHYSICAL_MOTOR"; // Fallback
  }
};

// Fungsi untuk menyesuaikan Enum Indikasi
const mapIndication = (csvIndication: string) => {
  switch (csvIndication) {
    case "SPEECH_DELAY":
      return "SPEECH_DELAY";
    case "ASD":
      return "AUTISM"; // ASD menjadi AUTISM sesuai schema
    case "ADHD":
      return "ADHD";
    default:
      return null;
  }
};

// Fungsi untuk menyesuaikan Enum Kesulitan
const mapDifficulty = (csvDifficulty: string) => {
  switch (csvDifficulty) {
    case "Mudah":
      return "EASY";
    case "Sedang":
      return "MEDIUM";
    case "Sedang-Lanjut":
      return "HARD";
    default:
      return "EASY";
  }
};

const seedActivities = async () => {
  const activities: any[] = [];
  const csvFilePath = "prisma/data/activity_data.csv";

  console.log("Mulai membaca file CSV Aktivitas...");

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row) => {
        const stepsArray = row.steps ? row.steps.split(" | ").map((s: string) => s.trim()) : [];
        
        const toolsArray = row.materials ? [row.materials.trim()] : [];

        activities.push({
          title: row.title,
          domain: mapDomain(row.domainKey),
          relatedIndication: mapIndication(row.relatedIndicationKey),
          minAgeMonth: parseInt(row.minAgeMonth) || null,
          maxAgeMonth: parseInt(row.maxAgeMonth) || null,
          description: row.description,
          purpose: row.purpose,
          durationMinutes: parseInt(row.estimatedDurationMinutes) || 10,
          difficulty: mapDifficulty(row.difficulty),
          toolsNeeded: toolsArray, // Disimpan sebagai JSON array
          steps: stepsArray,       // Disimpan sebagai JSON array
          successIndicator: row.successIndicator,
          parentTips: row.safetyNotes,
          isActive: true,
        });
      })
      .on("end", async () => {
        console.log(`Berhasil membaca ${activities.length} aktivitas. Mulai menyimpan ke database...`);
        try {
          // Bersihkan data lama agar tidak menumpuk saat di-seed ulang
          await prisma.activityTemplate.deleteMany({});
          
          // Insert data baru
          const result = await prisma.activityTemplate.createMany({
            data: activities,
            skipDuplicates: true,
          });

          console.log(`✅ Sukses! ${result.count} Template Aktivitas berhasil dimasukkan ke PostgreSQL.`);
          resolve(true);
        } catch (error) {
          console.error("❌ Gagal menyimpan ke database:", error);
          reject(error);
        } finally {
          await prisma.$disconnect();
        }
      });
  });
};

seedActivities();