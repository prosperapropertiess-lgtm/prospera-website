/**
 * CRM AI — Claude-powered personalized email generation
 * Replaces hardcoded email templates with AI-written emails based on
 * Ebin's notes from HubSpot and the sequence step intent.
 */

import Anthropic from "@anthropic-ai/sdk";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

export interface ContactContext {
  name: string;
  email: string;
  contactType: string;
  city?: string | null;
}

const CONTACT_TYPE_LABELS: Record<string, string> = {
  potential_landlord: "landlord who hasn't yet signed with Prospera",
  selfmanager_landlord: "landlord who currently self-manages their properties",
  realtor: "realtor or real estate agent",
  client: "property owner who recently signed with Prospera",
};

// What each email in each sequence is supposed to accomplish.
// These are passed to Claude as the mission — Claude decides how to execute it.
const SEQUENCE_INTENTS: Record<string, string[]> = {
  potential_landlord: [
    "Warm welcome — acknowledge how we connected, briefly introduce yourself and Prospera, offer one useful free resource (the Ontario landlord guide on the website), ask one low-pressure question about their property situation",
    "Educational value — share 3 common mistakes Ontario landlords make (e.g. tenant screening shortcuts, improper rent increase notices, missing N12 requirements) — position yourself as the expert who handles these correctly, no pitch",
    "Concrete value — describe what full property management actually looks like day-to-day at Prospera, make it specific and real, include a subtle invitation to have a conversation",
    "Soft close — acknowledge they may not be ready right now, wish them well, leave the door permanently open, let them know they can reply any time with questions",
  ],
  selfmanager_landlord: [
    "Warm personal reach-out — acknowledge they manage their own properties, offer something genuinely useful (an LTB update or Ontario landlord resource), zero pitch",
    "Empathy and a story — self-managing is a real job with real stress, share one specific situation where Prospera stepped in and saved a landlord time or a legal headache",
    "Gentle open door — if they ever want to talk about whether professional management would make sense, you are available, no obligation, no pressure",
  ],
  realtor: [
    "Referral relationship intro — great to connect, explain what a referral looks like: Prospera manages the property, the realtor stays the trusted advisor, investor clients get handled properly",
    "Value to their clients — what does a referred investor actually get: professional management, full Ontario compliance, monthly reporting, maintenance coordination — make the referral feel low-risk",
    "Stay top of mind — mention any properties coming available or market updates, offer to connect on a client-specific basis whenever the timing makes sense",
  ],
  client: [
    "Welcome aboard — warm and specific, spell out next steps clearly: what happens in week 1, who to contact for what, how to access their owner portal",
    "First 30 days walkthrough — what Prospera does in the first month: inspection, photos, listing, showing coordination, lease preparation",
    "One-week check-in — brief personal note, ask if they have questions or anything feels unclear, remind them where to find reports",
    "30-day milestone — what has been accomplished, any property updates, what comes next",
  ],
};

// Nurture track — contacts who completed their main sequence move here.
// Monthly sends, indefinitely. Index = months since completion (0-based, wraps).
export const NURTURE_SUBJECTS = [
  "One thing I noticed in the London rental market this month",
  "Quick LTB update for Ontario landlords",
  "A situation we handled this month (might be useful)",
  "What tenants are asking about right now",
  "Maintenance season — what to check before winter",
  "London rental vacancy update",
  "One thing self-managing landlords often miss",
  "A note from Ebin",
  "Ontario rent increase guidelines — what changed",
  "What we're seeing in St. Thomas and Strathroy",
  "Spring rental market — what to expect",
  "Quick question for you",
];

export const NURTURE_INTENT =
  "Send a genuine value email — one useful insight, tip, update, or observation about the Ontario rental market or London landlord landscape. Do not pitch. Keep it short (150 words max). Make it feel like a note from a knowledgeable friend, not a newsletter.";

/**
 * Generate a personalized email for a sequence step using Claude.
 * Falls back to a generic subject/body if Claude fails — the cron will still send.
 */
export async function generatePersonalizedEmail(
  contact: ContactContext,
  hubspotNotes: string,
  sequenceIndex: number,
  isNurture = false,
): Promise<{ subject: string; html: string }> {
  const typeLabel = CONTACT_TYPE_LABELS[contact.contactType] ?? contact.contactType;
  const intents = SEQUENCE_INTENTS[contact.contactType];
  const intent = isNurture
    ? NURTURE_INTENT
    : (intents?.[sequenceIndex] ?? "Follow up with genuine value, no pitch");

  const nurtureSubjectHint = isNurture
    ? NURTURE_SUBJECTS[sequenceIndex % NURTURE_SUBJECTS.length]
    : null;

  const firstName = (contact.name || "").trim().split(" ")[0] || "";

  const systemPrompt = `You are Ebin Jaison, founder of Prospera Properties — a property management company in London, Ontario (Canada) that manages residential rentals across London, St. Thomas, and Strathroy.

You are writing a personal email to ${firstName || "this person"}, who is a ${typeLabel}.

Your writing style:
- Direct, warm, confident — never salesy or pushy
- Short paragraphs, plain language
- Never use: amazing, revolutionary, seamless, game-changing, excited, thrilled, leverage, synergy, unlock, empower, robust, scalable
- One idea per email, one CTA (or none — sometimes a good email just ends)
- Sign off with just "Ebin" on its own line — nothing before it, no "Best," no "Warm regards"
- Write in first-person singular (I, me, my)
- Maximum 220 words in the body — shorter is better
- Never invent facts, stats, or stories not grounded in the notes provided

About Prospera Properties:
- Full-service property management in southwestern Ontario
- Handles: tenant screening, leasing, rent collection, maintenance coordination, LTB compliance, owner reporting
- Ebin's contact: ebin@prosperaproperties.co / prosperaproperties.co`;

  const userPrompt = `Write email #${isNurture ? "nurture" : sequenceIndex + 1} to ${firstName || "this contact"}.

Intent: ${intent}
${nurtureSubjectHint ? `\nSubject hint (you can adapt this): "${nurtureSubjectHint}"` : ""}

${hubspotNotes?.trim() ? `Notes from my conversations with ${firstName || "them"}:\n---\n${hubspotNotes.trim()}\n---\n\nIf there is something specific in these notes, reference it naturally. Don't be generic.` : "No prior notes — write a warm but general email that fits the intent."}

Rules:
- Accomplish the stated intent naturally — don't announce what the email is doing
- If including a CTA, make it low-pressure (reply to this email, or visit a link)
- Output ONLY valid JSON, no markdown fences, no explanation

Output:
{
  "subject": "subject line — personal, not newsletter-like",
  "body_text": "email body — use \\n\\n between paragraphs, max 220 words"
}`;

  try {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "").trim();
    const parsed = JSON.parse(cleaned) as { subject: string; body_text: string };

    return {
      subject: parsed.subject,
      html: buildEmailHtml(parsed.body_text, contact.email),
    };
  } catch (err) {
    console.error("[crm-ai] generatePersonalizedEmail failed:", err);
    // Fallback — generic subject/body so the cron doesn't error out
    const fallbackSubject = isNurture ? "A quick note from Ebin" : `Following up, ${firstName || ""}`.trim();
    const fallbackBody = `Hi ${firstName || "there"},\n\nJust wanted to check in. If you have any questions about property management in Ontario, feel free to reply to this email — I read everything.\n\nEbin`;
    return {
      subject: fallbackSubject,
      html: buildEmailHtml(fallbackBody, contact.email),
    };
  }
}

/**
 * Convert plain text email body to HTML email template.
 */
function buildEmailHtml(bodyText: string, recipientEmail: string): string {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, "<br>").trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p style="margin:0 0 18px 0;line-height:1.65;color:#222222;">${p}</p>`)
    .join("\n");

  const unsubEmail = encodeURIComponent(recipientEmail);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Prospera Properties</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f5f5f4;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;background:#ffffff;border-radius:6px;overflow:hidden;">
      <tr>
        <td style="background:#1F2F3A;padding:18px 32px;">
          <p style="margin:0;color:#FAF8F5;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Prospera Properties</p>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 32px 24px;font-size:15px;">
          ${paragraphs}
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px 28px;border-top:1px solid #eeeeee;">
          <p style="margin:20px 0 0;font-size:11px;color:#aaaaaa;line-height:1.6;">
            Prospera Properties · London, Ontario ·
            <a href="https://www.prosperaproperties.co" style="color:#8B2030;text-decoration:none;">prosperaproperties.co</a><br>
            <a href="https://www.prosperaproperties.co/unsubscribe?email=${unsubEmail}" style="color:#aaaaaa;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}
