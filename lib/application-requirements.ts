// What documents an applicant uploads depends on how they earn income.
// Shared by the apply form (what to show) and the submit route (what to enforce),
// so the two can never disagree.

export type IncomeSource = "employed" | "self_employed" | "student" | "retired" | "other";

export type DocType =
  | "id"
  | "paystub"
  | "employment_letter"
  | "notice_of_assessment"
  | "income_proof"
  | "bank_statement";

export const INCOME_SOURCES: { value: IncomeSource; label: string; hint: string }[] = [
  { value: "employed", label: "I have a job", hint: "Full-time, part-time, or contract" },
  { value: "self_employed", label: "I'm self-employed", hint: "Business owner, freelancer, gig work" },
  { value: "student", label: "I'm a student", hint: "OSAP, family support, part-time work" },
  { value: "retired", label: "I'm retired", hint: "Pension, CPP, OAS, savings" },
  { value: "other", label: "Something else", hint: "ODSP, Ontario Works, EI, child support, other" },
];

export interface DocSlot {
  type: DocType;
  label: string;
  hint: string;
  min: number; // 0 = optional
  max: number;
}

const ID_SLOT: DocSlot = {
  type: "id",
  label: "Photo ID",
  hint: "Driver's licence, passport, or Ontario photo card. A clear phone photo is fine.",
  min: 1,
  max: 1,
};

const BANK_SLOT: DocSlot = {
  type: "bank_statement",
  label: "Bank statements (optional)",
  hint: "Up to 3 recent months. Not required, but it usually speeds up your approval.",
  min: 0,
  max: 3,
};

const INCOME_SLOTS: Record<IncomeSource, DocSlot[]> = {
  employed: [
    { type: "paystub", label: "Recent pay stubs", hint: "Your 2 most recent pay stubs.", min: 2, max: 4 },
    { type: "employment_letter", label: "Job letter (optional)", hint: "A letter from your employer confirming your role and pay.", min: 0, max: 1 },
  ],
  self_employed: [
    { type: "notice_of_assessment", label: "Notice of Assessment", hint: "Your most recent one from the CRA (in My Account).", min: 1, max: 2 },
  ],
  student: [
    { type: "income_proof", label: "Proof of how you'll pay rent", hint: "OSAP letter, a co-signer's pay stubs, or a letter from whoever is supporting you.", min: 1, max: 4 },
  ],
  retired: [
    { type: "income_proof", label: "Proof of income", hint: "Pension, CPP, or OAS statement. A recent bank statement showing deposits also works.", min: 1, max: 4 },
  ],
  other: [
    { type: "income_proof", label: "Proof of income", hint: "Any letter or statement that shows the amount you get each month.", min: 1, max: 4 },
  ],
};

export function docSlotsFor(source: IncomeSource | ""): DocSlot[] {
  if (!source) return [ID_SLOT];
  return [ID_SLOT, ...INCOME_SLOTS[source], BANK_SLOT];
}

export const DOC_LABELS: Record<DocType, string> = {
  id: "Photo ID",
  paystub: "Pay stub",
  employment_letter: "Job letter",
  notice_of_assessment: "Notice of Assessment",
  income_proof: "Proof of income",
  bank_statement: "Bank statement",
};

export const ALL_DOC_TYPES = Object.keys(DOC_LABELS) as DocType[];

// Returns the first unmet requirement as a plain-English message, or null.
export function missingDocs(source: IncomeSource | "", docs: { doc_type: string }[]): string | null {
  for (const slot of docSlotsFor(source)) {
    const have = docs.filter((d) => d.doc_type === slot.type).length;
    if (have < slot.min) {
      return slot.min === 1
        ? `Please upload your ${slot.label.toLowerCase()}.`
        : `Please upload at least ${slot.min} ${slot.label.toLowerCase()}.`;
    }
  }
  return null;
}
