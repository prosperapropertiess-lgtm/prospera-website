import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";
import { validateTenantToken, getTenantMaintenanceRequests, getTenantInfo } from "@/lib/tenant-data";
import { fetchAllOwners } from "@/lib/notion";
import {
  maintenanceAckTenantEmail,
  maintenanceAckAdminEmail,
  maintenanceAnalysisEmail,
} from "@/lib/emails";

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }

const EBIN_EMAIL = "prosperapropertiess@gmail.com";
const FROM = "Ebin at Prospera <ebin@prosperaproperties.co>";

const DIAGNOSE_SYSTEM = `You are a helpful home maintenance assistant for a property managed by Prospera Properties in Ontario, Canada.
A tenant has reported an issue. Give them 4-5 clear, simple troubleshooting steps they can try themselves before a technician is dispatched.
Keep steps numbered, plain English, non-technical. End with: "If none of these steps resolved the issue, you can proceed to request a dispatch below."
Be brief — max 200 words total.`;

const ANALYSIS_SYSTEM = `You are a property maintenance expert for Prospera Properties in Ontario, Canada.
A tenant has submitted a maintenance request. Analyze the issue and provide a helpful, detailed response.

Your response should be structured with these sections using markdown headings (##):

## What's likely going on
Explain 2-3 most probable causes of this issue in plain English. Be specific but not overly technical.

## What you can try right now
Give 3-5 actionable steps the tenant can try immediately to fix or mitigate the issue. Number them. Include safety warnings if relevant.

## What happens if this doesn't fix it
Explain what the next steps look like — e.g. a technician visit, parts replacement, timeline expectations. Be honest about costs/timelines where relevant.

## Good to know
One brief tip about preventing this issue in the future, or something useful the tenant should be aware of.

Keep the tone warm, professional, and reassuring. The tenant should feel like someone competent is handling this. Max 400 words total.`;

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
    return handleDiagnose(body as unknown as DiagnoseBody);
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

async function handleDiagnose(body: DiagnoseBody) {
  const { category, description } = body;
  if (!category || !description) {
    return NextResponse.json({ error: "Missing category or description" }, { status: 400 });
  }

  const message = await getAnthropic().messages.create({
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
  const propertyAddress = info?.propertyAddress ?? "Property";

  // Insert into Supabase
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

  // Find owner email for CC
  let ownerEmail: string | undefined;
  let ownerName: string | undefined;
  try {
    const owners = await fetchAllOwners();
    const owner = owners.find(o => o.propertyIds.includes(access.property_id));
    if (owner?.email) {
      ownerEmail = owner.email;
      ownerName = owner.name;
    }
  } catch {
    // Non-blocking — skip owner CC if lookup fails
  }

  const resend = getResend();
  const ackParams = {
    tenantName: access.tenant_name,
    propertyAddress,
    category,
    description,
    photoUrls,
  };

  // EMAIL 1: Immediate acknowledgement — to tenant + admin + owner
  const ccList = [EBIN_EMAIL];
  if (ownerEmail) ccList.push(ownerEmail);

  await Promise.all([
    // To tenant
    info?.email
      ? resend.emails.send({
          from: FROM,
          to: info.email,
          cc: ccList,
          subject: `We got your maintenance request — ${category}`,
          html: maintenanceAckTenantEmail(ackParams),
        })
      : Promise.resolve(),
    // To admin (detailed version)
    resend.emails.send({
      from: FROM,
      to: EBIN_EMAIL,
      cc: ownerEmail ? [ownerEmail] : undefined,
      subject: `Maintenance Request — ${access.tenant_name} — ${category}`,
      html: maintenanceAckAdminEmail({ ...ackParams, tenantEmail: info?.email, ownerName }),
    }),
  ]);

  // EMAIL 2: AI analysis (non-blocking, runs after response)
  (async () => {
    try {
      const analysisMessage = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        system: ANALYSIS_SYSTEM,
        messages: [{
          role: "user",
          content: `Category: ${category}\nProperty: ${propertyAddress}\nTenant's description: ${description}\nTroubleshooting already attempted: ${troubleshootingSteps}`,
        }],
      });

      const analysis = analysisMessage.content[0].type === "text"
        ? analysisMessage.content[0].text
        : "";

      if (analysis && info?.email) {
        const analysisCc = [EBIN_EMAIL];
        if (ownerEmail) analysisCc.push(ownerEmail);

        await resend.emails.send({
          from: FROM,
          to: info.email,
          cc: analysisCc,
          subject: `Maintenance update — here's what we think is going on (${category})`,
          html: maintenanceAnalysisEmail({
            tenantName: access.tenant_name,
            propertyAddress,
            category,
            description,
            analysis,
          }),
        });
      }
    } catch (err) {
      console.error("[maintenance] AI analysis email failed:", err);
    }
  })();

  return NextResponse.json({ request: insertResult.data });
}
