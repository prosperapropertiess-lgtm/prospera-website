/**
 * SEO Friday Optimizer — runs every Friday at noon UTC (8am EST)
 *
 * Optimization-only run: no new post written.
 * Picks 2 weak existing posts and improves them — title, meta, content depth, FAQs, internal links.
 * Designed to compound gains on existing content without publishing new posts.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getFileFromGitHub, pushFilesToGitHub } from "@/lib/github";
import { submitUrlToGoogle } from "@/lib/google-indexing";
import { querySearchAnalytics } from "@/lib/google-search-console";

function getAnthropic() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }); }

const SITE_URL = "https://www.prosperaproperties.co/";
const BLOG_PREFIX = `${SITE_URL}blog/`;

const OPTIMIZER_SYSTEM = `
You are the SEO Content Optimizer for Prospera Properties — a property management company in London, St. Thomas, and Strathroy, Ontario.

YOUR JOB: Take an existing blog post and make it significantly better — higher CTR, stronger topical depth, better conversion, more internal links, and optimized for featured snippets.

WHAT TO IMPROVE:
1. TITLE — rewrite for higher CTR. Use numbers, specificity, power words. Keep "Ontario" where natural. Must include primary keyword. Max 60 chars ideal.
2. EXCERPT — rewrite for higher CTR in search results. 130–155 chars. Lead with the pain or value. Include primary keyword naturally.
3. INTRO (first 2–3 paragraphs) — strengthen the hook. Lead with a specific pain point or surprising fact. Cut throat-clearing. Get to the value immediately.
4. H2 HEADINGS — make every H2 more specific and search-friendly. H2s should answer real questions people search for.
5. CONTENT DEPTH — expand any thin sections. Add specific Ontario examples, RTA references, dollar amounts, timelines, or step numbers where missing.
6. FAQ SECTION — add a "Frequently Asked Questions" section at the END of the post body (before the CTA paragraph), with 4–6 Q&A pairs. Format:
   ## Frequently Asked Questions
   **Q: Question here?**
   A: Answer here. 2–4 sentences, specific and practical.
7. INTERNAL LINKS — add 2–3 more contextual internal links to related posts (format: [anchor text](/blog/slug)). Use slugs from the provided list. Only link to genuinely relevant posts.
8. EXTERNAL LINKS — add 1–2 external authority links if missing. Link to ontario.ca, tribunalsontario.ca/ltb, CMHC, or Statistics Canada pages that are directly relevant.
9. CTA — ensure the closing paragraph mentions Prospera Properties serves London, St. Thomas, and Strathroy.

RULES:
- Keep the slug IDENTICAL — never change it
- Keep the date field as-is or update to today if content is significantly refreshed
- Keep the category and featuredImage as-is unless clearly wrong
- Preserve all existing internal links (add more, don't remove existing ones)
- Do NOT add placeholder text or notes like "[add example here]"
- Write in the same voice: direct, practical, expert, no fluff
- The output must be the COMPLETE file — frontmatter + full body

OUTPUT FORMAT — output EXACTLY this structure:

===OPTIMIZED===
---
title: "..."
date: "YYYY-MM-DD"
slug: "..."
excerpt: "..."
category: "..."
readTime: "... min read"
featuredImage: "https://..."
---

[full optimized markdown post]
===END===

===CHANGES===
- [bullet list of specific changes made — title rewrite, new sections added, links added, etc.]
===END===
`;

function parseOptimizerOutput(raw: string): { content: string; changes: string[] } | null {
  const contentMatch = raw.match(/===OPTIMIZED===\n([\s\S]*?)===END===/);
  const changesMatch = raw.match(/===CHANGES===\n([\s\S]*?)===END===/);
  if (!contentMatch) return null;
  const changes = changesMatch
    ? changesMatch[1].trim().split("\n").filter((l) => l.startsWith("-")).map((l) => l.replace(/^-\s*/, ""))
    : [];
  return { content: contentMatch[1].trimEnd(), changes };
}

function extractSlugs(brain: string): string[] {
  return (brain.match(/- ([\w-]+) ✅/g) ?? [])
    .map((m) => m.replace("- ", "").replace(" ✅", "").trim());
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  // ── 1. Read SEO brain + GSC data ─────────────────────────────────────────
  const [seoBrain, gscData] = await Promise.all([
    getFileFromGitHub("content/seo-brain.md"),
    querySearchAnalytics({
      siteUrl: SITE_URL,
      startDate: daysAgo(28),
      endDate: today,
      dimensions: ["page"],
      rowLimit: 50,
      dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "contains", expression: "/blog/" }] }],
    }).catch(() => null),
  ]);

  if (!seoBrain) {
    return NextResponse.json({ error: "Could not read seo-brain.md" }, { status: 500 });
  }

  const allSlugs = extractSlugs(seoBrain);

  // ── 2. Pick 2 posts to optimize ──────────────────────────────────────────
  const targets: { slug: string; reason: string }[] = [];

  if (gscData?.rows && gscData.rows.length >= 3) {
    // Target 1: high impressions, low CTR (title/meta opportunity)
    const lowCtr = gscData.rows
      .map((r) => ({
        slug: r.keys[0].replace(BLOG_PREFIX, ""),
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      }))
      .filter((r) => r.impressions >= 50 && r.ctr < 0.04)
      .sort((a, b) => b.impressions - a.impressions);

    if (lowCtr[0]) targets.push({ slug: lowCtr[0].slug, reason: `${lowCtr[0].impressions} impressions, ${(lowCtr[0].ctr * 100).toFixed(1)}% CTR — title/meta opportunity` });

    // Target 2: low ranking, decent impressions (content depth opportunity)
    const lowRanking = gscData.rows
      .map((r) => ({ slug: r.keys[0].replace(BLOG_PREFIX, ""), impressions: r.impressions, position: r.position }))
      .filter((r) => r.impressions >= 20 && r.position > 10 && r.slug !== targets[0]?.slug)
      .sort((a, b) => b.position - a.position);

    if (lowRanking[0]) targets.push({ slug: lowRanking[0].slug, reason: `position #${lowRanking[0].position.toFixed(0)} — content depth opportunity` });
  }

  // Fallback: deterministic rotation if GSC data insufficient
  if (targets.length < 2) {
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const already = targets.map((t) => t.slug);
    const eligible = allSlugs.filter((s) => !already.includes(s));
    for (let i = 0; i < 2 - targets.length; i++) {
      const slug = eligible[(weekNum + i) % eligible.length];
      if (slug) targets.push({ slug, reason: "deterministic rotation (no GSC signal)" });
    }
  }

  if (targets.length === 0) {
    return NextResponse.json({ error: "No posts to optimize" }, { status: 500 });
  }

  // ── 3. Optimize each target ──────────────────────────────────────────────
  const filesToPush: { path: string; content: string }[] = [];
  const results: { slug: string; title: string; reason: string; changes: string[] }[] = [];

  for (const target of targets) {
    const originalContent = await getFileFromGitHub(`content/blog/${target.slug}.md`);
    if (!originalContent) continue;

    try {
      const otherSlugs = allSlugs.filter((s) => s !== target.slug);
      const optResponse = await getAnthropic().messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10000,
        system: OPTIMIZER_SYSTEM,
        messages: [{
          role: "user",
          content: `Today's date: ${today}
Optimization target: ${target.slug}
Reason selected: ${target.reason}

All existing blog post slugs (for internal links):
${otherSlugs.join(", ")}

Here is the current post content to optimize:

${originalContent}

Optimize this post following all instructions. Output the complete improved file.`,
        }],
      });

      const optRaw = optResponse.content[0].type === "text" ? optResponse.content[0].text : "";
      const optimized = parseOptimizerOutput(optRaw);

      if (optimized) {
        const slugCheck = optimized.content.match(/^slug:\s*"(.+)"/m);
        if (!slugCheck || slugCheck[1] === target.slug) {
          const titleM = optimized.content.match(/^title:\s*"(.+)"/m);
          filesToPush.push({ path: `content/blog/${target.slug}.md`, content: optimized.content });
          results.push({ slug: target.slug, title: titleM?.[1] ?? target.slug, reason: target.reason, changes: optimized.changes });
          console.log(`[seo-optimizer] Done: ${target.slug}`);
        }
      }
    } catch (err) {
      console.error(`[seo-optimizer] Error on ${target.slug}:`, err);
    }
  }

  if (filesToPush.length === 0) {
    return NextResponse.json({ error: "All optimizations failed" }, { status: 500 });
  }

  // ── 4. Single GitHub commit ──────────────────────────────────────────────
  const commitMsg = [
    `SEO Friday: optimize ${results.map((r) => r.slug).join(", ")} [SEO Optimizer]`,
    ``,
    ...results.map((r) => `Optimized: ${r.slug} — ${r.reason}`),
    ``,
    `Co-Authored-By: Prospera SEO Agent <agent@prosperaproperties.co>`,
  ].join("\n");

  const pushResult = await pushFilesToGitHub(filesToPush, commitMsg);
  if (!pushResult.success) {
    return NextResponse.json({ error: "GitHub push failed", detail: pushResult.error }, { status: 500 });
  }

  // ── 5. Vercel rebuild + Google indexing pings ────────────────────────────
  await Promise.all([
    fetch("https://api.vercel.com/v1/integrations/deploy/prj_BepoLv37pz2jz2RiQDryRAyyJcmS/0PL9bLgRJf", { method: "POST" }).catch(() => {}),
    ...results.map((r) => submitUrlToGoogle(`${SITE_URL}blog/${r.slug}`)),
  ]);

  // ── 6. Email summary ─────────────────────────────────────────────────────
  const notifySecret = process.env.SEO_NOTIFY_SECRET;
  if (notifySecret && results.length > 0) {
    try {
      const cards = results.map((r) => {
        const changeList = r.changes.map((c) => `<li style="margin-bottom:6px;font-size:13px;color:#5A5A5A;">${c}</li>`).join("");
        return `
          <div style="margin-bottom:32px;padding-bottom:32px;border-bottom:1px solid #E5E5E5;">
            <p style="font-size:16px;font-weight:500;color:#1F2F3A;margin:0 0 4px;">${r.title}</p>
            <p style="font-size:12px;color:#9B9B9B;margin:0 0 16px;">Reason: ${r.reason}</p>
            <ul style="padding-left:20px;margin:0 0 12px;">${changeList}</ul>
            <a href="${SITE_URL}blog/${r.slug}" style="font-size:11px;color:#8B2030;text-decoration:none;letter-spacing:1px;text-transform:uppercase;">View Post →</a>
          </div>`;
      }).join("");

      const html = `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2C2C2C;">
          <div style="background:#1F2F3A;padding:28px 32px;">
            <p style="color:#8B2030;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">Prospera SEO — Friday Optimization</p>
            <h1 style="color:#FAF8F5;font-size:22px;font-weight:300;margin:0;">${results.length} posts optimized</h1>
          </div>
          <div style="padding:32px;">${cards}</div>
        </div>`;

      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Prospera SEO Agent <hello@prosperaproperties.co>",
        to: "prosperapropertiess@gmail.com",
        subject: `Friday SEO: ${results.length} posts optimized — Prospera`,
        html,
      });
    } catch (err) {
      console.error("[seo-optimizer] Email failed:", err);
    }
  }

  return NextResponse.json({
    success: true,
    optimized: results.map((r) => ({ slug: r.slug, title: r.title, reason: r.reason, changes: r.changes })),
    commitUrl: pushResult.commitUrl,
  });
}
