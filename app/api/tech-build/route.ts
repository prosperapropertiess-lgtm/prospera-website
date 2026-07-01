import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { waitUntil } from "@vercel/functions";
import { getSupabaseAdmin } from "@/lib/supabase";
import { pushFilesToGitHub, type FileChange } from "@/lib/github";

export const maxDuration = 120;

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }

const PLATFORM_CONTEXT = `
You are a senior Next.js engineer building features for Prospera — a proptech platform for Ontario landlords.
Working directory (repo root): /Users/jaizonebin/prospera-website (do NOT include this in file paths)

TECH STACK:
- Next.js 16, App Router, TypeScript
- Tailwind CSS v4
- Framer Motion (animations)
- Supabase: import { getSupabaseAdmin } from "@/lib/supabase" for server, { getSupabase } for client
- Resend: import dynamically — const { Resend } = await import("resend")
- Anthropic: import Anthropic from "@anthropic-ai/sdk"
- Rate limiting: import { rateLimit, getClientIp } from "@/lib/rate-limit"

FILE STRUCTURE:
- Pages: app/PAGE_NAME/page.tsx
- API routes: app/api/ROUTE_NAME/route.ts
- Components: components/ui/, components/layout/, components/animations/
- Lib helpers: lib/

DESIGN SYSTEM — MANDATORY, NEVER DEVIATE:
- Navy #1F2F3A — navbar, footer, headings, dark sections, buttons (secondary)
- Burgundy #8B2030 — PRIMARY CTA BUTTONS ONLY (never labels, dots, decorative lines)
- Background #F7F5F2 — warm cream (page/section bg)
- White #FFFFFF — cards, modals, forms
- Border #D8D2C8 — all borders and dividers
- Text: #222222 primary / #444444 secondary / #999999 muted
- Light on dark: #FAF8F5
- Font headings: var(--font-cormorant)  — Outfit
- Font body: var(--font-dm-sans) — Inter
- Section padding: py-24 standard, py-20 compact. px-5 sm:px-8 every section
- Max widths: max-w-5xl wide / max-w-4xl standard / max-w-3xl narrow
- Animations: use FadeIn from "@/components/animations/FadeIn" for scroll reveals
- One primary action per section — secondary = text link only

SUPABASE PATTERNS:
- Server routes: always use getSupabaseAdmin() — never getSupabase() in API routes
- Client components: use getSupabase()
- Always handle errors, never throw unhandled in API routes

OUTPUT FORMAT — CRITICAL:
You MUST output ONLY the implementation using this exact format. No prose, no explanation outside this structure:

===FILE:relative/path/to/file.tsx===
[complete file content — production ready, no placeholders, no TODOs]
===END===

===FILE:another/path/file.ts===
[complete file content]
===END===

===SQL===
[SQL to run in Supabase — only if new tables/columns needed. Use IF NOT EXISTS. Or write NONE if no SQL needed.]
===END===

Rules:
- Every file must be complete and production-ready. No "// implement later", no placeholder functions.
- Paths are relative to repo root. Correct: app/api/foo/route.ts. Wrong: /app/api/foo/route.ts
- If modifying an existing file, output the COMPLETE new file (not a diff)
- Mobile-first, responsive. Run mentally through the logic — make sure it works.
- If adding a new page that needs a link from somewhere, include the updated file that adds the link.
`;

// ── Parse Claude's structured output into files ─────────────────────────────
function parseImplementation(raw: string): { files: FileChange[]; sql: string | null } {
  const files: FileChange[] = [];
  const fileRegex = /===FILE:([^\n=]+)===\n([\s\S]*?)===END===/g;
  let match;
  while ((match = fileRegex.exec(raw)) !== null) {
    const path = match[1].trim();
    const content = match[2].trimEnd();
    if (path && content) files.push({ path, content });
  }

  const sqlMatch = raw.match(/===SQL===\n([\s\S]*?)===END===/);
  const sql = sqlMatch ? sqlMatch[1].trim() : null;
  const noSql = !sql || sql.toUpperCase() === "NONE" || sql === "";

  return { files, sql: noSql ? null : sql };
}

// ── Generate code with Claude, continuing if output is truncated ─────────────
async function generateImplementation(proposal: Record<string, string>, steps: string[]): Promise<string> {
  const userPrompt = `Implement this feature for Prospera.

FEATURE: ${proposal.title}
DESCRIPTION: ${proposal.description}
WHY: ${proposal.why}
TARGET USERS: ${proposal.target_users}
EFFORT: ${proposal.effort}

IMPLEMENTATION STEPS:
${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

${proposal.performance_notes ? `PERFORMANCE NOTES: ${proposal.performance_notes}` : ""}

Generate the complete implementation. Output every file needed using the ===FILE:=== format.
Include SQL only if new tables or columns are required.
Think about data that should be logged for future intelligence — this platform compounds with data.
Build for 10,000 users, not 10.`;

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userPrompt },
  ];

  let fullOutput = "";
  let iterations = 0;
  const MAX_ITERATIONS = 3; // prevent runaway loops

  while (iterations < MAX_ITERATIONS) {
    const response = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      system: PLATFORM_CONTEXT,
      messages,
    });

    const chunk = response.content[0].type === "text" ? response.content[0].text : "";
    fullOutput += chunk;
    iterations++;

    // If Claude didn't hit the token limit, we're done
    if (response.stop_reason !== "max_tokens") break;

    // Output was truncated — continue from where it left off
    console.log(`[tech-build] Output truncated (iteration ${iterations}), continuing...`);
    messages.push({ role: "assistant", content: chunk });
    messages.push({ role: "user", content: "Continue exactly where you left off. Do not repeat anything already written." });
  }

  return fullOutput;
}

// ── Trigger the next proposal to keep the build loop running ─────────────────
async function triggerNextProposal() {
  const supabase = getSupabaseAdmin();

  // Check if there's already a pending or approved proposal waiting
  const { count: pendingCount } = await supabase
    .from("tech_proposals")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "approved"]);

  if ((pendingCount ?? 0) > 0) {
    // Queue is not empty — Ebin already has something to review or approve
    console.log("[tech-build] Next proposal already in queue, skipping auto-propose.");
    return;
  }

  // Queue is empty — trigger a new proposal immediately
  const base = "https://www.prosperaproperties.co";
  try {
    await fetch(`${base}/api/cron/cto-weekly`, {
      method: "GET",
      headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
    });
    console.log("[tech-build] Auto-triggered next proposal.");
  } catch (err) {
    console.error("[tech-build] Failed to trigger next proposal:", err);
  }
}

// ── The full autonomous build pipeline ──────────────────────────────────────
async function runAutonomousBuild(proposalId: string) {
  const supabase = getSupabaseAdmin();

  const { data: proposal } = await supabase
    .from("tech_proposals")
    .select("*")
    .eq("id", proposalId)
    .maybeSingle();

  if (!proposal) {
    console.error("[tech-build] Proposal not found:", proposalId);
    return;
  }

  const steps: string[] = JSON.parse(proposal.steps || "[]");
  const resendKey = process.env.RESEND_API_KEY;

  const sendEmail = async (subject: string, html: string) => {
    if (!resendKey) return;
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "Prospera CTO Agent <hello@prosperaproperties.co>",
      to: "prosperapropertiess@gmail.com",
      subject,
      html,
    }).catch(() => {});
  };

  // ── Step 1: Notify Ebin that building has started ─────────────────────────
  await sendEmail(
    `[CTO] Building now — ${proposal.title}`,
    `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#1F2F3A;padding:28px 32px;">
        <p style="color:#8B2030;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;font-weight:600;">Prospera CTO Agent</p>
        <h1 style="color:#FAF8F5;font-size:22px;font-weight:300;margin:0;">Building now ⟳</h1>
      </div>
      <div style="padding:28px 32px;background:white;border:1px solid #E8E4DF;border-top:none;">
        <h2 style="font-size:16px;color:#1F2F3A;margin:0 0 12px;">${proposal.title}</h2>
        <p style="font-size:14px;color:#5A5A5A;line-height:1.7;margin:0 0 16px;">
          The CTO agent is generating the implementation and pushing it to GitHub.
          Vercel will deploy automatically. You'll get another email when it's live.
        </p>
        <p style="font-size:12px;color:#999;margin:0;">No action needed — sit back.</p>
      </div>
    </div>`
  );

  // ── Step 2: Claude generates the full implementation ─────────────────────
  let raw = "";
  try {
    raw = await generateImplementation(proposal, steps);
  } catch (err) {
    console.error("[tech-build] Claude error:", err);
    await supabase.from("tech_proposals").update({ status: "approved" }).eq("id", proposalId);
    await sendEmail(
      `[CTO] Build failed — ${proposal.title}`,
      `<p style="font-family:sans-serif;color:#8B2030;">Claude API error: ${String(err)}</p>`
    );
    return;
  }

  // ── Step 3: Parse files from Claude's output ─────────────────────────────
  const { files, sql } = parseImplementation(raw);

  if (files.length === 0) {
    console.error("[tech-build] No files parsed from Claude output");
    await supabase.from("tech_proposals").update({
      status: "approved",
      implementation_notes: raw,
    }).eq("id", proposalId);
    await sendEmail(
      `[CTO] Build needs manual review — ${proposal.title}`,
      `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <p style="color:#8B2030;font-weight:600;">The build agent couldn't parse files from Claude's output.</p>
        <p>Manual implementation needed. Raw output stored in the database.</p>
        <pre style="background:#f5f5f5;padding:16px;font-size:12px;overflow:auto;">${raw.substring(0, 2000)}</pre>
      </div>`
    );
    return;
  }

  // ── Step 4: Push to GitHub ────────────────────────────────────────────────
  const commitMsg = `feat: ${proposal.title} [CTO Agent]\n\n${proposal.description}\n\nCo-Authored-By: Prospera CTO Agent <agent@prosperaproperties.co>`;
  const pushResult = await pushFilesToGitHub(files, commitMsg);

  if (!pushResult.success) {
    console.error("[tech-build] GitHub push failed:", pushResult.error);
    await supabase.from("tech_proposals").update({
      status: "approved",
      implementation_notes: raw,
    }).eq("id", proposalId);
    await sendEmail(
      `[CTO] GitHub push failed — ${proposal.title}`,
      `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <p style="color:#8B2030;font-weight:600;">Could not push to GitHub.</p>
        <p style="color:#444;">Error: ${pushResult.error}</p>
        <p style="color:#999;font-size:12px;">Check GITHUB_TOKEN and GITHUB_REPO env vars on Vercel.</p>
      </div>`
    );
    return;
  }

  // ── Step 5: Mark as implemented ──────────────────────────────────────────
  await supabase.from("tech_proposals").update({
    status: "implemented",
    implemented_at: new Date().toISOString(),
    implementation_notes: `Pushed ${files.length} file(s) to GitHub. Commit: ${pushResult.commitSha}`,
  }).eq("id", proposalId);

  // ── Step 6: Ship confirmation email ──────────────────────────────────────
  const fileList = files.map(f =>
    `<tr><td style="padding:6px 0;border-bottom:1px solid #F0EBE5;font-size:12px;font-family:monospace;color:#1F2F3A;">${f.path}</td></tr>`
  ).join("");

  const sqlBlock = sql ? `
    <div style="margin-top:20px;">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#B7791F;font-weight:600;margin:0 0 8px;">SQL to run in Supabase</p>
      <pre style="background:#FFFBEB;border:1px solid #F6E05E;padding:14px;font-size:12px;color:#744210;border-radius:4px;overflow:auto;white-space:pre-wrap;">${sql}</pre>
    </div>` : "";

  await sendEmail(
    `[CTO] Shipped ✓ — ${proposal.title}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1F2F3A;padding:28px 32px;">
        <p style="color:#8B2030;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;font-weight:600;">Prospera CTO Agent</p>
        <h1 style="color:#FAF8F5;font-size:22px;font-weight:300;margin:0;">Shipped and deploying ✓</h1>
      </div>
      <div style="padding:28px 32px;background:white;border:1px solid #E8E4DF;border-top:none;">
        <h2 style="font-size:16px;color:#1F2F3A;margin:0 0 8px;font-weight:600;">${proposal.title}</h2>
        <p style="font-size:13px;color:#5A5A5A;line-height:1.7;margin:0 0 20px;">${proposal.description}</p>

        <div style="background:#F0FFF4;border:1px solid #9AE6B4;padding:14px 16px;border-radius:4px;margin-bottom:20px;">
          <p style="font-size:13px;color:#2D6A4F;margin:0;font-weight:500;">
            Pushed to GitHub · Vercel is deploying now · Site will update in ~60 seconds
          </p>
        </div>

        <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#1F2F3A;font-weight:600;margin:0 0 10px;">${files.length} file${files.length > 1 ? "s" : ""} changed</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">${fileList}</table>

        ${sqlBlock}

        <div style="border-top:1px solid #E8E4DF;padding-top:20px;margin-top:4px;">
          <a href="https://www.prosperaproperties.co" style="display:inline-block;padding:12px 28px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;margin-right:12px;">
            View Site →
          </a>
          <a href="${pushResult.commitUrl}" style="display:inline-block;padding:12px 20px;border:1px solid #D8D2C8;color:#444;text-decoration:none;font-size:11px;letter-spacing:1px;text-transform:uppercase;">
            View Commit
          </a>
        </div>

        <p style="font-size:11px;color:#999;margin:20px 0 0;">
          The CTO agent is queuing the next proposal. The build loop continues.
        </p>
      </div>
    </div>`
  );

  console.log(`[tech-build] Shipped: ${proposal.title} | ${files.length} files | ${pushResult.commitUrl}`);

  // ── Step 7: Keep the loop running — trigger next proposal ────────────────
  // If no pending/approved proposals exist, auto-propose the next feature.
  // This keeps Prospera building continuously without waiting for Monday's cron.
  await triggerNextProposal();
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-notify-secret");
  if (secret !== process.env.SEO_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { proposalId } = await req.json();
  if (!proposalId) {
    return NextResponse.json({ error: "proposalId required" }, { status: 400 });
  }

  // Mark as building immediately so duplicate triggers are ignored
  const supabase = getSupabaseAdmin();
  await supabase.from("tech_proposals").update({ status: "building" }).eq("id", proposalId);

  // Return 202 immediately — build runs in background via waitUntil
  waitUntil(runAutonomousBuild(proposalId));

  return NextResponse.json({ accepted: true, proposalId }, { status: 202 });
}
