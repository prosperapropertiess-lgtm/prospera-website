export type Option = { label: string; value: string; score: number };

export type SingleQuestion = {
  id: string;
  text: string;
  type: "single";
  category: "communication" | "maintenance" | "financial" | "operational" | "time" | "stress";
  options: Option[];
  milestone?: string; // shown AFTER answering this question
};

export type SliderQuestion = {
  id: string;
  text: string;
  type: "slider";
  category: "time";
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultValue: number;
};

export type AnyQuestion = SingleQuestion | SliderQuestion;

// 12 questions — the highest-signal one or two per category.
// Single-choice questions auto-advance on tap.
// Sliders require a "Next" press.
export const QUESTIONS: AnyQuestion[] = [
  // ── Communication (2) ──────────────────────────────────────────────────────
  {
    id: "contact_method",
    text: "How do tenants reach you?",
    type: "single",
    category: "communication",
    options: [
      { label: "My personal cell — calls and texts", value: "personal_cell", score: 0 },
      { label: "A dedicated business number", value: "work_phone", score: 3 },
      { label: "Email only", value: "email_only", score: 2 },
      { label: "A tenant portal or app", value: "portal", score: 4 },
    ],
    milestone: "Communication: done ✓",
  },
  {
    id: "weekly_interruptions",
    text: "How many tenant interruptions a week?",
    type: "single",
    category: "communication",
    options: [
      { label: "10 or more", value: "10+", score: 0 },
      { label: "5 to 9", value: "5-9", score: 1 },
      { label: "2 to 4", value: "2-4", score: 2 },
      { label: "1 or fewer", value: "0-1", score: 4 },
    ],
  },
  // ── Maintenance (2) ────────────────────────────────────────────────────────
  {
    id: "repair_tracking",
    text: "How do you track repairs and maintenance?",
    type: "single",
    category: "maintenance",
    options: [
      { label: "Memory or texts", value: "none", score: 0 },
      { label: "Notes or a basic list", value: "notes", score: 1 },
      { label: "Spreadsheet or shared doc", value: "spreadsheet", score: 3 },
      { label: "Property management software", value: "software", score: 4 },
    ],
    milestone: "Maintenance: done ✓",
  },
  {
    id: "contractor_network",
    text: "Do you have vetted contractors you can call?",
    type: "single",
    category: "maintenance",
    options: [
      { label: "No — I search each time", value: "none", score: 0 },
      { label: "A few numbers in my phone", value: "few", score: 1 },
      { label: "A short trusted list", value: "list", score: 2 },
      { label: "Full vetted list with backups", value: "full_list", score: 4 },
    ],
  },
  // ── Financial (2) ──────────────────────────────────────────────────────────
  {
    id: "rent_collection",
    text: "How do you collect rent?",
    type: "single",
    category: "financial",
    options: [
      { label: "Cheque or cash", value: "cheque", score: 0 },
      { label: "E-transfer (tenant initiates)", value: "etransfer", score: 1 },
      { label: "Mix of automated and manual", value: "mix", score: 2 },
      { label: "Fully automated pre-authorized debit", value: "automated", score: 4 },
    ],
    milestone: "Financial: done ✓",
  },
  {
    id: "late_rent_process",
    text: "What happens when rent is late?",
    type: "single",
    category: "financial",
    options: [
      { label: "I wait then follow up informally", value: "wait", score: 0 },
      { label: "I send a reminder text or email", value: "text_reminder", score: 1 },
      { label: "I have a process but it's manual", value: "manual_process", score: 2 },
      { label: "Formal steps with N4 notice protocol", value: "formal", score: 4 },
    ],
  },
  // ── Operational (2) ────────────────────────────────────────────────────────
  {
    id: "document_storage",
    text: "Where are your lease agreements stored?",
    type: "single",
    category: "operational",
    options: [
      { label: "Paper files or filing cabinet", value: "paper", score: 0 },
      { label: "Scattered digital files and email", value: "scattered", score: 1 },
      { label: "Organized folder on my computer", value: "organized", score: 3 },
      { label: "Cloud-based property management system", value: "cloud", score: 4 },
    ],
    milestone: "Systems: done ✓",
  },
  {
    id: "lease_renewals",
    text: "How do you manage lease renewals?",
    type: "single",
    category: "operational",
    options: [
      { label: "I remember — or the tenant reminds me", value: "memory", score: 0 },
      { label: "Calendar reminders I set manually", value: "calendar", score: 2 },
      { label: "Systematic process with templates", value: "systematic", score: 4 },
    ],
  },
  // ── Time (1 combined slider) ───────────────────────────────────────────────
  {
    id: "hours_total",
    text: "Total hours per month on your rental(s)",
    type: "slider",
    category: "time",
    min: 0,
    max: 60,
    step: 1,
    unit: "hrs/mo",
    defaultValue: 12,
  },
  // ── Stress (2 likert-as-single) ────────────────────────────────────────────
  {
    id: "stress_mental_intrusion",
    text: "How often do your rentals occupy your mind when you're not working?",
    type: "single",
    category: "stress",
    options: [
      { label: "Rarely — I barely think about it", value: "1", score: 4 },
      { label: "Occasionally", value: "2", score: 3 },
      { label: "Often — it's usually somewhere in my head", value: "3", score: 1 },
      { label: "Constantly — it's always with me", value: "4", score: 0 },
    ],
    milestone: "Stress: done ✓",
  },
  {
    id: "stress_preparedness",
    text: "If a tenant stopped paying rent tomorrow, how prepared are you?",
    type: "single",
    category: "stress",
    options: [
      { label: "Not prepared at all", value: "1", score: 0 },
      { label: "Somewhat — I'd figure it out", value: "2", score: 1 },
      { label: "Fairly prepared", value: "3", score: 3 },
      { label: "Fully prepared — I know the exact steps", value: "4", score: 4 },
    ],
  },
  // ── Bonus (one big picture) ────────────────────────────────────────────────
  {
    id: "after_hours",
    text: "How often do tenants contact you after hours?",
    type: "single",
    category: "communication",
    options: [
      { label: "Multiple times a week", value: "weekly", score: 0 },
      { label: "A few times a month", value: "monthly", score: 1 },
      { label: "Rarely — a few times a year", value: "rarely", score: 3 },
      { label: "Almost never — I have clear protocols", value: "never", score: 4 },
    ],
  },
];

export const TOTAL = QUESTIONS.length; // 12
