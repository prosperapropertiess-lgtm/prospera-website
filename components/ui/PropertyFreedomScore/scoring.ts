import { STAGES, AnyQuestion, Question } from "./questions";

export type Answers = Record<string, string | number>;

export interface Subscores {
  communication: number;
  maintenance: number;
  financial: number;
  operational: number;
  time: number;
  stress: number;
}

export interface RecommendationItem {
  title: string;
  problem: string;
  whyItMatters: string;
  timeToImplement: string;
  difficulty: "Easy" | "Medium" | "Hard";
  impact: "High" | "Medium" | "Low";
  diyPossible: boolean;
}

export interface ScoreResult {
  overall: number;
  subscores: Subscores;
  yearlyHours: number;
  monthlyHours: number;
  label: string;
  color: string;
  bottlenecks: string[];
  quickWins: RecommendationItem[];
  longTermImprovements: RecommendationItem[];
}

function findQuestionOption(
  questionId: string,
  answerValue: string
): number {
  for (const stage of STAGES) {
    for (const q of stage.questions) {
      if (q.id === questionId && q.type === "single") {
        const opt = (q as Question).options.find((o) => o.value === answerValue);
        return opt?.score ?? 0;
      }
    }
  }
  return 0;
}

function computeSingleScore(
  answers: Answers,
  questionIds: string[],
  maxPerQuestion = 4
): number {
  const raw = questionIds.reduce((sum, id) => {
    const answer = answers[id];
    if (typeof answer === "string") {
      return sum + findQuestionOption(id, answer);
    }
    return sum;
  }, 0);
  const max = questionIds.length * maxPerQuestion;
  return max === 0 ? 0 : (raw / max) * 100;
}

function computeCommunicationScore(answers: Answers): number {
  return computeSingleScore(answers, [
    "contact_method",
    "maintenance_reporting",
    "weekly_interruptions",
    "personal_number",
    "after_hours",
  ]);
}

function computeMaintenanceScore(answers: Answers): number {
  return computeSingleScore(answers, [
    "repair_tracking",
    "contractor_network",
    "emergency_protocol",
    "maintenance_coordinator",
  ]);
}

function computeFinancialScore(answers: Answers): number {
  return computeSingleScore(answers, [
    "rent_collection",
    "late_rent_process",
    "financial_tracking",
    "owner_reporting",
  ]);
}

function computeOperationalScore(answers: Answers): number {
  return computeSingleScore(answers, [
    "document_storage",
    "lease_renewals",
    "inspection_schedule",
    "vendor_database",
  ]);
}

function computeTimeScore(answers: Answers): {
  score: number;
  monthlyHours: number;
  yearlyHours: number;
} {
  const monthly =
    (Number(answers["hours_communication"] ?? 5) +
      Number(answers["hours_maintenance"] ?? 4) +
      Number(answers["hours_rent"] ?? 3) +
      Number(answers["hours_admin"] ?? 2) +
      Number(answers["hours_emergencies"] ?? 2));
  const yearly = monthly * 12;
  let score: number;
  if (yearly <= 24) {
    score = 100;
  } else if (yearly >= 300) {
    score = 0;
  } else {
    score = ((300 - yearly) / 276) * 100;
  }
  return { score: Math.max(0, Math.min(100, score)), monthlyHours: monthly, yearlyHours: yearly };
}

function computeStressScore(answers: Answers): number {
  const intrusion = Number(answers["stress_mental_intrusion"] ?? 3);
  const predictability = Number(answers["stress_income_predictability"] ?? 3);
  const ltbConfidence = Number(answers["stress_ltb_confidence"] ?? 3);
  const frequency = Number(answers["stress_frequency"] ?? 3);
  const preparedness = Number(answers["stress_preparedness"] ?? 3);

  const rawIntrusion = intrusion === 1 ? 4 : intrusion === 2 ? 3 : intrusion === 3 ? 2 : intrusion === 4 ? 1 : 0;
  const rawPredictability = predictability - 1;
  const rawConfidence = ltbConfidence - 1;
  const rawFrequency = frequency === 1 ? 4 : frequency === 2 ? 3 : frequency === 3 ? 2 : frequency === 4 ? 1 : 0;
  const rawPreparedness = preparedness - 1;

  const total = rawIntrusion + rawPredictability + rawConfidence + rawFrequency + rawPreparedness;
  return (total / 20) * 100;
}

function computeOverallScore(subscores: Subscores): number {
  const weighted =
    subscores.communication * 0.2 +
    subscores.maintenance * 0.2 +
    subscores.financial * 0.2 +
    subscores.operational * 0.15 +
    subscores.time * 0.15 +
    subscores.stress * 0.1;
  return Math.round(weighted);
}

export function getScoreLabel(score: number): string {
  if (score <= 39) return "Highly Dependent";
  if (score <= 59) return "Somewhat Dependent";
  if (score <= 74) return "Moderately Free";
  if (score <= 89) return "Largely Free";
  return "Fully Independent";
}

export function getScoreColor(score: number): string {
  if (score <= 39) return "#C0392B";
  if (score <= 59) return "#E67E22";
  if (score <= 74) return "#F1C40F";
  if (score <= 89) return "#27AE60";
  return "#1ABC9C";
}

function getBottlenecks(subscores: Subscores): string[] {
  const entries = Object.entries(subscores) as [keyof Subscores, number][];
  return entries
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([key]) => key);
}

const CATEGORY_PRIORITY = [
  "communication",
  "maintenance",
  "financial",
  "operational",
  "time",
  "stress",
];

function getQuickWins(subscores: Subscores): RecommendationItem[] {
  const lowCategories = (Object.entries(subscores) as [keyof Subscores, number][])
    .filter(([, score]) => score < 50)
    .sort((a, b) => {
      const ai = CATEGORY_PRIORITY.indexOf(a[0]);
      const bi = CATEGORY_PRIORITY.indexOf(b[0]);
      return ai - bi;
    })
    .slice(0, 3)
    .map(([key]) => key);

  // If not enough low categories, fill with lowest scoring
  if (lowCategories.length < 3) {
    const allSorted = (Object.entries(subscores) as [keyof Subscores, number][])
      .sort((a, b) => a[1] - b[1])
      .map(([key]) => key);
    for (const cat of allSorted) {
      if (!lowCategories.includes(cat) && lowCategories.length < 3) {
        lowCategories.push(cat);
      }
    }
  }

  const recommendations: Record<string, RecommendationItem> = {
    communication: {
      title: "Set Up a Dedicated Contact Channel",
      problem: "Tenants are reaching you on your personal number at all hours.",
      whyItMatters:
        "Every text to your personal phone blurs the line between landlord and on-call employee. A dedicated number or tenant portal creates the separation you need.",
      timeToImplement: "1–2 hours",
      difficulty: "Easy",
      impact: "High",
      diyPossible: true,
    },
    maintenance: {
      title: "Create a Maintenance Request Template",
      problem:
        "No structured way for tenants to report issues means every repair starts with confusion.",
      whyItMatters:
        "A simple request form captures the right details upfront — preventing the 4-message back-and-forth to understand what's actually broken.",
      timeToImplement: "2–3 hours",
      difficulty: "Easy",
      impact: "High",
      diyPossible: true,
    },
    financial: {
      title: "Switch to Pre-Authorized Debit",
      problem: "Manual rent collection means you're depending on tenants to remember.",
      whyItMatters:
        "PAD removes the human element from payment. Rent arrives on the 1st without a reminder, a text, or a moment of your attention.",
      timeToImplement: "1 week to set up",
      difficulty: "Easy",
      impact: "High",
      diyPossible: true,
    },
    operational: {
      title: "Centralize Your Documents in the Cloud",
      problem: "Scattered leases and documents slow down every decision.",
      whyItMatters:
        "When a tenant questions a clause or you need to reference something, a 30-second cloud search beats a 30-minute hunt through email.",
      timeToImplement: "Half a day",
      difficulty: "Easy",
      impact: "Medium",
      diyPossible: true,
    },
    time: {
      title: "Audit and Batch Your Landlord Tasks",
      problem: "Time is spent reactively throughout the week instead of proactively.",
      whyItMatters:
        "Batching communications and admin into weekly blocks cuts context-switching and reclaims hours each month.",
      timeToImplement: "1–2 hours to set up",
      difficulty: "Easy",
      impact: "Medium",
      diyPossible: true,
    },
    stress: {
      title: "Build a Landlord-Tenant Law Reference Sheet",
      problem: "Uncertainty about your legal obligations creates constant background anxiety.",
      whyItMatters:
        "A one-page reference for your most common scenarios means you're never second-guessing your rights or obligations.",
      timeToImplement: "2–3 hours",
      difficulty: "Easy",
      impact: "High",
      diyPossible: true,
    },
  };

  return lowCategories.map((cat) => recommendations[cat]).filter(Boolean);
}

function getLongTermImprovements(): RecommendationItem[] {
  return [
    {
      title: "Build a Contractor Database",
      problem: "Without vetted contractors, every repair is a gamble.",
      whyItMatters:
        "A trusted contractor list cuts your response time from days to hours and protects tenants from fly-by-night operators.",
      timeToImplement: "2–4 weeks",
      difficulty: "Medium",
      impact: "High",
      diyPossible: true,
    },
    {
      title: "Implement a Tenant Portal",
      problem: "All communication runs through you personally.",
      whyItMatters:
        "A portal creates a paper trail, separates your personal life, and allows tenants to submit requests without interrupting your day.",
      timeToImplement: "1–2 weeks",
      difficulty: "Medium",
      impact: "High",
      diyPossible: true,
    },
    {
      title: "Create a Property Operations Manual",
      problem: "Everything lives in your head.",
      whyItMatters:
        "Documenting your processes for each property means you — or anyone else — can handle any situation without starting from scratch.",
      timeToImplement: "1–2 months",
      difficulty: "Hard",
      impact: "High",
      diyPossible: true,
    },
  ];
}

export function computeScoreResult(answers: Answers): ScoreResult {
  const communication = Math.round(computeCommunicationScore(answers));
  const maintenance = Math.round(computeMaintenanceScore(answers));
  const financial = Math.round(computeFinancialScore(answers));
  const operational = Math.round(computeOperationalScore(answers));
  const { score: time, monthlyHours, yearlyHours } = computeTimeScore(answers);
  const stress = Math.round(computeStressScore(answers));

  const subscores: Subscores = {
    communication,
    maintenance,
    financial,
    operational,
    time: Math.round(time),
    stress,
  };

  const overall = computeOverallScore(subscores);

  return {
    overall,
    subscores,
    yearlyHours,
    monthlyHours,
    label: getScoreLabel(overall),
    color: getScoreColor(overall),
    bottlenecks: getBottlenecks(subscores),
    quickWins: getQuickWins(subscores),
    longTermImprovements: getLongTermImprovements(),
  };
}
