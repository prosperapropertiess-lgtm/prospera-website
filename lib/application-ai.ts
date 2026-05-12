import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ApplicationData {
  tenant_name: string;
  tenant_email: string;
  monthly_rent: number;
  monthly_income: number | null;
  employer_name: string | null;
  employer_position: string | null;
  employment_type: string | null;
  employment_start: string | null;
  current_address: string | null;
}

export interface OcrData {
  status: "complete" | "failed" | "partial";
  income?: {
    gross_monthly_avg: number | null;
    bank_deposit_avg: number | null;
    income_to_rent_ratio: number | null;
    paystub_employer: string | null;
    employment_letter_employer: string | null;
    employers_match: boolean | null;
    employment_type: string | null;
    employment_start_date: string | null;
  };
  banking?: {
    avg_balance: number | null;
    nsf_count: number;
    large_withdrawals_flagged: number;
    rent_payments_visible: boolean | null;
  };
  identity?: {
    full_name: string | null;
    dob: string | null;
    id_type: string | null;
  };
  flags?: string[];
  missing_documents?: string[];
  raw_notes?: string;
}

export async function generateApplicationReport(
  ocrData: OcrData,
  application: ApplicationData
): Promise<{ score: number; report: string }> {
  const incomeToRent = ocrData.income?.income_to_rent_ratio?.toFixed(2) ?? "unknown";
  const flags = ocrData.flags?.length ? ocrData.flags.join(", ") : "none";
  const missing = ocrData.missing_documents?.length
    ? ocrData.missing_documents.join(", ")
    : "none";

  const prompt = `You are a property manager screening a rental application. Give a clear, honest assessment.

PROPERTY: Monthly rent $${application.monthly_rent}/mo
APPLICANT: ${application.tenant_name}

DOCUMENT ANALYSIS RESULTS:
- OCR status: ${ocrData.status}
- Gross monthly income (from pay stubs): $${ocrData.income?.gross_monthly_avg ?? "N/A"}
- Average bank deposits (6 months): $${ocrData.income?.bank_deposit_avg ?? "N/A"}
- Income-to-rent ratio: ${incomeToRent}x (minimum acceptable is 2.5x)
- Average bank balance: $${ocrData.banking?.avg_balance ?? "N/A"}
- NSF/overdraft incidents: ${ocrData.banking?.nsf_count ?? 0}
- Large unexplained withdrawals flagged: ${ocrData.banking?.large_withdrawals_flagged ?? 0}
- Employer on pay stubs: ${ocrData.income?.paystub_employer ?? "N/A"}
- Employer on employment letter: ${ocrData.income?.employment_letter_employer ?? "N/A"}
- Employers match: ${ocrData.income?.employers_match ?? "unknown"}
- Employment type: ${ocrData.income?.employment_type ?? "unknown"}
- Employment start date: ${ocrData.income?.employment_start_date ?? "unknown"}
- Rent payments visible in bank statements: ${ocrData.banking?.rent_payments_visible ?? "unknown"}
- Red flags detected: ${flags}
- Missing documents: ${missing}
- Additional notes: ${ocrData.raw_notes ?? "none"}

SELF-REPORTED (from application form):
- Monthly income: $${application.monthly_income ?? "not provided"}
- Employer: ${application.employer_name ?? "not provided"}
- Position: ${application.employer_position ?? "not provided"}
- Employment type: ${application.employment_type ?? "not provided"}

Write a rental screening report for the property manager. Use plain language. Be direct.

FORMAT:
## Overall Score: [X/10]
One sentence verdict — approve, decline, or needs more info.

## Income & Affordability
Does the income support the rent? Is the ratio acceptable? Any gaps between stated and verified income?

## Banking Health
What do the bank statements show? Any NSF incidents? Is the balance healthy?

## Document Integrity
Do the documents check out? Any mismatches between pay stubs and employment letter? Missing anything critical?

## Red Flags
List any specific concerns. If none, say so.

## Recommendation
One clear action: Approve / Decline / Request more info. If decline or more info, say exactly why.

Score rubric: 9-10 = strong approve, 7-8 = approve, 5-6 = borderline, 3-4 = decline with concern, 1-2 = clear decline.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
  if (!text) throw new Error("Claude returned empty report");

  // Extract score from "## Overall Score: X/10"
  const scoreMatch = text.match(/Overall Score:\s*(\d+)/i);
  const score = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]))) : 5;

  return { score, report: text };
}
