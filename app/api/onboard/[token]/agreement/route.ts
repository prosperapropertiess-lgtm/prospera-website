import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Serves the signed agreement as a printable HTML page (accessible via onboarding token)
// This is used in email 3, before the owner dashboard token exists.

const AGREEMENT_SECTIONS = [
  { title: "What this is", body: "This is the agreement that lets us legally manage your property on your behalf." },
  { title: "What we do for you", body: "Once this is signed, we take over the day-to-day management of your property:\n\n• Collect rent each month and transfer the net amount directly to you\n• Handle all tenant communication — repairs, complaints, questions\n• Screen and place new tenants when a vacancy opens (credit check, employment verification, references)\n• Arrange repairs and coordinate with contractors\n• Conduct regular inspections and provide written reports\n• Keep everything compliant with Ontario's Residential Tenancies Act" },
  { title: "What you pay us", body: "Our fee is the rate we discussed when you came on board. It's deducted from rent before we transfer the rest to you — you never write us a cheque. If no rent is collected (vacancy period), no management fee is charged for that month." },
  { title: "Repairs and maintenance", body: "We can approve routine repairs up to your repair limit without calling you first. For anything larger, we contact you before spending a cent." },
  { title: "Your right to leave", body: "This agreement is month-to-month. If it's not working for you, give us 30 days written notice and we'll transfer your property file, keys, and all records back to you cleanly. No penalty, no lock-in." },
  { title: "What we need from you", body: "• Keep standard landlord insurance on the property\n• Tell us about anything we should know — existing issues, tenant disputes, or planned changes\n• If you'd like to visit the property, coordinate with us first — unannounced visits during an active tenancy can create legal complications under the Residential Tenancies Act" },
  { title: "Ontario law", body: "Everything we do is governed by Ontario's Residential Tenancies Act, 2006. We protect both your rights as a landlord and your tenants' rights as residents." },
];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = getSupabaseAdmin();

  const { data: session } = await sb
    .from("onboarding_sessions")
    .select("agreement_name, agreement_signed_at, agreement_ip, owner_name, property_address")
    .eq("token", token)
    .single();

  if (!session?.agreement_signed_at) {
    return NextResponse.json({ error: "No signed agreement on file" }, { status: 404 });
  }

  const signedDate = new Date(session.agreement_signed_at).toLocaleString("en-CA", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });

  const sectionsHtml = AGREEMENT_SECTIONS.map(s => `
    <div class="section">
      <h3>${s.title}</h3>
      <p>${s.body.replace(/\n/g, "<br>")}</p>
    </div>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Management Agreement — ${session.property_address ?? "Prospera Properties"}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; background: #F5F4F1; color: #0F1C28; padding: 40px 20px 80px; }
    .card { background: #fff; border-radius: 16px; max-width: 680px; margin: 0 auto; padding: 48px 44px; box-shadow: 0 2px 8px rgba(15,28,40,0.06), 0 12px 32px rgba(15,28,40,0.08); }
    .meta { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(15,28,40,0.42); margin-bottom: 6px; }
    h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 6px; }
    .subtitle { font-size: 15px; color: rgba(15,28,40,0.60); margin-bottom: 36px; }
    .divider { height: 1px; background: rgba(15,28,40,0.08); margin: 32px 0; }
    .section { margin-bottom: 28px; }
    h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 16px; line-height: 1.85; color: rgba(15,28,40,0.82); }
    .sig-box { background: #F5F4F1; border-radius: 12px; padding: 24px 28px; margin-top: 36px; }
    .sig-label { font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: rgba(15,28,40,0.42); margin-bottom: 10px; }
    .sig-name { font-size: 22px; font-weight: 700; color: #0F1C28; margin-bottom: 10px; }
    .sig-detail { font-size: 13px; color: rgba(15,28,40,0.55); line-height: 1.7; }
    .print-btn { display: block; width: fit-content; margin: 32px auto 0; background: #0F1C28; color: #fff; border: none; border-radius: 10px; padding: 12px 28px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; }
    @media (max-width: 600px) { .card { padding: 32px 24px; } h1 { font-size: 22px; } }
    @media print { .print-btn { display: none; } body { background: #fff; padding: 0; } .card { box-shadow: none; border-radius: 0; padding: 32px; } }
  </style>
</head>
<body>
  <div class="card">
    <p class="meta">Property Management Agreement</p>
    <h1>Management Agreement</h1>
    <p class="subtitle">Between ${session.owner_name ?? "Owner"} and Prospera Properties (operated by Ebin Jaison, London, Ontario)</p>

    <div class="divider"></div>
    ${sectionsHtml}
    <div class="divider"></div>

    <div class="sig-box">
      <p class="sig-label">Electronically Signed</p>
      <p class="sig-name">${session.agreement_name ?? session.owner_name}</p>
      <p class="sig-detail">
        Signed on: ${signedDate}<br>
        Property: ${session.property_address ?? "—"}<br>
        IP address: ${session.agreement_ip ?? "—"}
      </p>
    </div>

    <button class="print-btn" onclick="window.print()">Save as PDF / Print</button>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
