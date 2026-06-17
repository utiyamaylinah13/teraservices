// domain2 pertanyaan
export type DomainKey =
  | "COMMUNICATION_SPEECH"
  | "PHYSICAL_MOTOR"
  | "COGNITIVE_PROBLEM_SOLVING"
  | "SOCIAL_EMOTIONAL";

export type AnswerInput = {
  questionId: string;
  optionId: string;
  answerValue?: string;
};

export type RiskCategory = "Risiko Rendah" | "Risiko Sedang" | "Risiko Tinggi";

export type MainIndication =
  | "SPEECH_DELAY"
  | "AUTISM"
  | "ADHD"
  | "DEVELOPMENT_CONCERN"
  | null;