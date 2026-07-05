import { QUESTIONS, AnyQuestion } from "./questions";

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

// ─── Score helpers ────────────────────────────────────────────────────────────

function getOptionScore(questionId: string, value: string): number {
  const q = QUESTIONS.find((q) => q.id === questionId);
  if (!q || q.type !== "single") return 0;
  return q.options.find((o) => o.value === value)?.score ?? 0;
}

function categoryScore(answers: Answers, category: string): number {
  const qs = QUESTIONS.filter((q) => q.category === category);
  if (qs.length === 0) return 50;

  let total = 0;
  let maxPossible = 0;

  for (const q of qs) {
    if (q.type === "single") {
      const val = answers[q.id] as string | undefined;
      const maxScore = Math.max(...q.options.map((o) => o.score));
      maxPossible += maxScore;
      if (val !== undefined) total += getOptionScore(q.id, val);
    }
  }

  return maxPossible === 0 ? 50 : Math.round((total / maxPossible) * 100);
}

function timeScore(answers: Answers): { score: number; monthlyHours: number; yearlyHours: number } {
  const monthly = Number(answers["hours_total"] ?? 12);
  const yearly = monthly * 12;
  let score: number;
  if (yearly <= 24) score = 100;
  else if (yearly >= 240) score = 0;
  else score = ((240 - yearly) / 216) * 100;
  return { score: Math.max(0, Math.min(100, Math.round(score))), monthlyHours: monthly, yearlyHours: yearly };
}

function stressScore(answers: Answers): number {
  const intrusion = parseInt(answers["stress_mental_intrusion"] as string ?? "2", 10);
  const prepared = parseInt(answers["stress_preparedness"] as string ?? "2", 10);
  const maxPer = 4;
  const total = (getOptionScore("stress_mental_intrusion", String(intrusion)) +
    getOptionScore("stress_preparedness", String(prepared)));
  return Math.round((total / (maxPer * 2)) * 100);
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
  return (Object.entries(subscores) as [keyof Subscores, number][])
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([key]) => key);
}

const RECOMMENDATIONS: Record<string, RecommendationItem> = {
  communication: {
    title: "Set Up a Dedicated Contact Channel",
    problem: "Tenants reach you on your personal number at all hours.",
    whyItMatters: "Every text to your personal phone blurs the boundary. A dedicated number or tenant portal creates the separation you need.",
    timeToImplement: "1–2 hours",
    difficulty: "Easy",
    impact: "High",
    diyPossible: true,
  },
  maintenance: {
    title: "Create a Maintenance Request Template",
    problem: "No structured way for tenants to report issues.",
    whyItMatters: "A simple form captures the right details upfront — preventing the back-and-forth to understand what's broken.",
    timeToImplement: "2–3 hours",
    difficulty: "Easy",
    impact: "High",
    diyPossible: true,
  },
  financial: {
    title: "Switch to Pre-Authorized Debit",
    problem: "Manual rent collection means you're depending on tenants to remember.",
    whyItMatters: "PAD removes the human element. Rent arrives on the 1st without a reminder, a text, or a moment of your attention.",
    timeToImplement: "1 week to set up",
    difficulty: "Easy",
    impact: "High",
    diyPossible: true,
  },
  operational: {
    title: "Centralize Your Documents in the Cloud",
    problem: "Scattered leases slow down every decision.",
    whyItMatters: "A 30-second cloud search beats a 30-minute hunt through email — every time.",
    timeToImplement: "Half a day",
    difficulty: "Easy",
    impact: "Medium",
    diyPossible: true,
  },
  time: {
    title: "Batch Your Landlord Tasks Weekly",
    problem: "Time is spent reactively throughout the week.",
    whyItMatters: "Batching communications and admin into one weekly block cuts context-switching and reclaims hours each month.",
    timeToImplement: "1–2 hours to set up",
    difficulty: "Easy",
    impact: "Medium",
    diyPossible: true,
  },
  stress: {
    title: "Build a Landlord-Tenant Law Reference Sheet",
    problem: "Uncertainty about your legal obligations creates constant background anxiety.",
    whyItMatters: "A one-page reference for common scenarios means you're never second-guessing your rights or obligations.",
    timeToImplement: "2–3 hours",
    difficulty: "Easy",
    impact: "High",
    diyPossible: true,
  },
};

function getQuickWins(subscores: Subscores): RecommendationItem[] {
  return getBottlenecks(subscores)
    .map((cat) => RECOMMENDATIONS[cat])
    .filter(Boolean);
}

function getLongTermImprovements(): RecommendationItem[] {
  return [
    {
      title: "Build a Contractor Database",
      problem: "Without vetted contractors, every repair is a gamble.",
      whyItMatters: "A trusted contractor list cuts response time from days to hours and protects tenants from fly-by-night operators.",
      timeToImplement: "2–4 weeks",
      difficulty: "Medium",
      impact: "High",
      diyPossible: true,
    },
    {
      title: "Implement a Tenant Portal",
      problem: "All communication runs through you personally.",
      whyItMatters: "A portal creates a paper trail, separates your personal life, and allows tenants to submit requests without interrupting your day.",
      timeToImplement: "1–2 weeks",
      difficulty: "Medium",
      impact: "High",
      diyPossible: true,
    },
  ];
}

export function computeScoreResult(answers: Answers): ScoreResult {
  const communication = categoryScore(answers, "communication");
  const maintenance = categoryScore(answers, "maintenance");
  const financial = categoryScore(answers, "financial");
  const operational = categoryScore(answers, "operational");
  const { score: time, monthlyHours, yearlyHours } = timeScore(answers);
  const stress = stressScore(answers);

  const subscores: Subscores = { communication, maintenance, financial, operational, time, stress };

  const overall = Math.round(
    communication * 0.22 +
    maintenance * 0.2 +
    financial * 0.2 +
    operational * 0.15 +
    time * 0.13 +
    stress * 0.1
  );

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

export const CATEGORY_LABELS: Record<string, string> = {
  communication: "Communication",
  maintenance: "Maintenance",
  financial: "Finances",
  operational: "Systems",
  time: "Time",
  stress: "Stress",
};
