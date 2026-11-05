// Shared by the public /view form, its API, the admin page and the daily review.

// ── The branching question list ─────────────────────────────────────────────
// Each answer can reveal the next question. Hidden questions are never asked,
// and the server drops any answer to a question that wasn't shown.

export const FORM_VERSION = "v3";

export type Answers = Record<string, string>;

export interface Question {
  id: string;
  /** Which screen it sits on. Follow-ups appear under their trigger on the same screen. */
  section: "current" | "work" | "money" | "you" | "contact";
  title: string;
  sub?: string;
  type: "choice" | "multi" | "text";
  options?: readonly { value: string; label: string }[];
  placeholder?: string;
  optional?: boolean;
  showIf?: (a: Answers) => boolean;
}

const TENURE = [
  { value: "lt_6m", label: "Less than 6 months" },
  { value: "6_12m", label: "6 – 12 months" },
  { value: "1_2y", label: "1 – 2 years" },
  { value: "2_5y", label: "2 – 5 years" },
  { value: "5y_plus", label: "More than 5 years" },
] as const;

const employed = (a: Answers) => a.employment === "full_time" || a.employment === "part_time";

export const QUESTIONS: Question[] = [
  {
    id: "living", section: "current", type: "choice",
    title: "Where are you living now?",
    options: [
      { value: "renting", label: "Renting" },
      { value: "family", label: "With family or friends" },
      { value: "own", label: "In a home I own" },
      { value: "other", label: "Somewhere else" },
    ],
  },
  {
    id: "notice", section: "current", type: "choice", showIf: (a) => a.living === "renting",
    title: "Have you given notice to your landlord?",
    options: [
      { value: "given", label: "Yes, I've given notice" },
      { value: "not_yet", label: "Not yet" },
      { value: "lease_ending", label: "My lease is ending anyway" },
    ],
  },
  {
    id: "rental_length", section: "current", type: "choice", showIf: (a) => a.living === "renting",
    title: "How long have you rented your current place?",
    options: [
      { value: "lt_1y", label: "Less than a year" },
      { value: "1_2y", label: "1 – 2 years" },
      { value: "2_5y", label: "2 – 5 years" },
      { value: "5y_plus", label: "More than 5 years" },
    ],
  },
  {
    id: "landlord_reference", section: "current", type: "choice", showIf: (a) => a.living === "renting",
    title: "Can we ask your current landlord for a reference?",
    sub: "Only if you apply. We'll check with you first.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "discuss", label: "I'd like to talk about it first" },
    ],
  },
  {
    id: "moving_reason", section: "current", type: "choice",
    title: "What's the main reason you're moving?",
    options: [
      { value: "more_space", label: "Need more space" },
      { value: "closer", label: "Closer to work or school" },
      { value: "cost", label: "Lower rent" },
      { value: "landlord", label: "Landlord is selling or moving in" },
      { value: "first_place", label: "First place of my own" },
      { value: "other", label: "Something else" },
    ],
  },
  {
    id: "employment", section: "work", type: "choice",
    title: "What best describes your work?",
    sub: "For the main person on the lease.",
    options: [
      { value: "full_time", label: "Employed full-time" },
      { value: "part_time", label: "Employed part-time" },
      { value: "self_employed", label: "Self-employed" },
      { value: "student", label: "Student" },
      { value: "retired", label: "Retired" },
      { value: "other", label: "Something else" },
    ],
  },
  {
    id: "job_length", section: "work", type: "choice", showIf: employed,
    title: "How long have you been at this job?",
    options: TENURE,
  },
  {
    id: "job_type", section: "work", type: "choice", showIf: employed,
    title: "Is the job permanent?",
    options: [
      { value: "permanent", label: "Yes, permanent" },
      { value: "probation", label: "Permanent, still on probation" },
      { value: "contract", label: "Contract or seasonal" },
    ],
  },
  {
    id: "business_length", section: "work", type: "choice", showIf: (a) => a.employment === "self_employed",
    title: "How long have you been self-employed?",
    options: TENURE,
  },
  {
    id: "tax_docs", section: "work", type: "choice", showIf: (a) => a.employment === "self_employed",
    title: "Could you show your last two tax assessments (NOA)?",
    sub: "Only if you apply. Nothing to upload now.",
    options: [
      { value: "two_years", label: "Yes, two years" },
      { value: "one_year", label: "One year so far" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "student_rent", section: "work", type: "choice", showIf: (a) => a.employment === "student",
    title: "How will the rent be paid?",
    options: [
      { value: "job", label: "From my job" },
      { value: "family", label: "Family is helping" },
      { value: "savings", label: "Savings or student loans" },
      { value: "mix", label: "A mix of these" },
    ],
  },
  {
    id: "work_other", section: "work", type: "text", optional: true, showIf: (a) => a.employment === "other",
    title: "Tell us a little about your situation",
    sub: "A few words is fine. You can skip this.",
    placeholder: "e.g. starting a new job in December",
  },
  {
    id: "income", section: "money", type: "choice",
    title: "What's your household income per month?",
    sub: "Before tax, everyone moving in combined. A range is fine.",
    options: [
      { value: "under_3000", label: "Under $3,000" },
      { value: "3000_4000", label: "$3,000 – $4,000" },
      { value: "4000_5000", label: "$4,000 – $5,000" },
      { value: "5000_6000", label: "$5,000 – $6,000" },
      { value: "6000_plus", label: "$6,000 or more" },
    ],
  },
  {
    id: "credit", section: "money", type: "choice",
    title: "Roughly what's your credit score?",
    sub: "Your best guess is fine. Nothing is checked today.",
    options: [
      { value: "750_plus", label: "750 or higher" },
      { value: "700_749", label: "700 – 749" },
      { value: "650_699", label: "650 – 699" },
      { value: "600_649", label: "600 – 649" },
      { value: "below_600", label: "Below 600" },
      { value: "unknown", label: "I don't know" },
      { value: "no_history", label: "No credit history in Canada yet" },
    ],
  },
  {
    id: "cosigner", section: "money", type: "choice",
    showIf: (a) => a.employment === "student" || ["below_600", "600_649", "unknown", "no_history"].includes(a.credit),
    title: "Could someone co-sign the lease if needed?",
    sub: "A co-signer (guarantor) can help an application.",
    options: [
      { value: "yes", label: "Yes" },
      { value: "maybe", label: "Maybe" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "first_last", section: "money", type: "choice",
    title: "Will you have first and last month's rent ready for move-in?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "need_time", label: "I'll need a little time" },
      { value: "not_sure", label: "Not sure yet" },
    ],
  },
  {
    id: "pets", section: "you", type: "choice",
    title: "Any pets?",
    options: [
      { value: "none", label: "No pets" },
      { value: "yes", label: "Yes" },
    ],
  },
  {
    id: "pet_details", section: "you", type: "text", showIf: (a) => a.pets === "yes",
    title: "What kind, and how many?",
    placeholder: "e.g. 1 cat",
  },
  {
    id: "smoking", section: "you", type: "choice",
    title: "Does anyone moving in smoke or vape?",
    options: [
      { value: "no", label: "No" },
      { value: "outside", label: "Only outside" },
      { value: "yes", label: "Yes" },
    ],
  },
  {
    id: "vehicles", section: "you", type: "choice",
    title: "How many vehicles will you need to park?",
    options: [
      { value: "0", label: "None" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3_plus", label: "3 or more" },
    ],
  },
];

QUESTIONS.push({
  id: "viewing_times", section: "contact", type: "multi",
  title: "When are you free to see it?",
  sub: "Pick all that work. We'll suggest a time.",
  options: [
    { value: "weekday_day", label: "Weekdays, daytime" },
    { value: "weekday_eve", label: "Weekday evenings" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ],
});

export function visibleQuestions(a: Answers): Question[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(a));
}

/** Keeps only answers to questions that are shown; returns errors for missing/invalid ones. */
export function cleanAnswers(raw: unknown): { answers: Answers; errors: string[] } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const a: Answers = {};
  for (const q of QUESTIONS) {
    const v = input[q.id];
    if (typeof v === "string" && v.trim()) a[q.id] = v.trim().slice(0, 300);
  }
  const answers: Answers = {};
  const errors: string[] = [];
  for (const q of visibleQuestions(a)) {
    const v = a[q.id];
    if (!v) { if (!q.optional) errors.push(q.id); continue; }
    if (q.type === "choice" && !q.options!.some((o) => o.value === v)) { errors.push(q.id); continue; }
    if (q.type === "multi") {
      const picked = [...new Set(v.split(","))].filter((x) => q.options!.some((o) => o.value === x));
      if (!picked.length) { errors.push(q.id); continue; }
      answers[q.id] = picked.join(",");
      continue;
    }
    answers[q.id] = v;
  }
  return { answers, errors };
}

/** "Question → answer label" pairs in the order asked, for admin and the daily review. */
export function describeAnswers(a: Answers): { id: string; question: string; answer: string }[] {
  return visibleQuestions(a).filter((q) => a[q.id]).map((q) => ({
    id: q.id,
    question: q.title,
    answer: q.type === "text" ? a[q.id]
      : a[q.id].split(",").map((v) => q.options!.find((o) => o.value === v)?.label ?? v).join(", "),
  }));
}

export const CONSENT_TEXT =
  "I agree that Prospera Properties can use these answers to review my viewing request and contact me. If I apply for this home, I consent to a credit and background check.";

function optionLabel(id: string, v: string | null | undefined) {
  return QUESTIONS.find((q) => q.id === id)?.options?.find((o) => o.value === v)?.label ?? "Not given";
}
export const incomeLabel = (v: string | null | undefined) => optionLabel("income", v);
export const creditLabel = (v: string | null | undefined) => optionLabel("credit", v);

export interface PublicHome {
  id: string;
  title: string | null;
  address: string;
  city: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  available_date: string | null;
  utilities_included: boolean | null;
  utilities_list: string[] | null;
  parking: boolean | null;
  image: string | null;
}

export const PUBLIC_HOME_FIELDS =
  "id, title, address, city, price, bedrooms, bathrooms, available_date, utilities_included, utilities_list, parking, images";

export function toPublicHome(p: Record<string, unknown>): PublicHome {
  const images = (p.images as string[] | null) ?? [];
  return {
    id: p.id as string,
    title: (p.title as string) ?? null,
    address: p.address as string,
    city: p.city as string,
    price: Number(p.price),
    bedrooms: (p.bedrooms as number) ?? null,
    bathrooms: p.bathrooms == null ? null : Number(p.bathrooms),
    available_date: (p.available_date as string) ?? null,
    utilities_included: (p.utilities_included as boolean) ?? null,
    utilities_list: (p.utilities_list as string[]) ?? null,
    parking: (p.parking as boolean) ?? null,
    image: images[0] ?? null,
  };
}

/** Today's date in Toronto as YYYY-MM-DD. */
export function torontoToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
}

/** Readable link slug for a home, e.g. "1531-mclarenwood-terrace". */
export function homeSlug(address: string): string {
  return address.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const VIEW_URL = "https://www.prosperaproperties.co/view";
