/**
 * Weekly Email Improvement Loop
 * Runs every Sunday at 8pm EST (1am UTC Monday).
 *
 * What it does:
 *  1. Pulls last 7 days of sequence send log from Supabase
 *  2. Groups sends by contact_type + sequence_index
 *  3. Passes the email copy + send stats to Claude for analysis
 *  4. Emails Ebin a report: what went out + Claude's rewrite suggestions
 *
 * Schedule: "0 1 * * 1"  (1am UTC = 9pm Sunday EST)
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAgentRun } from "@/lib/agent-logger";
import { SEQUENCES } from "@/lib/email-sequences";

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }
function getResend() { return new Resend(process.env.RESEND_API_KEY!); }
const CRON_SECRET = process.env.CRON_SECRET;
const EBIN_EMAIL  = "prosperapropertiess@gmail.com";
const FROM_EMAIL  = "Prospera AI <ebin@prosperaproperties.co>";

// ── Helpers ────────────────────────────────────────────────────────────────────

function htmlReport(content: string): string {
  const year = new Date().getFullYear();
  const NAVY    = "#1F2F3A";
  const CRIMSON = "#8B2030";
  const WHITE   = "#ffffff";
  const TEXT    = "#1b1c1a";
  const MUTED   = "#43474b";
  const BORDER  = "#e4e2df";
  const BG_SUBTLE = "#f5f3f0";
  const FONT    = "Arial, Helvetica, sans-serif";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weekly Email Improvement Report</title>
</head>
<body style="margin:0;padding:0;background-color:${NAVY};font-family:${FONT};">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:24px 16px;background-color:${NAVY};">
        <table cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background-color:${NAVY};">

          <!-- Header -->
          <tr>
            <td style="padding:28px 40px 20px;background-color:${NAVY};">
              <p style="margin:0 0 4px;font-family:${FONT};font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.15em;">PROSPERA PROPERTIES</p>
              <p style="margin:0;font-family:${FONT};font-size:22px;font-weight:700;color:${WHITE};">Weekly Email Report</p>
              <p style="margin:6px 0 0;font-family:${FONT};font-size:13px;color:rgba(255,255,255,0.5);">${new Date().toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </td>
          </tr>

          <!-- White card -->
          <tr>
            <td style="padding:0 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${WHITE};border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:36px 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 40px;text-align:center;">
              <p style="margin:0;font-family:${FONT};font-size:10px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.1em;">© ${year} PROSPERA PROPERTIES — AUTO-GENERATED REPORT</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function stat(label: string, value: string | number) {
  return `<td style="padding:12px 16px;text-align:center;border-right:1px solid #e4e2df;">
    <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#1F2F3A;font-family:Arial,sans-serif;">${value}</p>
    <p style="margin:0;font-size:11px;color:#999999;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">${label}</p>
  </td>`;
}

// ── Main handler ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const start = Date.now();

  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Kill switch — matches sequence-sender flag
  if (process.env.SEQUENCE_SENDING_ENABLED !== "true") {
    return NextResponse.json({ skipped: true, reason: "Sequence sending is disabled." });
  }

  const sb = getSupabaseAdmin();

  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // ── 1. Pull last 7 days of sends ─────────────────────────────────────────
    const { data: logs, error: logErr } = await sb
      .from("sequence_send_log")
      .select("*")
      .gte("sent_at", weekAgo.toISOString())
      .order("sent_at", { ascending: false });

    if (logErr) throw new Error(logErr.message);

    const totalSent = logs?.length ?? 0;

    // Group by contact_type
    const byType: Record<string, number> = {};
    const byStep: Record<string, number> = {}; // "type:index"

    for (const row of (logs ?? [])) {
      byType[row.contact_type] = (byType[row.contact_type] ?? 0) + 1;
      const key = `${row.contact_type}:${row.sequence_index}`;
      byStep[key] = (byStep[key] ?? 0) + 1;
    }

    // ── 2. Pull sequence state stats ─────────────────────────────────────────
    const { count: activeCount } = await sb
      .from("email_sequence_state")
      .select("*", { count: "exact", head: true })
      .eq("completed", false)
      .eq("unsubscribed", false);

    const { count: completedCount } = await sb
      .from("email_sequence_state")
      .select("*", { count: "exact", head: true })
      .eq("completed", true);

    const { count: unsubCount } = await sb
      .from("email_sequence_state")
      .select("*", { count: "exact", head: true })
      .eq("unsubscribed", true);

    // ── 3. Build email copy summary for Claude ────────────────────────────────
    const sequenceSummary = Object.entries(SEQUENCES)
      .map(([type, emails]) => {
        const emailList = emails.map((e, i) => {
          const sendCount = byStep[`${type}:${i}`] ?? 0;
          return `  Email ${i + 1} (Day ${e.delayDays}) — "${e.subject}" — sent ${sendCount}x this week`;
        }).join("\n");
        return `## ${type.replace(/_/g, " ").toUpperCase()} (${byType[type] ?? 0} sent this week)\n${emailList}`;
      })
      .join("\n\n");

    // ── 4. Ask Claude for analysis ────────────────────────────────────────────
    const claudePrompt = `You are a senior email marketing strategist for Prospera Properties, a property management company in London, Strathroy, and St. Thomas, Ontario.

You are reviewing the email sequence performance for the past week. Here is a summary of what went out:

${sequenceSummary}

TOTAL SENT THIS WEEK: ${totalSent}
ACTIVE IN SEQUENCES: ${activeCount ?? 0}
COMPLETED SEQUENCES: ${completedCount ?? 0}

Here are the current email sequence definitions (subjects and timing):
${Object.entries(SEQUENCES).map(([type, emails]) =>
  `${type}: ${emails.map((e, i) => `[${i}] Day ${e.delayDays}: "${e.subject}"`).join(" → ")}`
).join("\n")}

Your job:
1. Briefly assess what's working and what could be improved based on the subject lines and sequence timing.
2. Flag any sequences that seem under-used or may need attention.
3. Suggest 2-3 SPECIFIC improvements to subject lines, timing, or content angles that would likely improve engagement.
4. Keep your response focused and actionable — no fluff.

Format your response with clear sections using ##. Be direct. Ebin is a busy property manager, not a marketer.`;

    const aiResponse = await getAnthropic().messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1200,
      messages: [{ role: "user", content: claudePrompt }],
    });

    const analysis = aiResponse.content[0].type === "text"
      ? aiResponse.content[0].text
      : "Analysis unavailable.";

    // ── 5. Format the HTML email ──────────────────────────────────────────────
    const TEXT    = "#1b1c1a";
    const MUTED   = "#43474b";
    const CRIMSON = "#8B2030";
    const BG_SUBTLE = "#f5f3f0";
    const BORDER  = "#e4e2df";
    const FONT    = "Arial, Helvetica, sans-serif";

    // Stats bar
    const statsBar = `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;">
  <tr>
    ${stat("Sent This Week", totalSent)}
    ${stat("Active", activeCount ?? 0)}
    ${stat("Completed", completedCount ?? 0)}
    <td style="padding:12px 16px;text-align:center;">
      <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#8B2030;font-family:${FONT};">${unsubCount ?? 0}</p>
      <p style="margin:0;font-size:11px;color:#999999;text-transform:uppercase;letter-spacing:1px;font-family:${FONT};">Unsub</p>
    </td>
  </tr>
</table>`;

    // Breakdown by type
    const typeBreakdown = Object.entries(byType).length > 0
      ? `<div style="margin:0 0 28px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">BY CONTACT TYPE</p>
          ${Object.entries(byType).map(([type, count]) =>
            `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid ${BORDER};">
              <span style="font-size:14px;color:${TEXT};font-family:${FONT};">${type.replace(/_/g, " ")}</span>
              <span style="font-size:14px;font-weight:700;color:${TEXT};font-family:${FONT};">${count} sent</span>
            </div>`
          ).join("")}
        </div>`
      : `<p style="margin:0 0 28px;font-size:14px;color:${MUTED};font-family:${FONT};">No emails sent this week yet. Sequences are active and will send automatically.</p>`;

    // Claude's analysis — convert markdown ##/bold to HTML
    const analysisHtml = analysis
      .replace(/^## (.+)$/gm, `<p style="margin:20px 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${MUTED};font-family:${FONT};">$1</p>`)
      .replace(/\*\*(.+?)\*\*/g, `<strong>$1</strong>`)
      .split(/\n{2,}/)
      .map(chunk => {
        chunk = chunk.trim();
        if (!chunk) return "";
        if (chunk.startsWith("<p style=")) return chunk;
        return `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:${TEXT};font-family:${FONT};">${chunk.replace(/\n/g, " ")}</p>`;
      })
      .join("\n");

    const bodyContent = `
<p style="margin:0 0 24px;font-size:16px;font-weight:700;color:#1F2F3A;font-family:${FONT};">Last 7 days — ${new Date().toLocaleDateString("en-CA", { month: "long", day: "numeric" })}</p>

${statsBar}

${typeBreakdown}

<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 0;">
  <tr>
    <td style="border-top:2px solid ${CRIMSON};padding-top:20px;">
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${CRIMSON};font-family:${FONT};">AI ANALYSIS &amp; SUGGESTIONS</p>
      ${analysisHtml}
    </td>
  </tr>
</table>

<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
  <tr>
    <td style="background-color:${BG_SUBTLE};border-radius:10px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:${MUTED};font-family:${FONT};line-height:1.6;">
        To apply any suggested improvements, forward this email to yourself with your notes, and I (Claude) will update the email copy next time you open Cowork. Sequences continue running automatically.
      </p>
    </td>
  </tr>
</table>`;

    const emailHtml = htmlReport(bodyContent);

    // ── 6. Send the report to Ebin ────────────────────────────────────────────
    const { error: sendErr } = await getResend().emails.send({
      from:    FROM_EMAIL,
      to:      EBIN_EMAIL,
      subject: `📊 Weekly Email Report — ${totalSent} sent, ${analysis.length > 0 ? "improvements ready" : "nothing to report"}`,
      html:    emailHtml,
    });

    if (sendErr) throw new Error(`Resend error: ${sendErr.message}`);

    const duration = Date.now() - start;
    await logAgentRun("weekly-improvement", "success", { totalSent, activeCount, analysis: analysis.slice(0, 200) }, duration);

    return NextResponse.json({ success: true, totalSent, activeCount });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logAgentRun("weekly-improvement", "error", {}, Date.now() - start, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
