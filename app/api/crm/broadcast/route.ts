/**
 * CRM Broadcast API
 * Send a one-off email to all contacts of a given type (or all contacts).
 * Used for: newsletters, new property alerts, LTB updates, market updates.
 *
 * POST /api/crm/broadcast
 * Body: {
 *   subject: string           — email subject line
 *   body: string              — plain text body (Claude will make it pretty)
 *   audience: "all" | "potential_landlord" | "selfmanager_landlord" | "realtor" | "client"
 *   use_claude?: boolean      — if true, Claude rewrites body as Ebin's voice (default: false)
 *   admin_secret: string      — must match ADMIN_SECRET env var
 * }
 *
 * This is called from the admin UI at /admin/crm/broadcast.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import Anthropic from "@anthropic-ai/sdk";

const FROM_EMAIL = "Ebin at Prospera <ebin@prosperaproperties.co>";

function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }

const VALID_AUDIENCES = ["all", "potential_landlord", "selfmanager_landlord", "realtor", "client"] as const;
type Audience = typeof VALID_AUDIENCES[number];

async function rewriteWithClaude(subject: string, body: string): Promise<{ subject: string; body: string }> {
  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: `You are Ebin Jaison, founder of Prospera Properties in London, Ontario.
Rewrite the provided email in your voice: direct, warm, plain language.
No hype words. Sign off with just "Ebin" on its own line.
Output only valid JSON: { "subject": "...", "body_text": "... (use \\n\\n between paragraphs)" }`,
    messages: [{
      role: "user",
      content: `Original subject: ${subject}\n\nOriginal body:\n${body}`,
    }],
  });

  const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(cleaned) as { subject: string; body_text: string };
  return { subject: parsed.subject, body: parsed.body_text };
}

function buildBroadcastHtml(bodyText: string, recipientEmail: string): string {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, "<br>").trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p style="margin:0 0 18px 0;line-height:1.65;color:#222222;">${p}</p>`)
    .join("\n");

  const unsubEmail = encodeURIComponent(recipientEmail);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:6px;overflow:hidden;">
      <tr><td style="background:#1F2F3A;padding:18px 32px;">
        <p style="margin:0;color:#FAF8F5;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Prospera Properties</p>
      </td></tr>
      <tr><td style="padding:32px 32px 24px;font-size:15px;">${paragraphs}</td></tr>
      <tr><td style="padding:0 32px 28px;border-top:1px solid #eeeeee;">
        <p style="margin:20px 0 0;font-size:11px;color:#aaaaaa;line-height:1.6;">
          Prospera Properties · London, Ontario ·
          <a href="https://www.prosperaproperties.co" style="color:#8B2030;text-decoration:none;">prosperaproperties.co</a><br>
          <a href="https://www.prosperaproperties.co/unsubscribe?email=${unsubEmail}" style="color:#aaaaaa;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  // Auth check
  const adminSecret = process.env.ADMIN_SECRET;
  const body = await req.json() as {
    subject?: string;
    body?: string;
    audience?: string;
    use_claude?: boolean;
    admin_secret?: string;
  };

  if (!adminSecret || body.admin_secret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body: rawBody, audience = "all", use_claude = false } = body;

  if (!subject?.trim() || !rawBody?.trim()) {
    return NextResponse.json({ error: "subject and body are required" }, { status: 400 });
  }

  if (!VALID_AUDIENCES.includes(audience as Audience)) {
    return NextResponse.json({ error: "invalid audience" }, { status: 400 });
  }

  // Optionally rewrite with Claude
  let finalSubject = subject.trim();
  let finalBody = rawBody.trim();

  if (use_claude) {
    try {
      const rewritten = await rewriteWithClaude(finalSubject, finalBody);
      finalSubject = rewritten.subject;
      finalBody = rewritten.body;
    } catch (err) {
      console.error("[broadcast] Claude rewrite failed, using original:", err);
    }
  }

  // Fetch recipients from hubspot_contacts
  const sb = getSupabaseAdmin();
  let query = sb
    .from("hubspot_contacts")
    .select("email, name")
    .not("email", "is", null);

  if (audience !== "all") {
    query = query.eq("contact_type", audience);
  }

  const { data: contacts, error: fetchErr } = await query;
  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!contacts || contacts.length === 0) {
    return NextResponse.json({ sent: 0, message: "No contacts found for this audience" });
  }

  // Also fetch unsubscribed emails from email_sequence_state
  const { data: unsubs } = await sb
    .from("email_sequence_state")
    .select("email")
    .eq("unsubscribed", true);

  const unsubSet = new Set((unsubs ?? []).map((r: { email: string }) => r.email.toLowerCase()));

  const resend = getResend();
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const contact of contacts) {
    const email = contact.email?.trim().toLowerCase();
    if (!email || unsubSet.has(email)) {
      skipped++;
      continue;
    }

    const html = buildBroadcastHtml(finalBody, email);

    const { error: sendErr } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      email,
      subject: finalSubject,
      html,
    });

    if (sendErr) {
      errors.push(`${email}: ${sendErr.message}`);
      continue;
    }

    // Log broadcast send
    await sb.from("sequence_send_log").insert({
      hubspot_id:     null,
      email,
      contact_type:   audience,
      sequence_index: -1, // -1 = broadcast
      subject:        finalSubject,
    }).select().maybeSingle(); // ignore errors

    sent++;
  }

  return NextResponse.json({
    sent,
    skipped,
    errors: errors.length > 0 ? errors : undefined,
    subject: finalSubject,
  });
}
