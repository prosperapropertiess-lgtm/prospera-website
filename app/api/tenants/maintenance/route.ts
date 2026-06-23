import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateTenantToken, getTenantMaintenanceRequests, getTenantInfo } from "@/lib/tenant-data";

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const EBIN_EMAIL = "prosperapropertiess@gmail.com";
const FROM = "Ebin at Prospera <ebin@prosperaproperties.co>";

const DIAGNOSE_SYSTEM = `You are a helpful home maintenance assistant for a property managed by Prospera Properties in Ontario, Canada.
A tenant has reported an issue. Give them 4-5 clear, simple troubleshooting steps they can try themselves before a technician is dispatched.
Keep steps numbered, plain English, non-technical. End with: "If none of these steps resolved the issue, you can proceed to request a dispatch below."
Be brief — max 200 words total.`;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const access = await validateTenantToken(token);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await getTenantMaintenanceRequests(token);
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, action } = body as { token?: string; action?: string };
  if (!token || !action) return NextResponse.json({ error: "Missing token or action" }, { status: 400 });

  const access = await validateTenantToken(token as string);
  if (!access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (action === "diagnose") {
    return handleDiagnose(body as unknown as DiagnoseBody, access.notion_tenant_id);
  }
  if (action === "submit") {
    return handleSubmit(body as unknown as SubmitBody, access, token as string);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

interface DiagnoseBody {
  token: string;
  category: string;
  description: string;
}

interface SubmitBody {
  token: string;
  category: string;
  description: string;
  troubleshootingSteps: string;
  aiDiagnosis: string;
  photoUrls?: string[];
}

async function handleDiagnose(body: DiagnoseBody, _tenantId: string) {
  const { category, description } = body;
  if (!category || !description) {
    return NextResponse.json({ error: "Missing category or description" }, { status: 400 });
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system: DIAGNOSE_SYSTEM,
    messages: [{ role: "user", content: `Category: ${category}\nIssue: ${description}` }],
  });

  const steps = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ diagnosis: steps });
}

async function handleSubmit(
  body: SubmitBody,
  access: { notion_tenant_id: string; tenant_name: string; property_id: string },
  token: string
) {
  const { category, description, troubleshootingSteps, aiDiagnosis, photoUrls } = body;
  if (!category || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  const info = await getTenantInfo(access.notion_tenant_id);

  const baseData = {
    tenant_id: access.notion_tenant_id,
    property_id: access.property_id,
    token,
    category,
    description,
    troubleshooting_steps: troubleshootingSteps ?? "[]",
    ai_diagnosis: aiDiagnosis ?? "",
    status: "submitted",
  };

  let insertResult = await sb
    .from("tenant_maintenance_requests")
    .insert({ ...baseData, photo_urls: photoUrls ?? [] })
    .select()
    .single();

  if (insertResult.error?.message?.includes("photo_urls")) {
    insertResult = await sb
      .from("tenant_maintenance_requests")
      .insert(baseData)
      .select()
      .single();
  }

  if (insertResult.error) return NextResponse.json({ error: insertResult.error.message }, { status: 500 });

  const photosHtml =
    photoUrls && photoUrls.length > 0
      ? `<hr/><p><strong>Photos attached (${photoUrls.length}):</strong></p>` +
        photoUrls.map((u) => `<p><a href="${u}">${u}</a></p>`).join("")
      : "";

  await getResend().emails.send({
    from: FROM,
    to: EBIN_EMAIL,
    subject: `Maintenance Request — ${access.tenant_name} — ${category}`,
    html: `<p><strong>Tenant:</strong> ${access.tenant_name}</p>
<p><strong>Property:</strong> ${info?.propertyAddress ?? access.property_id}</p>
<p><strong>Category:</strong> ${category}</p>
<p><strong>Issue:</strong> ${description}</p>
<hr/>
<p><strong>AI Troubleshooting Steps Provided:</strong></p>
<pre>${aiDiagnosis}</pre>
<p><strong>Steps Tenant Tried:</strong></p>
<pre>${troubleshootingSteps}</pre>${photosHtml}`,
  });

  return NextResponse.json({ request: insertResult.data });
}
