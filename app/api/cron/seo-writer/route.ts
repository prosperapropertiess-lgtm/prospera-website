import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getFileFromGitHub, pushFilesToGitHub } from "@/lib/github";
import { submitUrlToGoogle } from "@/lib/google-indexing";
import { querySearchAnalytics } from "@/lib/google-search-console";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SITE_URL = "https://www.prosperaproperties.co/";

// ── SEO Growth Engine system prompt ──────────────────────────────────────────
const SEO_SYSTEM = `
You are the autonomous SEO Growth Engine for Prospera Properties — a property management company in London, St. Thomas, and Strathroy, Ontario.

MISSION: Build a compounding organic traffic flywheel. Every post must:
- Deepen topical authority in Ontario landlord/property management space
- Strengthen the internal link graph
- Target real search intent, not just keywords
- Convert landlord readers into Prospera leads

FLYWHEEL PRINCIPLE:
Each post strengthens existing posts through internal links.
Each post fills a topical gap that makes the whole site more authoritative.
Each post must fit into a cluster — never an isolated island.

AUDIENCE: Independent landlords in Ontario with 1–5 rental properties. They want practical, legally accurate, plain-language guidance. They are not experts.

VOICE: Direct, clear, knowledgeable. Like advice from a property manager who has seen everything. No fluff. No "in conclusion" paragraphs. No corporate speak. No generic AI wording.

CONTENT STRATEGY (in priority order):
1. HIGH PRIORITY missing keywords from the SEO brain
2. Topical gaps — topics that would strengthen existing post clusters
3. Local intent — London, St. Thomas, Strathroy, Ontario specifics
4. High-conversion intent — topics that attract landlords ready to hire a PM

BLOG POST REQUIREMENTS:
- Length: 1600–2200 words (body only, not frontmatter)
- Structure: strong intro (hooks the pain/problem) → H2 sections → practical steps → key takeaways
- Legally accurate for Ontario (reference the Residential Tenancies Act where relevant)
- Include 3–4 internal links to related posts using: [anchor text](/blog/slug)
  - Links must feel natural and contextually relevant
  - Spread links through the post, not all clustered together
  - Use descriptive anchor text (not "click here" or "read more")
- End with a CTA: Prospera Properties manages rentals in London, St. Thomas, and Strathroy
- Every H2 should be a complete thought a reader could search for
- Use numbered lists and bullet points where they add clarity

FRONTMATTER FIELDS (all required):
- title: Full SEO title in quotes — include location or "Ontario" where natural
- date: Today's date in "YYYY-MM-DD" format
- slug: The exact keyword slug (no changes)
- excerpt: 1–2 sentences, 120–155 chars, plain language, includes primary keyword
- category: One of "Landlord Tips" | "Ontario Law" | "Property Management"
- readTime: "X min read" (1600w ≈ 8 min, 2200w ≈ 10 min)
- featuredImage: Pick the most relevant URL:
  - LEGAL/LTB/EVICTION: https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=630&fit=crop&auto=format&q=80
  - MONEY/RENT/COST/TAX: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop&auto=format&q=80
  - HOUSE/PROPERTY/CITY: https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=630&fit=crop&auto=format&q=80
  - MAINTENANCE/REPAIR/TOOLS: https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=630&fit=crop&auto=format&q=80
  - CONTRACT/DOCS/LEGAL/NOTICE: https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop&auto=format&q=80
  - TENANT/SCREENING/PEOPLE: https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=1200&h=630&fit=crop&auto=format&q=80
  - FINANCE/CALCULATOR/INVEST: https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&h=630&fit=crop&auto=format&q=80
  - FILES/RECORDS/PAPERWORK: https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=1200&h=630&fit=crop&auto=format&q=80

KEYWORD PRIORITY:
1. LONG-TAIL ← HIGH PRIORITY items first
2. PAIN ← HIGH PRIORITY items
3. MONEY keywords
4. Any remaining LONG-TAIL
5. Any remaining PAIN
Always pick from "Still missing" sections only.

GSC INTELLIGENCE (if provided):
- If top-ranking posts are provided, write content that SUPPORTS those posts (supporting cluster content)
- If declining posts are provided, avoid cannibalizing their keywords — write adjacent topics instead
- Use performance signals to write smarter, not just more

OUTPUT FORMAT — output EXACTLY this structure, nothing before or after:

===SLUG===
{slug}
===END===

===BLOG===
---
title: "..."
date: "YYYY-MM-DD"
slug: "..."
excerpt: "..."
category: "..."
readTime: "... min read"
featuredImage: "https://..."
---

[full markdown blog post]
===END===

===BRAIN===
[complete updated seo-brain.md — mark new slug ✅, update post count, update Last Updated date]
===END===
`;

// ── Internal linking system prompt ───────────────────────────────────────────
const LINKING_SYSTEM = `
You are an internal linking specialist for Prospera Properties' blog.

Your job: given a newly published blog post, identify 2–3 existing posts that should add a contextual link to the new post.

Rules:
- Only suggest links where there is GENUINE topical relevance
- The link must feel natural — a reader would want to click it
- Use descriptive anchor text, never "click here" or "read more"
- The searchText must be a unique 15–25 word phrase that exists verbatim in that post
- The replaceText must be identical to searchText but with one new sentence appended (ending with the link)
- The new sentence must flow naturally from the preceding text
- Do not suggest the new post linking to itself

OUTPUT FORMAT — return ONLY valid JSON, no other text:
[
  {
    "slug": "existing-post-slug",
    "searchText": "exact 15-25 word phrase from that post that you will add text after",
    "replaceText": "exact same phrase, then a space, then your new sentence with [anchor text](/blog/new-slug) inline."
  }
]

If no genuinely relevant opportunities exist, return an empty array: []
`;

// ── Parse main Claude output ──────────────────────────────────────────────────
function parseOutput(raw: string): { slug: string; blog: string; brain: string } | null {
  const slugMatch  = raw.match(/===SLUG===\n([\s\S]*?)===END===/);
  const blogMatch  = raw.match(/===BLOG===\n([\s\S]*?)===END===/);
  const brainMatch = raw.match(/===BRAIN===\n([\s\S]*?)===END===/);
  if (!slugMatch || !blogMatch || !brainMatch) return null;
  return {
    slug:  slugMatch[1].trim(),
    blog:  blogMatch[1].trimEnd(),
    brain: brainMatch[1].trimEnd(),
  };
}

// ── Extract all published slugs from seo-brain.md ────────────────────────────
function extractSlugs(brain: string): string[] {
  const matches = brain.match(/- ([\w-]+) ✅/g) ?? [];
  return matches.map((m) => m.replace("- ", "").replace(" ✅", "").trim());
}

// ── Format date range helper ──────────────────────────────────────────────────
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

  // ── 1. Read SEO brain ─────────────────────────────────────────────────────
  const seoBrain = await getFileFromGitHub("content/seo-brain.md");
  if (!seoBrain) {
    console.error("[seo-writer] Could not read seo-brain.md");
    return NextResponse.json({ error: "Could not read seo-brain.md" }, { status: 500 });
  }

  const today = new Date().toISOString().split("T")[0];
  const existingSlugs = extractSlugs(seoBrain);

  // ── 2. Fetch GSC performance data (non-blocking) ──────────────────────────
  let gscContext = "";
  try {
    const [topPages, declining] = await Promise.all([
      querySearchAnalytics({
        siteUrl: SITE_URL,
        startDate: daysAgo(28),
        endDate: today,
        dimensions: ["page"],
        rowLimit: 10,
        dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "contains", expression: "/blog/" }] }],
      }),
      querySearchAnalytics({
        siteUrl: SITE_URL,
        startDate: daysAgo(28),
        endDate: today,
        dimensions: ["page"],
        rowLimit: 5,
        dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "contains", expression: "/blog/" }] }],
      }),
    ]);

    if (topPages?.rows?.length) {
      const topList = topPages.rows
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 8)
        .map((r) => {
          const slug = r.keys[0].replace("https://www.prosperaproperties.co/blog/", "");
          return `  - /blog/${slug} — ${r.impressions} impressions, position #${r.position.toFixed(0)}, CTR ${(r.ctr * 100).toFixed(1)}%`;
        })
        .join("\n");

      gscContext = `\nGSC PERFORMANCE DATA (last 28 days):\nTop performing blog posts:\n${topList}\n\nUse this to write supporting content that strengthens these clusters, or avoid cannibalizing topics already ranking well.\n`;
    }
  } catch (err) {
    console.log("[seo-writer] GSC fetch skipped:", err);
  }

  // ── 3. Write the post ─────────────────────────────────────────────────────
  let raw = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: SEO_SYSTEM,
      messages: [{
        role: "user",
        content: `Today's date: ${today}
${gscContext}
SEO Brain document:

${seoBrain}

Pick the highest-priority missing keyword and write the full blog post. Follow the output format exactly.`,
      }],
    });
    raw = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("[seo-writer] Claude write error:", err);
    return NextResponse.json({ error: "Claude API error", detail: String(err) }, { status: 500 });
  }

  const parsed = parseOutput(raw);
  if (!parsed) {
    console.error("[seo-writer] Failed to parse Claude output:", raw.substring(0, 500));
    return NextResponse.json({ error: "Failed to parse Claude output" }, { status: 500 });
  }

  const { slug, blog, brain } = parsed;
  const titleMatch    = blog.match(/^title:\s*"(.+)"/m);
  const categoryMatch = blog.match(/^category:\s*"(.+)"/m);
  const excerptMatch  = blog.match(/^excerpt:\s*"(.+)"/m);
  const title    = titleMatch?.[1]    ?? slug;
  const category = categoryMatch?.[1] ?? "Landlord Tips";
  const excerpt  = excerptMatch?.[1]  ?? "";

  // ── 4. Internal linking engine ────────────────────────────────────────────
  // Ask Claude which existing posts should link to the new post
  const filesToPush: { path: string; content: string }[] = [
    { path: `content/blog/${slug}.md`, content: blog },
    { path: "content/seo-brain.md",   content: brain },
  ];

  try {
    const slugSample = existingSlugs
      .filter((s) => s !== slug)
      .slice(0, 40)
      .join(", ");

    const linkResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: LINKING_SYSTEM,
      messages: [{
        role: "user",
        content: `New post just published:
Title: "${title}"
Slug: ${slug}
Excerpt: ${excerpt}

Existing posts (slugs): ${slugSample}

Which 2–3 existing posts should add a contextual link to the new post? Return JSON only.`,
      }],
    });

    const linkRaw = linkResponse.content[0].type === "text" ? linkResponse.content[0].text.trim() : "[]";

    // Parse JSON — strip any markdown code fences
    const jsonStr = linkRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const suggestions: { slug: string; searchText: string; replaceText: string }[] = JSON.parse(jsonStr);

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      // For each suggestion: fetch the file, apply the replacement
      await Promise.all(
        suggestions.map(async (s) => {
          try {
            const existing = await getFileFromGitHub(`content/blog/${s.slug}.md`);
            if (!existing) return;
            if (!existing.includes(s.searchText)) {
              console.warn(`[seo-writer] searchText not found in ${s.slug}`);
              return;
            }
            const updated = existing.replace(s.searchText, s.replaceText);
            filesToPush.push({ path: `content/blog/${s.slug}.md`, content: updated });
            console.log(`[seo-writer] Internal link added to: ${s.slug}`);
          } catch (err) {
            console.error(`[seo-writer] Link injection failed for ${s.slug}:`, err);
          }
        })
      );
    }
  } catch (err) {
    console.error("[seo-writer] Internal linking error (non-fatal):", err);
  }

  // ── 5. Push everything to GitHub ─────────────────────────────────────────
  const linkedCount = filesToPush.length - 2; // subtract new post + brain
  const pushResult = await pushFilesToGitHub(
    filesToPush,
    `SEO: ${title} [SEO Agent]\n\nKeyword: ${slug}\nCategory: ${category}\nInternal links added: ${linkedCount} existing posts updated\n\nCo-Authored-By: Prospera SEO Agent <agent@prosperaproperties.co>`
  );

  if (!pushResult.success) {
    console.error("[seo-writer] GitHub push failed:", pushResult.error);
    return NextResponse.json({ error: "GitHub push failed", detail: pushResult.error }, { status: 500 });
  }

  // ── 6. Trigger Vercel rebuild ─────────────────────────────────────────────
  try {
    await fetch("https://api.vercel.com/v1/integrations/deploy/prj_BepoLv37pz2jz2RiQDryRAyyJcmS/0PL9bLgRJf", { method: "POST" });
    console.log("[seo-writer] Vercel rebuild triggered");
  } catch (err) {
    console.error("[seo-writer] Vercel deploy hook failed:", err);
  }

  // ── 7. Google Indexing API ping ───────────────────────────────────────────
  const postUrl = `https://www.prosperaproperties.co/blog/${slug}`;
  const indexed = await submitUrlToGoogle(postUrl);
  console.log(`[seo-writer] Google indexing: ${indexed ? "sent" : "skipped"}`);

  // ── 8. Email notification ─────────────────────────────────────────────────
  const notifySecret = process.env.SEO_NOTIFY_SECRET;
  if (notifySecret) {
    try {
      await fetch("https://www.prosperaproperties.co/api/seo-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-notify-secret": notifySecret },
        body: JSON.stringify({ posts: [{ title, slug, category }] }),
      });
    } catch (err) {
      console.error("[seo-writer] Email notification failed:", err);
    }
  }

  console.log(`[seo-writer] Published: ${slug} | linked: ${linkedCount} posts | ${pushResult.commitUrl}`);
  return NextResponse.json({
    success: true,
    slug,
    title,
    internalLinksAdded: linkedCount,
    commitUrl: pushResult.commitUrl,
  });
}
