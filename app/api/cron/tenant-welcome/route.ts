import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchAllTenants, fetchAllProperties } from "@/lib/notion";

// Runs daily at 10am Eastern (14:00 UTC)
// Scans all Active tenants in Notion → creates portal token for any without one → sends welcome email

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prosperaproperties.co";
const FROM = "Ebin at Prospera <ebin@prosperaproperties.co>";
const EBIN_EMAIL = "prosperapropertiess@gmail.com";

const INACTIVE = new Set(["former", "evicted", "ended", "past", "inactive", "terminated", "moved out"]);

function generateToken(name: string): string {
  const initials = name
    .split(" ")
    .map((w) => w[0]?.toLowerCase() ?? "")
    .join("")
    .slice(0, 3);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${initials}-${rand}`;
}

function welcomeEmailHtml(params: {
  firstName: string;
  portalUrl: string;
  propertyAddress: string;
}): string {
  const { firstName, portalUrl, propertyAddress } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Tenant Portal is Ready</title>
</head>
<body style="margin:0;padding:0;background:#090E17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#090E17;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:300;color:#EDE8E1;letter-spacing:-0.02em;">
                Prospera Properties
              </p>
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D1825,#111F2E);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px 36px 36px;">

              <p style="margin:0 0 6px;font-size:13px;color:rgba(237,232,225,0.42);text-transform:uppercase;letter-spacing:0.08em;">
                Welcome to your portal
              </p>
              <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:40px;font-weight:300;color:#EDE8E1;letter-spacing:-0.02em;line-height:1.1;">
                Hi ${firstName}.
              </h1>
              <p style="margin:0 0 32px;font-size:14px;color:rgba(237,232,225,0.42);">
                ${propertyAddress}
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:rgba(237,232,225,0.75);line-height:1.7;">
                Your tenant portal is ready. This is your single source of truth for everything about your tenancy — payments, documents, maintenance, and more.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#8B2030,#C9A84C);border-radius:12px;padding:1px;">
                    <a href="${portalUrl}" style="display:block;background:#0D1825;border-radius:11px;padding:14px 28px;font-size:15px;font-weight:600;color:#EDE8E1;text-decoration:none;letter-spacing:-0.01em;">
                      Open My Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Feature list -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  ["💳", "Payments", "See your full payment history at a glance"],
                  ["📄", "Documents", "Download your lease, inspection reports & notices"],
                  ["🏠", "Home Guide", "Everything about your home — breakers, shutoffs & appliances"],
                  ["🔧", "Maintenance", "Submit requests with AI-guided troubleshooting"],
                  ["📅", "Schedule", "Upcoming inspections, reminders & garbage pickup"],
                  ["💬", "Messages", "One direct line to your property manager"],
                ].map(([icon, label, desc]) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:32px;font-size:18px;vertical-align:top;padding-top:2px;">${icon}</td>
                      <td>
                        <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#EDE8E1;">${label}</p>
                        <p style="margin:0;font-size:13px;color:rgba(237,232,225,0.42);">${desc}</p>
                      </td>
                    </tr></table>
                  </td>
                </tr>`).join("")}
              </table>
            </td>
          </tr>

          <!-- Add to homescreen card -->
          <tr>
            <td style="padding-top:16px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1825;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:28px 32px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;color:rgba(237,232,225,0.35);text-transform:uppercase;letter-spacing:0.08em;">
                      Pro tip
                    </p>
                    <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#EDE8E1;">
                      Add to your home screen
                    </p>
                    <p style="margin:0 0 20px;font-size:14px;color:rgba(237,232,225,0.55);line-height:1.6;">
                      Save your portal like an app — no App Store needed. It opens full-screen with one tap.
                    </p>

                    <!-- iPhone instructions -->
                    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#EDE8E1;">📱 iPhone (Safari)</p>
                    <ol style="margin:0 0 20px;padding-left:20px;font-size:13px;color:rgba(237,232,225,0.55);line-height:1.9;">
                      <li>Open the portal link in <strong style="color:#EDE8E1;">Safari</strong> (not Chrome)</li>
                      <li>Tap the <strong style="color:#EDE8E1;">Share</strong> button (the box with an arrow at the bottom)</li>
                      <li>Scroll down and tap <strong style="color:#EDE8E1;">"Add to Home Screen"</strong></li>
                      <li>Tap <strong style="color:#EDE8E1;">Add</strong> — done!</li>
                    </ol>

                    <!-- Android instructions -->
                    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#EDE8E1;">🤖 Android (Chrome)</p>
                    <ol style="margin:0 0 0;padding-left:20px;font-size:13px;color:rgba(237,232,225,0.55);line-height:1.9;">
                      <li>Open the portal link in <strong style="color:#EDE8E1;">Chrome</strong></li>
                      <li>Tap the <strong style="color:#EDE8E1;">⋮ menu</strong> (three dots, top right)</li>
                      <li>Tap <strong style="color:#EDE8E1;">"Add to Home screen"</strong></li>
                      <li>Tap <strong style="color:#EDE8E1;">Add</strong> — done!</li>
                    </ol>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;padding-bottom:8px;">
              <p style="margin:0 0 6px;font-size:13px;color:rgba(237,232,225,0.28);text-align:center;">
                Questions? Reply to this email or call <a href="tel:5196971227" style="color:rgba(237,232,225,0.45);text-decoration:none;">(519) 697-1227</a>
              </p>
              <p style="margin:0;font-size:12px;color:rgba(237,232,225,0.18);text-align:center;">
                Prospera Properties · London, Ontario
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

export async function GET(req: NextRequest) {
  // Verify this is a legitimate Vercel cron call
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();

  // 1. Fetch all active tenants from Notion
  const [allTenants, allProperties] = await Promise.all([
    fetchAllTenants(),
    fetchAllProperties(),
  ]);

  const propertyMap = new Map(allProperties.map((p) => [p.id, p]));
  const activeTenants = allTenants.filter(
    (t) => !INACTIVE.has(t.status.toLowerCase().trim()) && t.email && t.propertyId
  );

  // 2. Fetch all existing tokens
  const { data: existingTokens } = await sb
    .from("tenant_access")
    .select("notion_tenant_id");

  const alreadyWelcomed = new Set((existingTokens ?? []).map((r) => r.notion_tenant_id));

  // 3. Find new tenants (no token yet)
  const newTenants = activeTenants.filter((t) => !alreadyWelcomed.has(t.id));

  if (newTenants.length === 0) {
    return NextResponse.json({ welcomed: 0, message: "No new tenants to welcome" });
  }

  const results: { name: string; email: string; status: string }[] = [];

  for (const tenant of newTenants) {
    try {
      const property = propertyMap.get(tenant.propertyId);
      const propertyAddress = property?.address ?? "your property";
      const firstName = tenant.name.trim().split(" ")[0];

      // Generate token and insert
      const token = generateToken(tenant.name);
      const { error: insertError } = await sb.from("tenant_access").insert({
        token,
        notion_tenant_id: tenant.id,
        tenant_name: tenant.name,
        property_id: tenant.propertyId,
      });

      if (insertError) {
        results.push({ name: tenant.name, email: tenant.email, status: `db_error: ${insertError.message}` });
        continue;
      }

      const portalUrl = `${SITE_URL}/tenants/${token}`;

      // Send welcome email to tenant
      const { error: emailError } = await getResend().emails.send({
        from: FROM,
        to: tenant.email,
        cc: [EBIN_EMAIL],
        subject: `Your tenant portal is ready, ${firstName} 🏠`,
        html: welcomeEmailHtml({ firstName, portalUrl, propertyAddress }),
      });

      if (emailError) {
        results.push({ name: tenant.name, email: tenant.email, status: `email_error: ${emailError.message}` });
        continue;
      }

      // Notify Ebin
      await getResend().emails.send({
        from: FROM,
        to: EBIN_EMAIL,
        subject: `Tenant portal created — ${tenant.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;padding:24px;color:#1F2F3A;">
            <h2 style="font-size:18px;margin-bottom:8px;">Portal created for ${tenant.name}</h2>
            <p style="color:#5A6A7A;font-size:14px;margin-bottom:16px;">${propertyAddress}</p>
            <p style="font-size:14px;">Welcome email sent to <strong>${tenant.email}</strong>.</p>
            <p style="margin-top:16px;">
              <a href="${portalUrl}" style="color:#8B2030;font-size:14px;">View their portal →</a>
            </p>
          </div>
        `,
      });

      results.push({ name: tenant.name, email: tenant.email, status: "welcomed" });
    } catch (err) {
      results.push({
        name: tenant.name,
        email: tenant.email,
        status: `error: ${err instanceof Error ? err.message : "unknown"}`,
      });
    }
  }

  const welcomed = results.filter((r) => r.status === "welcomed").length;
  console.log(`[tenant-welcome] Processed ${newTenants.length} new tenants, ${welcomed} welcomed.`);

  return NextResponse.json({ welcomed, results });
}
