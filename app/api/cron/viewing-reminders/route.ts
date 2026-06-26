import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// Runs every hour via Vercel cron. Checks for viewings needing reminders.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const now = new Date();
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ skipped: "no resend key" });

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);

  let sent = { reminder24h: 0, reminder1h: 0, followup: 0, nudge48h: 0 };

  // ── 24-hour reminders ──
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowMinus1h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const { data: upcoming24h } = await supabase
    .from("viewings")
    .select("*, properties:property_id(title, address, city)")
    .eq("status", "confirmed")
    .is("reminder_24h_sent_at", null)
    .gte("viewing_date", tomorrowMinus1h.toISOString())
    .lte("viewing_date", tomorrow.toISOString());

  for (const v of upcoming24h || []) {
    const date = new Date(v.viewing_date);
    const dateStr = date.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
    const timeStr = date.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
    const prop = v.properties as Record<string, string>;
    const address = `${prop?.address || ""}, ${prop?.city || ""}`;

    await resend.emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: v.tenant_email,
      subject: `Reminder: Viewing tomorrow at ${timeStr}`,
      html: reminderEmail(v.tenant_name.split(" ")[0], dateStr, timeStr, address, "24h"),
    }).catch(() => {});

    await supabase.from("viewings").update({ reminder_24h_sent_at: now.toISOString() }).eq("id", v.id);
    sent.reminder24h++;
  }

  // ── 1-hour reminders ──
  const plus2h = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const plus1h = new Date(now.getTime() + 1 * 60 * 60 * 1000);
  const { data: upcoming1h } = await supabase
    .from("viewings")
    .select("*, properties:property_id(title, address, city)")
    .eq("status", "confirmed")
    .is("reminder_1h_sent_at", null)
    .gte("viewing_date", plus1h.toISOString())
    .lte("viewing_date", plus2h.toISOString());

  for (const v of upcoming1h || []) {
    const date = new Date(v.viewing_date);
    const timeStr = date.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
    const prop = v.properties as Record<string, string>;
    const address = `${prop?.address || ""}, ${prop?.city || ""}`;

    await resend.emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: v.tenant_email,
      subject: `See you soon — viewing in 1 hour`,
      html: reminderEmail(v.tenant_name.split(" ")[0], "today", timeStr, address, "1h"),
    }).catch(() => {});

    await supabase.from("viewings").update({ reminder_1h_sent_at: now.toISOString() }).eq("id", v.id);
    sent.reminder1h++;
  }

  // ── Post-viewing follow-up (2 hours after viewing) ──
  const minus2h = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const minus4h = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const { data: recentViewings } = await supabase
    .from("viewings")
    .select("*, properties:property_id(id, title, address, city)")
    .eq("status", "confirmed")
    .is("followup_sent_at", null)
    .gte("viewing_date", minus4h.toISOString())
    .lte("viewing_date", minus2h.toISOString());

  for (const v of recentViewings || []) {
    const prop = v.properties as Record<string, string>;
    const listingUrl = `https://www.prosperaproperties.co/listings/${prop?.id || ""}`;

    await resend.emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: v.tenant_email,
      subject: `How was the viewing? — ${prop?.address || ""}`,
      html: followupEmail(v.tenant_name.split(" ")[0], `${prop?.address || ""}, ${prop?.city || ""}`, listingUrl),
    }).catch(() => {});

    await supabase.from("viewings").update({ followup_sent_at: now.toISOString() }).eq("id", v.id);
    sent.followup++;
  }

  // ── 48-hour nudge (no response after follow-up) ──
  const minus48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const minus52h = new Date(now.getTime() - 52 * 60 * 60 * 1000);
  const { data: staleViewings } = await supabase
    .from("viewings")
    .select("*, properties:property_id(id, title, address, city, inquiry_count)")
    .eq("status", "confirmed")
    .not("followup_sent_at", "is", null)
    .is("nudge_48h_sent_at", null)
    .is("tenant_interested", null)
    .gte("viewing_date", minus52h.toISOString())
    .lte("viewing_date", minus48h.toISOString());

  for (const v of staleViewings || []) {
    const prop = v.properties as Record<string, unknown>;
    const listingUrl = `https://www.prosperaproperties.co/listings/${prop?.id || ""}`;
    const inquiryCount = Number(prop?.inquiry_count || 0);

    await resend.emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>",
      to: v.tenant_email,
      subject: `Still interested? — ${prop?.address || ""}`,
      html: nudgeEmail(v.tenant_name.split(" ")[0], `${prop?.address || ""}, ${prop?.city || ""}`, listingUrl, inquiryCount),
    }).catch(() => {});

    await supabase.from("viewings").update({ nudge_48h_sent_at: now.toISOString() }).eq("id", v.id);
    sent.nudge48h++;
  }

  return NextResponse.json({ ok: true, sent });
}

function reminderEmail(firstName: string, date: string, time: string, address: string, type: "24h" | "1h"): string {
  const intro = type === "24h"
    ? `Just a quick reminder — your viewing is tomorrow.`
    : `See you in about an hour. Here's a quick refresher.`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <div style="background:#1F2F3A;border-radius:12px;padding:32px 28px;margin-bottom:32px;">
      <h1 style="color:#FAF8F5;font-size:24px;font-weight:300;margin:0;">${type === "24h" ? "Viewing Tomorrow" : "Almost Time"}</h1>
    </div>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Hi ${firstName},</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">${intro}</p>
    <div style="background:#f6f4f1;border-radius:12px;padding:24px;margin:0 0 28px;">
      <p style="margin:0 0 4px;font-size:14px;color:#5a6068;">When</p>
      <p style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1a1a1a;">${date} at ${time}</p>
      <p style="margin:0 0 4px;font-size:14px;color:#5a6068;">Where</p>
      <p style="margin:0;font-size:17px;font-weight:600;color:#1a1a1a;">${address}</p>
    </div>
    <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#5a6068;margin:0 0 10px;">DON'T FORGET</p>
    <ul style="margin:0 0 28px;padding-left:24px;">
      <li style="margin:0 0 8px;font-size:15px;line-height:1.8;">Photo ID</li>
      <li style="margin:0 0 8px;font-size:15px;line-height:1.8;">Proof of income</li>
      <li style="margin:0 0 8px;font-size:15px;line-height:1.8;">Your questions</li>
    </ul>
    <p style="font-size:15px;line-height:2.0;margin:0 0 28px;color:#5a6068;">Can't make it? Reply to this email and we'll reschedule.</p>
    <p style="font-size:17px;margin:0;">— Ebin · (519) 697-1227</p>
  </div>`;
}

function followupEmail(firstName: string, address: string, listingUrl: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Hi ${firstName},</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Thanks for coming to see <strong>${address}</strong> today. I hope you got a good feel for the place.</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">If you're interested in moving forward, the next step is simple — submit your application and we'll get things rolling.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${listingUrl}" style="display:inline-block;background:#8B2030;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Apply Now</a>
    </div>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Got questions? Just reply to this email or call me at (519) 697-1227.</p>
    <p style="font-size:17px;margin:0 0 8px;">Talk soon,</p>
    <p style="font-size:17px;margin:0;font-weight:600;">Ebin</p>
  </div>`;
}

function nudgeEmail(firstName: string, address: string, listingUrl: string, inquiryCount: number): string {
  const urgency = inquiryCount > 5
    ? `This listing has had ${inquiryCount} inquiries this week.`
    : "Good properties in this area don't stay available long.";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#1a1a1a;">
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Hi ${firstName},</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">Just checking in on <strong>${address}</strong>. Still thinking it over?</p>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">${urgency} If you're still interested, I'd recommend applying soon to secure it.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${listingUrl}" style="display:inline-block;background:#8B2030;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">View Listing & Apply</a>
    </div>
    <p style="font-size:17px;line-height:2.0;margin:0 0 28px;">No pressure at all — if this one isn't the right fit, we have more listings coming. Either way, we'll keep you in the loop.</p>
    <p style="font-size:17px;margin:0;">— Ebin · (519) 697-1227</p>
  </div>`;
}
