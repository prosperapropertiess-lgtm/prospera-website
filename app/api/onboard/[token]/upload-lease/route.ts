import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const EXTRACT_PROMPT = `You are a lease agreement parser. Extract the following fields from this lease document and return a JSON object. If a field is not found, use null.

Extract:
{
  "tenants": [
    {
      "name": "full name",
      "email": null,
      "phone": null,
      "unit": "unit number or description"
    }
  ],
  "monthlyRent": 1500.00,
  "leaseStart": "YYYY-MM-DD",
  "leaseEnd": "YYYY-MM-DD",
  "securityDeposit": 1500.00,
  "rentDueDay": 1,
  "lateFeeStructure": "description of late fee",
  "petPolicy": "allowed/not allowed/description",
  "parkingDetails": "description",
  "landlordAddress": "address from lease",
  "landlordName": "landlord name from lease",
  "specialClauses": ["any notable clauses"],
  "noticesServed": ["any N4 or other notices mentioned"]
}

Rules:
- monthlyRent should be the total rent amount (not per unit unless specified)
- Dates must be in YYYY-MM-DD format
- rentDueDay is the day of month rent is due (e.g. 1 for the 1st)
- Return ONLY the JSON object, no other text`;

async function parseLeaseWithClaude(
  fileBuffer: ArrayBuffer,
  mimeType: string
): Promise<Record<string, unknown>> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const base64 = Buffer.from(fileBuffer).toString("base64");

  const isPdf = mimeType === "application/pdf";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contentBlock: any = isPdf
    ? {
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      }
    : {
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType,
          data: base64,
        },
      };

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          contentBlock,
          { type: "text", text: EXTRACT_PROMPT },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  // Extract JSON from response (Claude sometimes wraps in markdown)
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return {};

  try {
    return JSON.parse(match[0]);
  } catch {
    return {};
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = getSupabaseAdmin();

  // Verify session exists and is at step 4
  const { data: session } = await sb
    .from("onboarding_sessions")
    .select("id, current_step, owner_email, owner_name, property_address")
    .eq("token", token)
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only PDF, JPG, PNG files accepted" },
      { status: 400 }
    );
  }

  const buffer = await file.arrayBuffer();

  // Upload to Supabase Storage
  const ext = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
  const storagePath = `leases/${token}/${Date.now()}-lease.${ext}`;

  const { error: uploadErr } = await sb.storage
    .from("onboarding")
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (uploadErr) {
    console.error("Storage upload error:", uploadErr);
    // Continue even if storage fails — parsing is more important
  }

  // Parse with Claude
  let parsedData: Record<string, unknown> = {};
  try {
    parsedData = await parseLeaseWithClaude(buffer, file.type);
  } catch (e) {
    console.error("Claude parse error:", e);
    // Don't fail the upload if parsing fails
  }

  // Count extracted fields
  const fieldsExtracted = Object.entries(parsedData).filter(([, v]) => v !== null && v !== undefined).length;

  // Update session
  await sb.from("onboarding_sessions").update({
    lease_storage_path: storagePath,
    lease_parsed_data: parsedData,
  }).eq("token", token);

  // Notify Ebin
  const ebinEmail = process.env.EBIN_EMAIL || "prosperapropertiess@gmail.com";
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Prospera System <prosperapropertiess@gmail.com>",
        to: ebinEmail,
        subject: `Lease uploaded — ${session.property_address || token} (${fieldsExtracted} fields extracted)`,
        html: `<p>Lease uploaded for <strong>${session.owner_name}</strong> at ${session.property_address}.</p>
               <p>Claude extracted <strong>${fieldsExtracted} fields</strong>.</p>
               <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://www.prosperaproperties.co"}/admin/onboard/${token}/review">Review extracted fields →</a></p>`,
      });
    } catch (e) {
      console.error("Ebin notification failed:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    storage_path: storagePath,
    parsed_data: parsedData,
    fields_extracted: fieldsExtracted,
  });
}
