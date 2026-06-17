import type { DomainKey, MainIndication, RiskCategory } from "../types/screeningType.js";
import { DOMAIN_LABELS, SCREENING_DISCLAIMER } from "../constants/screeningConstant.js";

export const getRiskCategory = (finalScore: number): RiskCategory => {
  if (finalScore <= 40) return "Risiko Rendah";
  if (finalScore <= 70) return "Risiko Sedang";
  return "Risiko Tinggi";
};

export const getPriorityDomains = (
  domainPercentages: Record<DomainKey, number>
): DomainKey[] => {
  const maxPercentage = Math.max(...Object.values(domainPercentages));

  if (maxPercentage <= 0) {
    return [];
  }

  return Object.entries(domainPercentages)
    .filter(([, value]) => value === maxPercentage)
    .map(([domain]) => domain as DomainKey);
};

export const getMainIndicationByPriorityDomains = (
  priorityDomains: DomainKey[],
  finalScore: number
): MainIndication => {
  if (finalScore <= 40) {
    return null;
  }

  if (priorityDomains.length !== 1) {
    return "DEVELOPMENT_CONCERN";
  }

  const priorityDomain = priorityDomains[0];

  if (priorityDomain === "COMMUNICATION_SPEECH") {
    return "SPEECH_DELAY";
  }

  if (priorityDomain === "SOCIAL_EMOTIONAL") {
    return "AUTISM";
  }

  if (priorityDomain === "COGNITIVE_PROBLEM_SOLVING") {
    return "ADHD";
  }

  return "DEVELOPMENT_CONCERN";
};

export const getIndicationSummary = (
  category: RiskCategory,
  priorityDomains: DomainKey[]
) => {
  if (category === "Risiko Rendah") {
    return "Risiko Rendah. Tidak ditemukan domain risiko dominan.";
  }

  if (priorityDomains.length > 1) {
    const domainLabels = priorityDomains
      .map((domain) => DOMAIN_LABELS[domain])
      .join(", ");

    return `${category}. Risiko terlihat pada beberapa domain: ${domainLabels}.`;
  }

  const priorityDomain = priorityDomains[0];

  return `${category}. Domain prioritas: ${DOMAIN_LABELS[priorityDomain]}.`;
};

export const getGeneralRecommendationText = (
  category: RiskCategory,
  priorityDomains: DomainKey[]
) => {
  if (category === "Risiko Rendah") {
    return "Perkembangan anak relatif berada pada kategori risiko rendah. Orang tua disarankan tetap memberikan stimulasi rutin, meningkatkan interaksi dua arah, dan memantau perkembangan anak secara berkala.";
  }

  if (category === "Risiko Tinggi") {
    return "Hasil screening menunjukkan risiko tinggi. Orang tua disarankan melakukan konsultasi dengan tenaga profesional seperti psikolog, dokter anak, atau klinik tumbuh kembang. Aktivitas stimulasi di rumah dapat dilakukan sebagai pendamping, bukan pengganti pemeriksaan profesional.";
  }

  if (priorityDomains.length > 1) {
    return "Disarankan memberikan stimulasi menyeluruh pada beberapa aspek perkembangan anak, serta melakukan pemantauan berkala. Orang tua juga dapat mempertimbangkan konsultasi dengan tenaga profesional apabila hambatan terlihat menetap.";
  }

  const priorityDomain = priorityDomains[0];

  if (priorityDomain === "COMMUNICATION_SPEECH") {
    return "Disarankan memberikan stimulasi komunikasi dan bicara, seperti membacakan cerita, menyebut nama benda, mengajak anak meniru kata sederhana, dan mengurangi screen time.";
  }

  if (priorityDomain === "PHYSICAL_MOTOR") {
    return "Disarankan memberikan stimulasi fisik dan motorik, seperti latihan koordinasi gerak, aktivitas motorik halus, bermain susun balok, menggenggam, dan aktivitas gerak sederhana yang aman.";
  }

  if (priorityDomain === "COGNITIVE_PROBLEM_SOLVING") {
    return "Disarankan memberikan stimulasi kognitif, seperti mencocokkan warna, menyusun puzzle sederhana, permainan sebab-akibat, dan latihan mengikuti instruksi bertahap.";
  }

  return "Disarankan memberikan stimulasi sosial emosional, seperti bermain bergiliran, melatih kontak mata, mengenali ekspresi, dan membangun interaksi positif dengan orang tua.";
};

export const getResultDescription = (
  finalScore: number,
  category: RiskCategory,
  priorityDomains: DomainKey[],
  domainPercentages: Record<DomainKey, number>
) => {
  if (priorityDomains.length > 1) {
    const domainLabels = priorityDomains
      .map((domain) => `${DOMAIN_LABELS[domain]} sebesar ${domainPercentages[domain]}%`)
      .join(", ");

    return `Berdasarkan hasil perhitungan screening menggunakan metode SAW, skor akhir anak adalah ${finalScore}%. Kategori hasil adalah ${category}. Risiko terlihat pada beberapa domain perkembangan, yaitu ${domainLabels}. ${SCREENING_DISCLAIMER}`;
  }

  const priorityDomain = priorityDomains[0];

  return `Berdasarkan hasil perhitungan screening menggunakan metode SAW, skor akhir anak adalah ${finalScore}%. Kategori hasil adalah ${category}. Domain dengan persentase tertinggi adalah ${DOMAIN_LABELS[priorityDomain]} sebesar ${domainPercentages[priorityDomain]}%. ${SCREENING_DISCLAIMER}`;
};