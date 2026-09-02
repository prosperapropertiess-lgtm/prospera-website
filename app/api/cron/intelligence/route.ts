/**
 * Daily Founder Intelligence Cycle — runs every day at 6:30am EST (11:30 UTC)
 *
 * Compounding engine:
 *   - Reads the last 7 successful runs from agent_runs
 *   - Passes the domain history to Claude so each session builds on the last
 *
 * Each run:
 *   1. Picks one core concept from a rotation of deep domains
 *   2. Loads history from Supabase for the compounding context
 *   3. Uses Claude Sonnet to generate the full intelligence cycle
 *   4. Sends to ebinjaison02@gmail.com via Resend
 *   5. Logs to agent_runs
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { logAgentRun } from "@/lib/agent-logger";
import { getSupabaseAdmin } from "@/lib/supabase";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

const RECIPIENT = "ebinjaison02@gmail.com";
const FROM = "Ebin Intelligence <hello@prosperaproperties.co>";
const FONT = "Arial, Helvetica, sans-serif";

const DOMAINS = [
  "incentive design",
  "queue theory",
  "systems architecture",
  "behavioral economics",
  "organizational design",
  "pricing power",
  "decision theory",
  "failure modes in operational systems",
  "offer structuring",
  "constraint theory",
  "information asymmetry",
  "network effects",
  "agency problems",
  "switching costs",
  "flywheel dynamics",
];

const SYSTEM_PROMPT = `You are a simulation engine that trains a founder to think like an operator running a scalable property management company for small portfolio landlords (4–15 units) moving toward 1,000+ doors.

Generate one daily intelligence cycle. Every output must optimize for: leverage, speed of insight, real-world execution, decision quality under uncertainty, and system design thinking.

You will be given ONE core concept domain. Use it as the lens for the entire output.

Follow this EXACT structure with these EXACT section headers:

---

⚙️ CORE LEVERAGE INSIGHT (ONE IDEA ONLY)

Give ONE idea that sits at the root of leverage in business. Not surface tactics. Not advice. Reveal the hidden structure behind business behavior. Show why most operators fail at it. Connect it to scaling constraints. Frame it as: "If I understood only this one idea today, I would operate differently."

---

🏢 FAMOUS COMPANY MOVE

Find ONE real move made by a famous company (Airbnb, Amazon, Stripe, Apple, Uber, Monzo, HubSpot, Shopify, or similar) that directly illustrates the core concept. Show the exact mechanism they used — not the headline, the actual structural decision underneath it. Then show the equivalent move available to a property management company at the 4–15 door stage. Format as: What [Company] did → Why it worked → What Prospera can steal.

---

📦 OFFER STRUCTURING LENS

Apply the core concept directly to how the offer is structured. Cover: how the concept should shape pricing tiers, contract terms, guarantee framing, or what's included vs. excluded. One specific change to the current offer structure that would increase perceived value, reduce friction, or capture more margin. Be concrete — name the actual change.

---

🧠 SYSTEM MAPPING (PROPERTY MANAGEMENT LENS)

Translate the idea into three system layers:

A. Tenant Layer — How this shows up in tenant behavior, complaints, payments, renewals, and friction.

B. Owner Layer — How this shows up in landlord psychology, expectations, trust, and retention.

C. Internal Ops Layer — How this shows up in maintenance, leasing, communication, vendor coordination, and workload queues.

Show the invisible machinery behind outcomes.

---

🧱 FAILURE MODE ANALYSIS (WHERE MOST COMPANIES BREAK)

Identify: the most common way property management companies fail with this concept, the subtle early warning signs, and the cost of ignoring it at scale (50 → 500 → 1,000 doors). Focus on structural failure, not mistakes.

---

💰 ONE LEVERAGE MOVE (IMMEDIATE BUSINESS UPGRADE)

Give ONE specific action that improves revenue, retention, speed, operational load, or positioning. Must be: executable within 7 days, tied to the 4–15 property niche, and system-level (not "work harder" advice). Acceptable forms: redesign a workflow, change communication structure, adjust pricing logic, remove a bottleneck, alter onboarding, reframe positioning.

---

🔍 REALITY TEST (FORCE OBSERVATION TODAY)

Give ONE lens to observe the world through today. It must help "see the system in real time." Should be recognizable within hours.

---

🎯 DECISION SHARPENER (FORCED THINKING QUESTION)

Ask ONE question that forces high-level operator reasoning. Must: break surface thinking, expose second-order consequences, challenge assumptions in a property management business. No soft questions. No motivational tone. It should feel like a mental constraint.

---

🧬 COMPOUNDING RULE (HOW THIS CONNECTS)

Connect today's concept to the broader system being built. If prior domains are provided in context, explicitly name which one today's insight builds on, contradicts, or amplifies. Show the compound effect — what becomes possible when two or more of these ideas are understood together. If this is Day 1, frame as: "Day 1 baseline — this concept is the foundation everything else will build on or contradict."

---

End with this exact line on its own:
"If this is solved, everything downstream becomes easier."

Output plain text only. No markdown code fences. Keep it dense and specific — no filler, no motivation, no softening.`;

// ── Compounding engine ───────────────────────────────────────
async function getPriorSessions(): Promise<Array<{ date: string; domain: string; dayNum: number }>> {
  try {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("agent_runs")
      .select("summary, created_at")
      .eq("agent", "intelligence")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(7);

    if (!data || data.length === 0) return [];

    return data.map((row, i) => ({
      date: new Date(row.created_at).toLocaleDateString("en-CA", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "America/Toronto",
      }),
      domain: (row.summary as { domain?: string })?.domain ?? "unknown",
      dayNum: data.length - i,
    })).reverse();
  } catch {
    return [];
  }
}

// ── Email HTML ───────────────────────────────────────────────
function emailHtml(date: string, domain: string, dayNumber: number, priorDomains: string[], body: string): string {
  const NAVY = "#1a2634";
  const CRIMSON = "#8B2030";
  const year = new Date().getFullYear();

  const lines = body.split("\n");
  let html = lines
    .map((line) => {
      const isHeader = ["⚙️","🏢","📦","🧠","🧱","💰","🔍","🎯","🧬"].some(e => line.startsWith(e));
      if (isHeader) {
        return `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:40px 0 12px;">
            <tr><td style="height:1px;background:#eceae6;"></td></tr>
          </table>
          <p style="margin:0 0 10px;font-family:${FONT};font-size:11px;font-weight:700;color:${CRIMSON};text-transform:uppercase;letter-spacing:2px;">${line}</p>`;
      }
      if (line.trim() === "---") return "";
      if (line.startsWith("A.") || line.startsWith("B.") || line.startsWith("C.")) {
        return `<p style="margin:24px 0 8px;font-family:${FONT};font-size:16px;font-weight:700;color:#111111;">${line}</p>`;
      }
      if (line.trim() === "") return `<div style="height:12px;"></div>`;
      if (line === "If this is solved, everything downstream becomes easier.") {
        return `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:40px 0 0;">
            <tr><td style="height:1px;background:#eceae6;"></td></tr>
          </table>
          <p style="margin:28px 0 0;font-family:${FONT};font-size:17px;font-weight:700;color:${CRIMSON};font-style:italic;">${line}</p>`;
      }
      return `<p style="margin:0 0 22px;font-family:${FONT};font-size:17px;line-height:2.0;color:#222222;">${line}</p>`;
    })
    .join("\n");

  const compoundBar = priorDomains.length > 0
    ? `<p style="margin:0;font-family:${FONT};font-size:12px;color:rgba(255,255,255,0.4);line-height:1.8;">
        <span style="color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:1px;font-size:10px;">Prior sessions: </span>
        ${priorDomains.map(d => `<span style="color:rgba(255,255,255,0.5);">${d}</span>`).join(' <span style="color:rgba(255,255,255,0.2);">·</span> ')}
      </p>`
    : `<p style="margin:0;font-family:${FONT};font-size:12px;color:rgba(255,255,255,0.35);">Session 1 — compounding begins today.</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Intelligence Cycle</title>
<style>
  body { margin:0; padding:0; background-color:${NAVY}; }
  @media only screen and (max-width:620px) {
    .outer { padding:0 !important; }
    .header-cell { padding:20px 24px !important; }
    .meta-cell { padding:20px 24px !important; border-radius:0 !important; }
    .body-cell { padding:32px 24px 40px !important; border-radius:0 !important; }
    .footer-cell { padding:28px 24px !important; }
    .compound-row { padding:16px 24px !important; }
    p { font-size:17px !important; line-height:2.0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${NAVY};font-family:${FONT};">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td class="outer" align="center" style="padding:24px 16px;background-color:${NAVY};">
      <table cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td class="header-cell" style="padding:24px 32px 16px;background-color:${NAVY};">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-block;background:#ffffff;border-radius:6px;padding:5px 11px;">
                    <span style="font-family:${FONT};font-size:12px;font-weight:700;color:${NAVY};letter-spacing:0.5px;">PROSPERA</span>
                  </div>
                </td>
                <td style="text-align:right;">
                  <span style="font-family:${FONT};font-size:10px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1.5px;">Day ${dayNumber} · Intelligence</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Meta -->
        <tr>
          <td style="padding:0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#101d27;border-radius:12px 12px 0 0;">
              <tr>
                <td class="meta-cell" style="padding:22px 32px;">
                  <p style="margin:0 0 6px;font-family:${FONT};font-size:11px;font-weight:700;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:2px;">${date}</p>
                  <p style="margin:0 0 4px;font-family:${FONT};font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">Today: <span style="color:#c97070;">${domain}</span></p>
                </td>
              </tr>
              ${priorDomains.length > 0 ? `
              <tr>
                <td class="compound-row" style="padding:12px 32px 20px;border-top:1px solid rgba(255,255,255,0.06);">
                  ${compoundBar}
                </td>
              </tr>` : `
              <tr><td class="compound-row" style="padding:8px 32px 18px;">${compoundBar}</td></tr>`}
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:0 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:0 0 16px 16px;">
              <tr>
                <td class="body-cell" style="padding:40px 40px 48px;">
                  ${html}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="footer-cell" style="padding:32px;text-align:center;background-color:${NAVY};">
            <p style="margin:0 0 4px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;">Ebin Jaison</p>
            <p style="margin:0 0 20px;font-family:${FONT};font-size:10px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:1.5px;">Founder · Prospera Properties</p>
            <p style="margin:0;font-family:${FONT};font-size:10px;color:rgba(255,255,255,0.15);text-transform:uppercase;letter-spacing:0.5px;">© ${year} Prospera Properties Management Group</p>
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
  const start = Date.now();

  // Auth check
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Pick domain — rotate by day of year
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    const domain = DOMAINS[dayOfYear % DOMAINS.length];

    // Load compounding history
    const priorSessions = await getPriorSessions();
    const dayNumber = priorSessions.length + 1;
    const priorDomains = priorSessions.map(s => s.domain);

    const historyContext = priorSessions.length > 0
      ? `\n\nCompounding context — prior sessions (oldest → most recent):\n${priorSessions.map(
          (s, i) => `Day ${i + 1} (${s.date}): ${s.domain}`
        ).join("\n")}\n\nThis is Day ${dayNumber}. In the Compounding Rule section, explicitly connect today's domain to the most relevant prior sessions. Name specific ideas from previous domains that either reinforce, contradict, or amplify today's concept.`
      : "\n\nThis is Day 1. No prior sessions. In the Compounding Rule section, frame this as the baseline from which all future sessions will build.";

    // Generate intelligence cycle
    const client = getAnthropic();
    const intelligenceResult = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `${SYSTEM_PROMPT}\n\nToday's core concept domain: ${domain}${historyContext}\n\nGenerate the full daily intelligence cycle for a founder building a property management company from 4–15 doors toward 1,000+.`,
      }],
    });

    const body = intelligenceResult.content[0].type === "text" ? intelligenceResult.content[0].text : "";

    if (!body) {
      throw new Error("Claude returned empty response");
    }

    // Format date
    const dateStr = new Date().toLocaleDateString("en-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Toronto",
    });

    const subject = `Day ${dayNumber} · ${domain.charAt(0).toUpperCase() + domain.slice(1)}`;

    // Send email
    const { data, error } = await getResend().emails.send({
      from: FROM,
      to: RECIPIENT,
      subject,
      html: emailHtml(dateStr, domain, dayNumber, priorDomains, body),
    });

    if (error) throw new Error(JSON.stringify(error));

    const duration = Date.now() - start;
    await logAgentRun("intelligence", "success", {
      domain,
      dayNumber,
      emailId: data?.id,
      dateStr,
      priorDomains,
    }, duration);

    return NextResponse.json({ ok: true, domain, dayNumber, emailId: data?.id });
  } catch (err) {
    const duration = Date.now() - start;
    await logAgentRun("intelligence", "error", undefined, duration, String(err));
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
