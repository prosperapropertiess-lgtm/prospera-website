import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PLATFORM_CONTEXT = `
PLATFORM: Prospera Properties website — Next.js 16 App Router, Tailwind CSS v4, Framer Motion, Supabase, Resend, Anthropic Claude API, Vercel.
Working directory: /Users/jaizonebin/prospera-website

FILE STRUCTURE:
- /app/ — Next.js pages (page.tsx, layout.tsx) and API routes (api/**/route.ts)
- /components/ — React components
  - /components/layout/ — Navbar.tsx, Footer.tsx, SiteShell.tsx
  - /components/ui/ — ChatWidget, NewsletterPopup, FAQAccordion, RentEstimator, etc.
  - /components/animations/ — FadeIn.tsx, CounterAnimation.tsx
  - /components/blog/ — BlogSubscribeForm, ShareButtons
  - /components/listings/ — PropertyDetailClient
  - /components/admin/ — PropertyForm
- /lib/ — supabase.ts, emails.ts, blog.ts, rent-intelligence.ts, zoho.ts, rate-limit.ts
- /content/blog/ — markdown blog posts

SUPABASE HELPERS:
- getSupabaseAdmin() — server-side, bypasses RLS
- getSupabase() — client-side anon
- Both from "@/lib/supabase"

DESIGN SYSTEM (MANDATORY — never deviate):
- Navy #1F2F3A — navbar, footer, headings, dark sections
- Burgundy #8B2030 — PRIMARY BUTTONS ONLY + one accent per section max
- Background #F7F5F2 — page/section background
- White #FFFFFF — cards, modals, forms
- Border #D8D2C8 — all borders and dividers
- Text: #222222 primary, #444444 secondary, #999999 muted/labels
- Light on dark: #FAF8F5
- Font heading: var(--font-cormorant) — Outfit
- Font body: var(--font-dm-sans) — Inter
- Section padding: py-24 standard, py-20 compact
- Max widths: max-w-5xl wide, max-w-4xl standard, max-w-3xl narrow
- Horizontal: px-5 sm:px-8 on every section

RULES:
- Burgundy NEVER on labels, dots, or decorative lines
- One primary action per section — secondary = text link only
- No abstract icons — use numbers or remove
- No text-xs for content — min text-sm
- Always mobile-first responsive
- Use FadeIn from "@/components/animations/FadeIn" for scroll reveals
- Use framer-motion for any animation
- Supabase types: use existing table names (leads, subscribers, properties, rent_submissions, etc.)
- API routes: always check auth for admin routes, use rate-limit.ts for public AI routes
`;

export async function POST(req: NextRequest) {
  // Only callable from tech-decision (internal) or with agent secret
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.SEO_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { proposalId } = await req.json();
  if (!proposalId) {
    return NextResponse.json({ error: "proposalId required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch the approved proposal
  const { data: proposal, error: fetchErr } = await supabase
    .from("tech_proposals")
    .select("*")
    .eq("id", proposalId)
    .maybeSingle();

  if (fetchErr || !proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  // Mark as building
  await supabase.from("tech_proposals").update({ status: "building" }).eq("id", proposalId);

  const steps: string[] = JSON.parse(proposal.steps || "[]");

  try {
    // ── Claude Sonnet generates a complete, ready-to-run Claude Code prompt ──
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: PLATFORM_CONTEXT,
      messages: [
        {
          role: "user",
          content: `Generate a complete, production-ready Claude Code implementation prompt for this feature.

FEATURE: ${proposal.title}
DESCRIPTION: ${proposal.description}
WHY: ${proposal.why}
TARGET USERS: ${proposal.target_users}
IMPLEMENTATION STEPS:
${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}
EFFORT: ${proposal.effort}
${proposal.performance_notes ? `PERFORMANCE NOTES: ${proposal.performance_notes}` : ""}

Write a single, complete Claude Code prompt that Ebin can copy and paste directly into Claude Code CLI to implement this feature. The prompt must:
1. Start with: "Build the following feature for the Prospera Properties website at /Users/jaizonebin/prospera-website"
2. Include all design system rules relevant to this feature
3. Specify exact file paths to create or modify
4. Include any Supabase table changes needed (as SQL or schema description)
5. Be specific enough that Claude Code can implement it without asking questions
6. End with: "Follow CLAUDE.md rules. Maintain the existing code style. Run 'npm run build' to verify before marking complete."

Write ONLY the prompt — no preamble, no explanation outside the prompt.`,
        },
      ],
    });

    const claudeCodePrompt = response.content[0].type === "text" ? response.content[0].text : "";

    // ── Store the implementation prompt in the proposal record ──────────────
    await supabase
      .from("tech_proposals")
      .update({ implementation_notes: claudeCodePrompt })
      .eq("id", proposalId);

    // ── Email the implementation prompt to Ebin ───────────────────────────
    const base = "https://www.prosperaproperties.co";
    const markShippedUrl = `${base}/api/tech-shipped?id=${proposalId}&token=${proposal.approval_token ?? process.env.SEO_NOTIFY_SECRET}`;

    const promptHtml = claudeCodePrompt
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    const html = `
      <div style="font-family:sans-serif;max-width:680px;margin:0 auto;color:#2C2C2C;background:#FAF8F5;">

        <div style="background:#1F2F3A;padding:32px 36px;">
          <p style="color:#8B2030;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 8px;font-weight:600;">Prospera CTO Agent · Build Ready</p>
          <h1 style="color:#FAF8F5;font-size:24px;font-weight:300;margin:0;line-height:1.3;">${proposal.title}</h1>
          <p style="color:rgba(250,248,245,0.55);font-size:13px;margin:8px 0 0;">Your approved feature is ready to ship.</p>
        </div>

        <div style="padding:32px 36px;background:white;border-left:1px solid #E8E4DF;border-right:1px solid #E8E4DF;">

          <div style="margin-bottom:28px;">
            <p style="font-size:14px;color:#2C2C2C;line-height:1.7;margin:0 0 20px;">${proposal.description}</p>
            <div style="background:#F7F5F2;border:1px solid #D8D2C8;padding:16px 20px;border-radius:4px;">
              <p style="font-size:11px;font-weight:600;color:#1F2F3A;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">To deploy this feature:</p>
              <ol style="margin:0;padding-left:20px;font-size:13px;color:#444;line-height:1.9;">
                <li>Open Terminal in <code style="background:#E8E4DF;padding:1px 5px;border-radius:2px;">/Users/jaizonebin/prospera-website</code></li>
                <li>Open Claude Code: <code style="background:#E8E4DF;padding:1px 5px;border-radius:2px;">claude</code></li>
                <li>Copy the prompt below and paste it in</li>
                <li>Review the changes, commit, and push to deploy</li>
                <li>Click "Mark as shipped" below when done</li>
              </ol>
            </div>
          </div>

          <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <p style="font-size:10px;font-weight:600;color:#1F2F3A;text-transform:uppercase;letter-spacing:2px;margin:0;">Claude Code Prompt — Copy &amp; Paste</p>
              <span style="font-size:11px;color:#999;border:1px solid #D8D2C8;padding:2px 8px;border-radius:20px;">Effort: ${proposal.effort}</span>
            </div>
            <div style="background:#1F2F3A;border-radius:6px;padding:24px;overflow:auto;">
              <pre style="color:#FAF8F5;font-size:12px;line-height:1.7;margin:0;white-space:pre-wrap;font-family:monospace;">${promptHtml}</pre>
            </div>
          </div>

          <div style="border-top:2px solid #1F2F3A;padding-top:24px;display:flex;gap:12px;align-items:center;">
            <a href="${markShippedUrl}" style="display:inline-block;padding:14px 32px;background:#8B2030;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">
              ✓ Mark as Shipped
            </a>
            <p style="font-size:12px;color:#999;margin:0;">Click after deploying to update the dashboard.</p>
          </div>
        </div>

        <div style="padding:18px 36px;border:1px solid #E8E4DF;border-top:none;">
          <p style="font-size:11px;color:#B0B0B0;margin:0;">
            Prospera Properties · CTO Agent · prosperaproperties.co<br/>
            This prompt was generated by Claude Sonnet for your approved feature.
          </p>
        </div>
      </div>
    `;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Prospera CTO Agent <hello@prosperaproperties.co>",
        to: "prosperapropertiess@gmail.com",
        subject: `[CTO] Ready to build — ${proposal.title}`,
        html,
      });
    }

    console.log("[tech-build] Build prompt sent for:", proposal.title);
    return NextResponse.json({ success: true, feature: proposal.title });

  } catch (err) {
    console.error("[tech-build] Error:", err);
    // Revert status to approved if build generation failed
    await supabase.from("tech_proposals").update({ status: "approved" }).eq("id", proposalId);
    return NextResponse.json({ error: "Build generation failed", detail: String(err) }, { status: 500 });
  }
}
