import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";

const ADMIN_SECRET = process.env.ADMIN_API_SECRET;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prosperaproperties.co";
const FROM = "Ebin at Prospera <ebin@prosperaproperties.co>";
const EBIN_EMAIL = "prosperapropertiess@gmail.com";

function makeToken(tenantName: string): string {
  const initials = tenantName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return `${initials}-${crypto.randomUUID()}`;
}

function welcomeEmailHtml(params: {
  firstName: string;
  portalUrl: string;
  propertyAddress: string;
}): string {
  const { firstName, portalUrl, propertyAddress } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#090E17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#090E17;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

  <!-- Header -->
  <tr><td style="padding-bottom:32px;">
    <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:300;color:#EDE8E1;letter-spacing:-0.02em;">Prospera Properties</p>
  </td></tr>

  <!-- Hero card -->
  <tr><td style="background:linear-gradient(135deg,#0D1825,#111F2E);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px 36px 36px;">
    <p style="margin:0 0 6px;font-size:13px;color:rgba(237,232,225,0.42);text-transform:uppercase;letter-spacing:0.08em;">Welcome to your portal</p>
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:40px;font-weight:300;color:#EDE8E1;letter-spacing:-0.02em;line-height:1.1;">Hi ${firstName}.</h1>
    <p style="margin:0 0 32px;font-size:14px;color:rgba(237,232,225,0.42);">${propertyAddress}</p>

    <p style="margin:0 0 24px;font-size:15px;color:rgba(237,232,225,0.75);line-height:1.7;">
      Your tenant portal is ready. This is your single source of truth for everything about your tenancy — payments, documents, maintenance, and more.
    </p>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td style="background:linear-gradient(135deg,#8B2030,#C9A84C);border-radius:12px;padding:1px;">
        <a href="${portalUrl}" style="display:block;background:#0D1825;border-radius:11px;padding:14px 28px;font-size:15px;font-weight:600;color:#EDE8E1;text-decoration:none;letter-spacing:-0.01em;">
          Open My Portal →
        </a>
      </td></tr>
    </table>

    <!-- Features -->
    <table width="100%" cellpadding="0" cellspacing="0">
      ${[
        ["💳","Payments","See your full payment history at a glance"],
        ["📄","Documents","Download your lease, inspection reports & notices"],
        ["🏠","Home Guide","Breakers, shutoffs, appliances — all in one place"],
        ["🔧","Maintenance","Submit requests with AI-guided troubleshooting"],
        ["📅","Schedule","Upcoming inspections, reminders & garbage pickup"],
        ["💬","Messages","One direct line to your property manager"],
      ].map(([icon,label,desc]) => `
      <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="width:32px;font-size:18px;vertical-align:top;padding-top:2px;">${icon}</td>
          <td>
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#EDE8E1;">${label}</p>
            <p style="margin:0;font-size:13px;color:rgba(237,232,225,0.42);">${desc}</p>
          </td>
        </tr></table>
      </td></tr>`).join("")}
    </table>
  </td></tr>

  <!-- Add to homescreen -->
  <tr><td style="padding-top:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1825;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px 32px;">
      <tr><td>
        <p style="margin:0 0 4px;font-size:11px;color:rgba(237,232,225,0.35);text-transform:uppercase;letter-spacing:0.08em;">Pro tip</p>
        <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#EDE8E1;">Add to your home screen</p>
        <p style="margin:0 0 20px;font-size:14px;color:rgba(237,232,225,0.55);line-height:1.6;">
          Save your portal like an app — no App Store needed. Opens full-screen with one tap.
        </p>

        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#EDE8E1;">📱 iPhone (Safari)</p>
        <ol style="margin:0 0 20px;padding-left:20px;font-size:13px;color:rgba(237,232,225,0.55);line-height:1.9;">
          <li>Open the portal link in <strong style="color:#EDE8E1;">Safari</strong></li>
          <li>Tap the <strong style="color:#EDE8E1;">Share</strong> button (box with arrow, bottom of screen)</li>
          <li>Tap <strong style="color:#EDE8E1;">"Add to Home Screen"</strong></li>
          <li>Tap <strong style="color:#EDE8E1;">Add</strong></li>
        </ol>

        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#EDE8E1;">🤖 Android (Chrome)</p>
        <ol style="margin:0;padding-left:20px;font-size:13px;color:rgba(237,232,225,0.55);line-height:1.9;">
          <li>Open the portal link in <strong style="color:#EDE8E1;">Chrome</strong></li>
          <li>Tap <strong style="color:#EDE8E1;">⋮</strong> (three dots, top right)</li>
          <li>Tap <strong style="color:#EDE8E1;">"Add to Home screen"</strong></li>
          <li>Tap <strong style="color:#EDE8E1;">Add</strong></li>
        </ol>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding-top:32px;">
    <p style="margin:0 0 6px;font-size:13px;color:rgba(237,232,225,0.28);text-align:center;">
      Questions? Reply to this email or call <a href="tel:5196971227" style="color:rgba(237,232,225,0.45);text-decoration:none;">(519) 697-1227</a>
    </p>
    <p style="margin:0;font-size:12px;color:rgba(237,232,225,0.18);text-align:center;">Prospera Properties · London, Ontario</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("tenant_access")
    .select("id, token, tenant_name, property_id, created_at, welcome_sent_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tokens: data ?? [] });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!ADMIN_SECRET || auth !== `Bearer ${ADMIN_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    notionTenantId?: string;
    tenantName?: string;
    propertyId?: string;
    tenantEmail?: string;
    propertyAddress?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { notionTenantId, tenantName, propertyId, tenantEmail, propertyAddress } = body;
  if (!notionTenantId || !tenantName || !propertyId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const token = makeToken(tenantName);
  const sb = getSupabaseAdmin();
  const portalUrl = `${SITE_URL}/tenants/${token}`;
  const firstName = tenantName.trim().split(" ")[0];

  const { error: dbError } = await sb.from("tenant_access").insert({
    token,
    notion_tenant_id: notionTenantId,
    tenant_name: tenantName,
    property_id: propertyId,
  });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  // Send welcome email if address provided
  let emailSent = false;
  if (tenantEmail) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const addr = propertyAddress ?? "your property";

    const [tenantEmailResult] = await Promise.allSettled([
      resend.emails.send({
        from: FROM,
        to: tenantEmail,
        cc: [EBIN_EMAIL],
        subject: `Your tenant portal is ready, ${firstName} 🏠`,
        html: welcomeEmailHtml({ firstName, portalUrl, propertyAddress: addr }),
      }),
      resend.emails.send({
        from: FROM,
        to: EBIN_EMAIL,
        subject: `Tenant portal created — ${tenantName}`,
        html: `<div style="font-family:sans-serif;max-width:480px;padding:24px;color:#1F2F3A;">
          <h2 style="font-size:18px;margin-bottom:8px;">Portal created for ${tenantName}</h2>
          <p style="color:#5A6A7A;font-size:14px;margin-bottom:16px;">${addr}</p>
          <p style="font-size:14px;">Welcome email sent to <strong>${tenantEmail}</strong>.</p>
          <p style="margin-top:16px;"><a href="${portalUrl}" style="color:#8B2030;font-size:14px;">View their portal →</a></p>
        </div>`,
      }),
    ]);

    emailSent = tenantEmailResult.status === "fulfilled" && !tenantEmailResult.value.error;
  }

  return NextResponse.json({ token, portalUrl, emailSent });
}
