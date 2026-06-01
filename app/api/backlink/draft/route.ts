import { NextRequest, NextResponse } from "next/server";

// Called by the Backlink Email Drafter agent to send drafts to Ebin for review
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.SEO_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, drafts } = await req.json();
  // drafts: array of { site, to, subject, body }
  // OR legacy: { message: string } (plain text blob from agent)

  if (!drafts && !req.body) {
    return NextResponse.json({ error: "drafts required" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  const runDate = date || new Date().toISOString().split("T")[0];

  // Build HTML — supports both structured array and plain text blob
  let emailHtml: string;

  if (Array.isArray(drafts) && drafts.length > 0) {
    const draftCards = drafts
      .map(
        (d: { site: string; to: string; subject: string; body: string }) => `
        <div style="background:white;border:1px solid #E8E4DF;border-radius:6px;padding:24px;margin-bottom:24px;">
          <p style="font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;">To</p>
          <p style="font-size:13px;color:#1F2F3A;margin:0 0 16px;">${d.to}</p>

          <p style="font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 4px;">Subject</p>
          <p style="font-size:14px;font-weight:600;color:#1F2F3A;margin:0 0 16px;">${d.subject}</p>

          <p style="font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">Message</p>
          <div style="background:#F9F7F4;border-left:3px solid #8B2030;padding:16px;font-size:13px;color:#2C2C2C;line-height:1.8;white-space:pre-wrap;">${d.body.replace(/</g, "&lt;")}</div>
        </div>
      `
      )
      .join("");

    emailHtml = `
      <div style="font-family:sans-serif;max-width:620px;margin:0 auto;">
        <div style="background:#1F2F3A;padding:24px 32px;">
          <p style="color:#8B2030;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Prospera Backlink Agent</p>
          <h1 style="color:#FAF8F5;font-size:20px;font-weight:300;margin:0;">${drafts.length} outreach email${drafts.length !== 1 ? "s" : ""} ready for review</h1>
          <p style="color:#9AABB5;font-size:12px;margin:8px 0 0;">${runDate} · Review each draft below, copy what you want to send, and fire them off</p>
        </div>
        <div style="padding:32px;background:#FAF8F5;">
          ${draftCards}
          <p style="font-size:11px;color:#B0B0B0;margin:24px 0 0;">Prospera Properties · London, St. Thomas &amp; Strathroy, Ontario</p>
        </div>
      </div>
    `;
  } else {
    // Legacy plain text blob fallback
    const { message } = await req.json().catch(() => ({ message: drafts }));
    const rawText = typeof drafts === "string" ? drafts : message || "";
    emailHtml = `
      <div style="font-family:sans-serif;max-width:620px;margin:0 auto;">
        <div style="background:#1F2F3A;padding:24px 32px;">
          <p style="color:#8B2030;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Prospera Backlink Agent</p>
          <h1 style="color:#FAF8F5;font-size:20px;font-weight:300;margin:0;">Outreach email drafts — ${runDate}</h1>
        </div>
        <div style="padding:32px;background:#FAF8F5;">
          <div style="background:white;border:1px solid #E8E4DF;padding:24px;border-radius:6px;white-space:pre-wrap;font-size:13px;color:#2C2C2C;line-height:1.8;">${rawText.replace(/</g, "&lt;")}</div>
          <p style="font-size:11px;color:#B0B0B0;margin:24px 0 0;">Prospera Properties · London, St. Thomas &amp; Strathroy, Ontario</p>
        </div>
      </div>
    `;
  }

  await resend.emails.send({
    from: "Prospera Backlink Agent <hello@prosperaproperties.co>",
    to: "prosperapropertiess@gmail.com",
    subject: `[Backlink] ${Array.isArray(drafts) ? drafts.length + " outreach drafts" : "Outreach drafts"} ready — ${runDate}`,
    html: emailHtml,
  });

  return NextResponse.json({ success: true });
}
