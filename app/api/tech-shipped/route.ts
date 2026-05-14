import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Called when Ebin clicks "Mark as shipped" from the build email
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const token = searchParams.get("token");

  if (!id || !token) {
    return new NextResponse("Invalid request", { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: proposal } = await supabase
    .from("tech_proposals")
    .select("id, title, approval_token, status")
    .eq("id", id)
    .maybeSingle();

  if (!proposal) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Allow either the per-record token or the shared secret (for tech-check POST compat)
  const validToken =
    proposal.approval_token === token ||
    token === process.env.SEO_NOTIFY_SECRET;

  if (!validToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (proposal.status === "implemented") {
    return new NextResponse(
      successHtml(proposal.title, "Already marked as shipped.", true),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  await supabase
    .from("tech_proposals")
    .update({
      status: "implemented",
      implemented_at: new Date().toISOString(),
      approval_token: null,
    })
    .eq("id", id);

  // Notify Ebin with a completion email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Prospera CTO Agent <hello@prosperaproperties.co>",
        to: "prosperapropertiess@gmail.com",
        subject: `[CTO] Shipped ✓ — ${proposal.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <div style="background:#1F2F3A;padding:28px 32px;">
              <p style="color:#8B2030;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;font-weight:600;">Prospera CTO Agent</p>
              <h1 style="color:#FAF8F5;font-size:22px;font-weight:300;margin:0;">Feature shipped ✓</h1>
            </div>
            <div style="padding:32px;background:white;border:1px solid #E8E4DF;border-top:none;">
              <h2 style="font-size:18px;color:#1F2F3A;margin:0 0 12px;font-weight:500;">${proposal.title}</h2>
              <p style="font-size:14px;color:#5A5A5A;line-height:1.7;margin:0 0 24px;">
                This feature has been marked as shipped and logged in the product history. The CTO agent will propose the next feature next Monday.
              </p>
              <a href="https://www.prosperaproperties.co" style="display:inline-block;padding:12px 28px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">
                View Site →
              </a>
            </div>
          </div>
        `,
      });
    } catch {
      // Non-blocking
    }
  }

  return new NextResponse(
    successHtml(proposal.title, "Feature logged as shipped. The CTO agent will propose the next one next Monday.", false),
    { headers: { "Content-Type": "text/html" } }
  );
}

function successHtml(title: string, message: string, alreadyDone: boolean): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Shipped — Prospera</title>
  <style>
    body { font-family: sans-serif; background: #FAF8F5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: white; border: 1px solid #E8E4DF; padding: 52px 48px; max-width: 480px; text-align: center; }
    .icon { width: 48px; height: 48px; background: #1F2F3A; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 22px; }
    h1 { color: #1F2F3A; font-weight: 300; font-size: 28px; margin: 0 0 8px; }
    .feature { font-weight: 600; color: #1F2F3A; font-size: 16px; margin: 0 0 16px; }
    p { color: #5A5A5A; font-size: 14px; margin: 0 0 28px; line-height: 1.6; }
    a { display: inline-block; padding: 13px 28px; background: #1F2F3A; color: #FAF8F5; text-decoration: none; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>${alreadyDone ? "Already shipped." : "Shipped."}</h1>
    <p class="feature">${title}</p>
    <p>${message}</p>
    <a href="https://www.prosperaproperties.co">← Back to site</a>
  </div>
</body>
</html>`;
}
