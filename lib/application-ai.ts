import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

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

const DOC_LABEL: Record<string, string> = {
  paystub: "Pay stub",
  bank_statement: "Bank statement",
  employment_letter: "Employment letter",
  id: "Government ID",
};

function getMediaType(storagePath: string): "application/pdf" | "image/jpeg" | "image/png" | "image/webp" {
  const ext = storagePath.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

// Download a document from Supabase Storage and return as base64
async function downloadDoc(storagePath: string): Promise<{ base64: string; mediaType: ReturnType<typeof getMediaType> } | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from("applications")
      .download(storagePath);

    if (error || !data) return null;

    const buffer = await data.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { base64, mediaType: getMediaType(storagePath) };
  } catch {
    return null;
  }
}

// Phase 1: Extract structured data from documents using Claude Vision
export async function processDocuments(
  docs: { doc_type: string; storage_path: string }[],
  monthlyRent: number
): Promise<OcrData> {
  if (docs.length === 0) {
    return { status: "failed", flags: ["No documents provided"], missing_documents: [], raw_notes: "No documents were uploaded." };
  }

  // Build content blocks — download each document
  type ContentBlock =
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
    | { type: "document"; source: { type: "base64"; media_type: string; data: string } };

  const contentBlocks: ContentBlock[] = [];
  const failed: string[] = [];

  for (const doc of docs) {
    const result = await downloadDoc(doc.storage_path);
    if (!result) {
      failed.push(DOC_LABEL[doc.doc_type] ?? doc.doc_type);
      continue;
    }

    contentBlocks.push({
      type: "text",
      text: `--- ${DOC_LABEL[doc.doc_type] ?? doc.doc_type} ---`,
    });

    if (result.mediaType === "application/pdf") {
      contentBlocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: result.base64 },
      });
    } else {
      contentBlocks.push({
        type: "image",
        source: { type: "base64", media_type: result.mediaType, data: result.base64 },
      });
    }
  }

  if (contentBlocks.length === 0) {
    return { status: "failed", flags: ["All documents failed to download"], missing_documents: failed, raw_notes: "Could not retrieve any uploaded documents." };
  }

  contentBlocks.push({
    type: "text",
    text: `Monthly rent for this property: $${monthlyRent}/mo

Extract structured data from the documents above and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

Return this exact structure:
{
  "status": "complete" | "partial" | "failed",
  "income": {
    "gross_monthly_avg": number or null,
    "bank_deposit_avg": number or null,
    "income_to_rent_ratio": number or null,
    "paystub_employer": "string" or null,
    "employment_letter_employer": "string" or null,
    "employers_match": true | false | null,
    "employment_type": "full_time" | "part_time" | "self_employed" | "contract" | "other" | null,
    "employment_start_date": "YYYY-MM-DD" or null
  },
  "banking": {
    "avg_balance": number or null,
    "nsf_count": number,
    "large_withdrawals_flagged": number,
    "rent_payments_visible": true | false | null
  },
  "identity": {
    "full_name": "string" or null,
    "dob": "YYYY-MM-DD" or null,
    "id_type": "string" or null
  },
  "flags": ["any red flags as plain English strings"],
  "missing_documents": ["document types that were unreadable or missing"],
  "raw_notes": "one paragraph summary of what you found"
}

Rules:
- income_to_rent_ratio = gross_monthly_avg / monthly_rent (round to 2 decimal places)
- nsf_count = total NSF/overdraft incidents across all statements
- large_withdrawals_flagged = withdrawals over 30% of monthly income with no clear payee
- Be conservative — use null if a field cannot be reliably extracted
- Do not guess or fabricate numbers`,
  });

  try {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: contentBlocks as Anthropic.MessageParam["content"] }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    if (!text) throw new Error("Empty response from Claude");

    // Strip markdown fences if present
    const cleaned = text.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned) as OcrData;

    // Merge in any failed downloads
    if (failed.length) {
      parsed.missing_documents = [...(parsed.missing_documents ?? []), ...failed];
    }

    return parsed;
  } catch (err) {
    console.error("[processDocuments] Claude extraction failed:", err);
    return {
      status: "partial",
      flags: ["Document extraction failed — manual review required"],
      missing_documents: failed,
      raw_notes: "Automated extraction encountered an error. Please review documents manually.",
    };
  }
}

// Phase 2: Generate a human-readable screening report + score
export async function generateApplicationReport(
  ocrData: OcrData,
  application: ApplicationData
): Promise<{ score: number; report: string }> {
  const incomeToRent = ocrData.income?.income_to_rent_ratio?.toFixed(2) ?? "unknown";
  const flags = ocrData.flags?.length ? ocrData.flags.join(", ") : "none";
  const missing = ocrData.missing_documents?.length
    ? ocrData.missing_documents.join(", ")
    : "none";

  const prompt = `You are a property manager screening a rental application. Give a clear, honest assessment in plain language.

PROPERTY: Monthly rent $${application.monthly_rent}/mo
APPLICANT: ${application.tenant_name}

DOCUMENT ANALYSIS RESULTS:
- OCR status: ${ocrData.status}
- Gross monthly income (from pay stubs): $${ocrData.income?.gross_monthly_avg ?? "N/A"}
- Average bank deposits (6 months): $${ocrData.income?.bank_deposit_avg ?? "N/A"}
- Income-to-rent ratio: ${incomeToRent}x (minimum acceptable: 2.5x)
- Average bank balance: $${ocrData.banking?.avg_balance ?? "N/A"}
- NSF/overdraft incidents: ${ocrData.banking?.nsf_count ?? 0}
- Large unexplained withdrawals: ${ocrData.banking?.large_withdrawals_flagged ?? 0}
- Employer on pay stubs: ${ocrData.income?.paystub_employer ?? "N/A"}
- Employer on employment letter: ${ocrData.income?.employment_letter_employer ?? "N/A"}
- Employers match: ${ocrData.income?.employers_match ?? "unknown"}
- Employment type: ${ocrData.income?.employment_type ?? "unknown"}
- Employment start date: ${ocrData.income?.employment_start_date ?? "unknown"}
- Rent payments visible in statements: ${ocrData.banking?.rent_payments_visible ?? "unknown"}
- Red flags: ${flags}
- Missing documents: ${missing}
- Notes: ${ocrData.raw_notes ?? "none"}

SELF-REPORTED:
- Monthly income: $${application.monthly_income ?? "not provided"}
- Employer: ${application.employer_name ?? "not provided"}
- Position: ${application.employer_position ?? "not provided"}
- Employment type: ${application.employment_type ?? "not provided"}

Write a rental screening report. Use plain language. Be direct. No jargon.

FORMAT:
## Overall Score: [X/10]
One sentence verdict.

## Income & Affordability
Does the income support the rent? Is the ratio acceptable? Any gaps between stated and verified income?

## Banking Health
What do the bank statements show? NSF incidents? Is the balance healthy?

## Document Integrity
Do the documents check out? Any mismatches? Missing anything critical?

## Red Flags
List specific concerns. If none, say so.

## Recommendation
One clear action: Approve / Decline / Request more info. If decline or more info, say exactly why.

Score rubric: 9-10 = strong approve, 7-8 = approve, 5-6 = borderline, 3-4 = decline, 1-2 = clear decline.`;

  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
  if (!text) throw new Error("Claude returned empty report");

  const scoreMatch = text.match(/Overall Score:\s*(\d+)/i);
  const score = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]))) : 5;

  return { score, report: text };
}

// Combined: process docs then generate report in one call chain
export async function processAndScoreApplication(
  applicationId: string,
  docs: { doc_type: string; storage_path: string }[],
  application: ApplicationData
): Promise<void> {
  const { supabaseAdmin: db } = await import("@/lib/supabase");

  try {
    // Phase 1: Extract data from documents
    const ocrData = await processDocuments(docs, application.monthly_rent);

    // Save OCR data immediately
    await db
      .from("applications")
      .update({ ocr_data: ocrData })
      .eq("id", applicationId);

    // Phase 2: Generate screening report
    const { score, report } = await generateApplicationReport(ocrData, application);

    // Save report + update status
    await db
      .from("applications")
      .update({
        ai_score: score,
        ai_report: report,
        status: "reviewed",
      })
      .eq("id", applicationId)
      .eq("status", "processing"); // guard: only if still processing

  } catch (err) {
    console.error(`[processAndScoreApplication] Failed for ${applicationId}:`, err);
    // Still mark as reviewed so Ebin can see it (without score)
    await db
      .from("applications")
      .update({ status: "reviewed" })
      .eq("id", applicationId)
      .eq("status", "processing");
  }
}
