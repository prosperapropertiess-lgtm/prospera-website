/**
 * Daily Founder Intelligence Cycle — runs every day at 7am EST (12:00 UTC)
 *
 * Each run:
 *   1. Picks one core concept from a rotation of deep domains
 *   2. Uses Claude Sonnet to generate the full intelligence cycle
 *   3. Sends to ebinjaison02@gmail.com via Resend
 *   4. Logs to agent_runs
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { logAgentRun } from "@/lib/agent-logger";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENT = "ebinjaison02@gmail.com";
const FROM = "Ebin Intelligence <hello@prosperaproperties.co>";

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

const SYSTEM_PROMPT = `You are a simulation engine that trains a founder to think like an operator running a scalable property management company for small portfolio landlords (2–5 units) moving toward 1,000+ doors.

Generate one daily intelligence cycle. Every output must optimize for: leverage, speed of insight, real-world execution, decision quality under uncertainty, and system design thinking.

You will be given ONE core concept domain. Use it as the lens for the entire output.

Follow this EXACT structure with these EXACT section headers:

---

⚙️ CORE LEVERAGE INSIGHT (ONE IDEA ONLY)

Give ONE idea that sits at the root of leverage in business. Not surface tactics. Not advice. Reveal the hidden structure behind business behavior. Show why most operators fail at it. Connect it to scaling constraints. Frame it as: "If I understood only this one idea today, I would operate differently."

---

🏢 FAMOUS COMPANY MOVE

Find ONE real move made by a famous company (Airbnb, Amazon, Stripe, Apple, Uber, Monzo, HubSpot, Shopify, or similar) that directly illustrates the core concept. Show the exact mechanism they used — not the headline, the actual structural decision underneath it. Then show the equivalent move available to a property management company at the 2–5 door stage. Format as: What [Company] did → Why it worked → What Prospera can steal.

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

Give ONE specific action that improves revenue, retention, speed, operational load, or positioning. Must be: executable within 7 days, tied to the 2–5 property niche, and system-level (not "work harder" advice). Acceptable forms: redesign a workflow, change communication structure, adjust pricing logic, remove a bottleneck, alter onboarding, reframe positioning.

---

🔍 REALITY TEST (FORCE OBSERVATION TODAY)

Give ONE lens to observe the world through today. It must help "see the system in real time." Should be recognizable within hours.

---

🎯 DECISION SHARPENER (FORCED THINKING QUESTION)

Ask ONE question that forces high-level operator reasoning. Must: break surface thinking, expose second-order consequences, challenge assumptions in a property management business. No soft questions. No motivational tone. It should feel like a mental constraint.

---

🧬 COMPOUNDING RULE (HOW THIS CONNECTS)

Connect today's concept to the broader system being built. Show what yesterday's insight this builds on or contradicts. If this is Day 1, frame as: "Day 1 baseline — this concept is the foundation everything else will build on or contradict."

---

End with this exact line on its own:
"If this is solved, everything downstream becomes easier."

Output plain text only. No markdown code fences. Keep it dense and specific — no filler, no motivation, no softening.`;

function emailHtml(date: string, domain: string, body: string): string {
  const lines = body.split("\n");
  let html = lines
    .map((line) => {
      if (line.startsWith("⚙️") || line.startsWith("🏢") || line.startsWith("📦") || line.startsWith("🧠") || line.startsWith("🧱") || line.startsWith("💰") || line.startsWith("🔍") || line.startsWith("🎯") || line.startsWith("🧬")) {
        return `<h2 style="margin:32px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#8B2030;text-transform:uppercase;letter-spacing:1px;">${line}</h2>`;
      }
      if (line.trim() === "---") {
        return `<hr style="border:none;border-top:1px solid #e4e2df;margin:20px 0;" />`;
      }
      if (line.startsWith("A.") || line.startsWith("B.") || line.startsWith("C.")) {
        return `<p style="margin:12px 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#1b1c1a;">${line}</p>`;
      }
      if (line.trim() === "") return `<br/>`;
      if (line === "If this is solved, everything downstream becomes easier.") {
        return `<p style="margin:32px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#8B2030;font-style:italic;">${line}</p>`;
      }
      return `<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.75;color:#333333;">${line}</p>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Daily Intelligence Cycle</title>
</head>
<body style="margin:0;padding:0;background-color:#1F2F3A;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:24px 16px;background-color:#1F2F3A;">
      <table cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:28px 40px 20px;background-color:#1F2F3A;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-block;background-color:#ffffff;border-radius:8px;padding:6px 12px;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#1F2F3A;">PROSPERA</span>
                  </div>
                </td>
                <td style="text-align:right;">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.1em;">Intelligence Cycle</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Meta strip -->
        <tr>
          <td style="padding:0 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0D1820;border-radius:12px 12px 0 0;padding:16px 24px;">
              <tr>
                <td style="padding:16px 24px;">
                  <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:1.5px;">${date}</p>
                  <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#ffffff;">Today's Domain: <span style="color:#c97070;">${domain}</span></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- White card -->
        <tr>
          <td style="padding:0 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:0 0 20px 20px;">
              <tr>
                <td style="padding:36px 40px 40px;">
                  ${html}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 40px;text-align:center;background-color:#1F2F3A;">
            <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#ffffff;">Ebin</p>
            <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.2em;">Founder · Prospera Properties</p>
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.1em;">© ${new Date().getFullYear()} PROSPERA PROPERTIES MANAGEMENT GROUP</p>
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

    // Generate intelligence cycle
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2400,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Today's core concept domain: ${domain}\n\nGenerate the full daily intelligence cycle for a founder building a property management company from 2–5 doors toward 1,000+.`,
        },
      ],
    });

    const body =
      message.content[0].type === "text" ? message.content[0].text : "";

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

    const subject = `🧠 Daily Intelligence Cycle — ${new Date().toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "America/Toronto",
    })}`;

    // Send email
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: RECIPIENT,
      subject,
      html: emailHtml(dateStr, domain, body),
    });

    if (error) throw new Error(JSON.stringify(error));

    const duration = Date.now() - start;
    await logAgentRun("intelligence", "success", { domain, emailId: data?.id, dateStr }, duration);

    return NextResponse.json({ ok: true, domain, emailId: data?.id });
  } catch (err) {
    const duration = Date.now() - start;
    await logAgentRun("intelligence", "error", undefined, duration, String(err));
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
