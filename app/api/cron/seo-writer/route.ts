/**
 * SEO Growth Engine — runs Wed/Thu at noon UTC (8am EST)
 *
 * Each run does two things in one shot:
 *   1. WRITE — picks the next missing keyword, runs competitor SERP analysis, publishes post
 *   2. OPTIMIZE — picks the weakest existing post and improves it
 *
 * Single GitHub commit, single Vercel rebuild, one combined email.
 * Fridays: optimization-only run handled by /api/cron/seo-optimizer
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getFileFromGitHub, pushFilesToGitHub } from "@/lib/github";
import { submitUrlToGoogle } from "@/lib/google-indexing";
import { querySearchAnalytics } from "@/lib/google-search-console";
import { logAgentRun } from "@/lib/agent-logger";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SITE_URL = "https://www.prosperaproperties.co/";
const BLOG_PREFIX = `${SITE_URL}blog/`;

// ── Writer system prompt ──────────────────────────────────────────────────────
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
- Include 2–3 external authority links to credible sources:
  - Ontario government sites (ontario.ca, tribunalsontario.ca/ltb), CMHC, CREA, Statistics Canada
  - Use format: [anchor text](https://full-url)
  - Link to specific, relevant pages — not just homepages
  - Spread throughout the post; they signal credibility to Google
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

REDDIT + NEWS SIGNALS (if provided):
You will receive hot Reddit threads from r/OntarioLandlord and r/londonontario, plus recent Ontario landlord news headlines. Use these as TOPIC SIGNALS ONLY — to understand what landlords are worried about right now and what language they actually use. Rules:
- NEVER cite Reddit as a source in the post
- NEVER repeat unverified claims from Reddit as fact
- If a Reddit thread mentions a specific law, form, LTB ruling, or policy change — you MUST verify it against official sources (ontario.ca, tribunalsontario.ca/ltb, the Residential Tenancies Act) before stating it as fact in the post
- If you cannot verify a claim, either omit it or frame it as "landlords often ask about..." without stating it as established fact
- News headlines may reference real policy changes — include them only if you can accurately describe the policy from your training knowledge, and link to the official source
- The goal: write posts that feel timely and address real current pain, while remaining 100% legally accurate

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

// ── Optimizer system prompt ───────────────────────────────────────────────────
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
8. CTA — ensure the closing paragraph mentions Prospera Properties serves London, St. Thomas, and Strathroy.

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

// ── Social post system prompt ─────────────────────────────────────────────────
const SOCIAL_SYSTEM = `
You are the Facebook voice for Prospera Properties — a property management company run by Ebin Jaison in London, St. Thomas, and Strathroy, Ontario.

Write one Facebook post inspired by the blog topic provided. The post is NOT a blog promotion. It is a standalone piece of content that makes Ontario landlords stop scrolling.

AUDIENCE: Small-scale Ontario landlords (1–5 units). Stressed, time-poor, self-managing. They've dealt with late rent, LTB delays, bad tenants, 2am maintenance calls, RTA confusion.

VOICE: Direct. Confident. No fluff. Like a local property manager who's seen everything and tells you the truth anyway. Never corporate. Never salesy. Dry humor is allowed sparingly.

STYLE RULES:
- Sentences are 4–10 words. Short. Punchy.
- Every sentence gets its own line. No paragraphs.
- No emojis in serious posts. One max in lighter posts. Never use 🏠🔑💼.
- No exclamation marks. Ever.
- Numbers must be specific — not "many landlords" but "63% of landlords"
- No hashtags
- Never mention the blog post or say "read more" or "link in bio"
- Never start with "At Prospera" or mention Prospera in the first 80% of the post
- Closing line is always one short, final sentence. Make it land.

USE ONE OF THESE FRAMEWORKS:

REFRAME — state the common belief, flip it in one sentence
LIST DROP — rapid-fire short lines, each adds pressure, end with payoff
DATA BOMB — open with a specific Ontario/Canadian stat, explain what it means for them
SCENARIO WALK — put landlord in a specific stressful moment, walk through it, gut punch at the end
TWO-TRUTH CONTRAST — two short parallel sentences, opposite truths, implicit lesson

CONTENT DRAW FROM:
- The hidden cost of self-managing (time, stress, legal risk)
- Ontario RTA / LTB reality (eviction timelines, N4/N12/N5 notices, tribunal backlog)
- Tenant screening mistakes
- The math of one bad tenant vs. a PM fee
- What landlords do wrong without knowing it
- Rent increase rules, proper notice requirements
- The emotional toll vs. the business reality

OUTPUT: The post only. No commentary. No "Here's a post:". Just the text, ready to copy-paste.
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

// ── Keyword selector prompt ───────────────────────────────────────────────────
const KEYWORD_SELECTOR_SYSTEM = `
You are the keyword picker for Prospera Properties' SEO agent.

Given the SEO brain document, pick the single highest-priority missing keyword to write next.

Priority order:
1. LONG-TAIL ← HIGH PRIORITY items first
2. PAIN ← HIGH PRIORITY items
3. MONEY keywords
4. Any remaining LONG-TAIL
5. Any remaining PAIN

CRITICAL RULE: Never pick commercial intent keywords. Only informational/educational keywords belong on the blog.
Commercial intent (these go on service pages, not blog):
- "property management [city]"
- "property manager [city]"
- "rent collection services"
- "tenant placement"
- "Airbnb management"
- "student rental management"
If the top candidates look commercial, skip them and pick the next informational keyword.

Return ONLY valid JSON, nothing else:
{ "slug": "the-exact-slug", "keyword": "the target search phrase" }
`;

// ── SERP competitor analysis ──────────────────────────────────────────────────
async function fetchSerpSnippets(keyword: string): Promise<string> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return "";

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: `${keyword} ontario`, gl: "ca", hl: "en", num: 5 }),
    });
    if (!res.ok) return "";

    const data = await res.json();
    const results = (data.organic ?? []).slice(0, 3);
    if (!results.length) return "";

    const lines = results.map((r: { title: string; link: string; snippet: string }, i: number) =>
      `${i + 1}. "${r.title}" — ${r.link}\n   ${r.snippet}`
    );

    return `\nCOMPETITOR ANALYSIS (top 3 Google results for "${keyword} ontario"):\n${lines.join("\n")}\n\nUse this to:\n- Cover topics competitors cover (match topical depth)\n- Find angles they missed (differentiate)\n- Write at least as long, ideally more specific and actionable\n- Do NOT copy their phrasing — write fresh\n`;
  } catch {
    return "";
  }
}

// ── Reddit signals — hot threads from r/OntarioLandlord + r/londonontario ─────
async function fetchRedditSignals(): Promise<string> {
  try {
    const subreddits = ["OntarioLandlord", "londonontario"];
    const results: string[] = [];

    for (const sub of subreddits) {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/search.json?q=landlord+tenant+rent&sort=new&t=week&limit=8`,
        { headers: { "User-Agent": "prospera-seo-bot/1.0" } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const posts = (data?.data?.children ?? [])
        .map((p: { data: { title: string; score: number; num_comments: number; selftext?: string } }) => p.data)
        .filter((p: { score: number }) => p.score > 2)
        .slice(0, 5)
        .map((p: { title: string; score: number; num_comments: number; selftext?: string }) =>
          `  - "${p.title}" (${p.score} upvotes, ${p.num_comments} comments)`
        );
      if (posts.length) {
        results.push(`r/${sub}:\n${posts.join("\n")}`);
      }
    }

    if (!results.length) return "";
    return `\nREDDIT SIGNALS (what Ontario landlords are talking about this week):\n${results.join("\n\n")}\n\nUse as topic/language signals only. Fact-check any legal claims before including them.\n`;
  } catch {
    return "";
  }
}

// ── News signals — recent Ontario landlord/LTB news via Serper ───────────────
async function fetchNewsSignals(): Promise<string> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return "";

  const queries = [
    "Ontario landlord tenant board 2026 news",
    "Ontario RTA residential tenancies act amendment 2026",
    "London Ontario rental market 2026",
  ];

  try {
    const allHeadlines: string[] = [];

    for (const q of queries) {
      const res = await fetch("https://google.serper.dev/news", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q, gl: "ca", hl: "en", num: 3 }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items = (data.news ?? []).slice(0, 3).map(
        (n: { title: string; source: string; date?: string }) =>
          `  - "${n.title}" — ${n.source}${n.date ? ` (${n.date})` : ""}`
      );
      allHeadlines.push(...items);
    }

    if (!allHeadlines.length) return "";
    // Deduplicate
    const unique = [...new Set(allHeadlines)].slice(0, 8);
    return `\nRECENT NEWS SIGNALS (Ontario landlord/LTB headlines this week):\n${unique.join("\n")}\n\nIf a headline references a real policy change you can verify, reference it in the post with a link to the official source. If you cannot verify it, do not mention it.\n`;
  } catch {
    return "";
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseWriterOutput(raw: string): { slug: string; blog: string; brain: string } | null {
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

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const today = new Date().toISOString().split("T")[0];

  // ── 1. Read SEO brain + fetch GSC data in parallel ────────────────────────
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

  const existingSlugs = extractSlugs(seoBrain);

  // Build GSC context for the writer
  let gscContext = "";
  if (gscData?.rows?.length) {
    const topList = gscData.rows
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 8)
      .map((r) => {
        const slug = r.keys[0].replace(`${SITE_URL}blog/`, "");
        return `  - /blog/${slug} — ${r.impressions} impressions, position #${r.position.toFixed(0)}, CTR ${(r.ctr * 100).toFixed(1)}%`;
      })
      .join("\n");
    gscContext = `\nGSC PERFORMANCE DATA (last 28 days):\nTop performing blog posts:\n${topList}\n\nUse this to write supporting content that strengthens these clusters, or avoid cannibalizing topics already ranking well.\n`;
  }

  // ── 2a. KEYWORD SELECTION — pick keyword before writing ──────────────────
  console.log("[seo] Selecting keyword...");
  let selectedSlug = "";
  let selectedKeyword = "";
  try {
    const kwResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system: KEYWORD_SELECTOR_SYSTEM,
      messages: [{
        role: "user",
        content: `Today's date: ${today}\n\nSEO Brain:\n\n${seoBrain}\n\nReturn JSON only.`,
      }],
    });
    const kwRaw = kwResponse.content[0].type === "text" ? kwResponse.content[0].text.trim() : "";
    const kwJson = kwRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const kw = JSON.parse(kwJson);
    selectedSlug = kw.slug ?? "";
    selectedKeyword = kw.keyword ?? selectedSlug.replace(/-/g, " ");
    console.log(`[seo] Keyword selected: ${selectedSlug} ("${selectedKeyword}")`);
  } catch (err) {
    console.error("[seo] Keyword selector error (non-fatal, falling back to full writer):", err);
  }

  // ── 2b. COMPETITOR ANALYSIS + REDDIT + NEWS — all in parallel ───────────────
  let competitorContext = "";
  let redditSignals = "";
  let newsSignals = "";

  [competitorContext, redditSignals, newsSignals] = await Promise.all([
    selectedKeyword ? fetchSerpSnippets(selectedKeyword) : Promise.resolve(""),
    fetchRedditSignals(),
    fetchNewsSignals(),
  ]);

  if (competitorContext) console.log(`[seo] Competitor context fetched for: ${selectedKeyword}`);
  if (redditSignals)    console.log(`[seo] Reddit signals fetched`);
  if (newsSignals)      console.log(`[seo] News signals fetched`);

  // ── 2c. WRITER — write the full post with all context ────────────────────
  console.log("[seo] Starting writer...");
  let writerRaw = "";
  try {
    const slugInstruction = selectedSlug
      ? `Write the post for this keyword: "${selectedKeyword}" (slug: ${selectedSlug})\n`
      : "Pick the highest-priority missing keyword and write the full blog post.\n";

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: SEO_SYSTEM,
      messages: [{
        role: "user",
        content: `Today's date: ${today}
${gscContext}${competitorContext}${redditSignals}${newsSignals}
SEO Brain document:

${seoBrain}

${slugInstruction}Follow the output format exactly.`,
      }],
    });
    writerRaw = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("[seo] Writer Claude error:", err);
    return NextResponse.json({ error: "Writer Claude API error", detail: String(err) }, { status: 500 });
  }

  const writerParsed = parseWriterOutput(writerRaw);
  if (!writerParsed) {
    console.error("[seo] Failed to parse writer output:", writerRaw.substring(0, 500));
    return NextResponse.json({ error: "Failed to parse writer output" }, { status: 500 });
  }

  const { slug: newSlug, blog: newBlog, brain: updatedBrain } = writerParsed;
  const titleMatch    = newBlog.match(/^title:\s*"(.+)"/m);
  const categoryMatch = newBlog.match(/^category:\s*"(.+)"/m);
  const excerptMatch  = newBlog.match(/^excerpt:\s*"(.+)"/m);
  const newTitle    = titleMatch?.[1]    ?? newSlug;
  const newCategory = categoryMatch?.[1] ?? "Landlord Tips";
  const newExcerpt  = excerptMatch?.[1]  ?? "";

  console.log(`[seo] Writer done: ${newSlug}`);

  // ── 3. OPTIMIZER — pick weakest post and improve it ───────────────────────
  console.log("[seo] Starting optimizer...");

  // Use updated brain slugs so we don't accidentally pick the brand-new post
  const allSlugs = extractSlugs(updatedBrain);

  let optimizeSlug: string | null = null;
  let optimizeReason = "deterministic rotation (no GSC data yet)";

  if (gscData?.rows && gscData.rows.length >= 3) {
    const candidates = gscData.rows
      .map((r) => ({
        slug: r.keys[0].replace(BLOG_PREFIX, ""),
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
        score: r.impressions * (0.05 - Math.min(r.ctr, 0.05)),
      }))
      .filter((r) => r.impressions >= 50 && r.ctr < 0.04 && r.slug !== newSlug)
      .sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      optimizeSlug = candidates[0].slug;
      optimizeReason = `${candidates[0].impressions} impressions, ${(candidates[0].ctr * 100).toFixed(1)}% CTR — title/meta opportunity`;
    } else {
      const lowestRanking = gscData.rows
        .filter((r) => r.impressions >= 20 && r.keys[0].replace(BLOG_PREFIX, "") !== newSlug)
        .sort((a, b) => b.position - a.position)[0];
      if (lowestRanking) {
        optimizeSlug = lowestRanking.keys[0].replace(BLOG_PREFIX, "");
        optimizeReason = `position #${lowestRanking.position.toFixed(0)} — content depth opportunity`;
      }
    }
  }

  // Fallback: deterministic weekly rotation, skip the new post
  if (!optimizeSlug) {
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const eligible = allSlugs.filter((s) => s !== newSlug);
    if (eligible.length > 0) optimizeSlug = eligible[weekNum % eligible.length];
  }

  // Collect all files to push in one commit
  const filesToPush: { path: string; content: string }[] = [
    { path: `content/blog/${newSlug}.md`, content: newBlog },
    { path: "content/seo-brain.md", content: updatedBrain },
  ];

  let optimizedTitle = "";
  let optimizedChanges: string[] = [];

  if (optimizeSlug) {
    const originalContent = await getFileFromGitHub(`content/blog/${optimizeSlug}.md`);
    if (originalContent) {
      try {
        const optResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 10000,
          system: OPTIMIZER_SYSTEM,
          messages: [{
            role: "user",
            content: `Today's date: ${today}
Optimization target: ${optimizeSlug}
Reason selected: ${optimizeReason}

All existing blog post slugs (for internal links):
${allSlugs.filter((s) => s !== optimizeSlug).join(", ")}

Here is the current post content to optimize:

${originalContent}

Optimize this post following all instructions. Output the complete improved file.`,
          }],
        });

        const optRaw = optResponse.content[0].type === "text" ? optResponse.content[0].text : "";
        const optimized = parseOptimizerOutput(optRaw);

        if (optimized) {
          // Safety: verify slug wasn't changed
          const slugCheck = optimized.content.match(/^slug:\s*"(.+)"/m);
          if (!slugCheck || slugCheck[1] === optimizeSlug) {
            const titleM = optimized.content.match(/^title:\s*"(.+)"/m);
            optimizedTitle = titleM?.[1] ?? optimizeSlug;
            optimizedChanges = optimized.changes;
            filesToPush.push({ path: `content/blog/${optimizeSlug}.md`, content: optimized.content });
            console.log(`[seo] Optimizer done: ${optimizeSlug}`);
          } else {
            console.warn(`[seo] Optimizer slug mismatch — skipping (expected ${optimizeSlug}, got ${slugCheck[1]})`);
            optimizeSlug = null;
          }
        }
      } catch (err) {
        console.error("[seo] Optimizer Claude error (non-fatal):", err);
        optimizeSlug = null;
      }
    } else {
      optimizeSlug = null;
    }
  }

  // ── 4. Internal linking engine ────────────────────────────────────────────
  try {
    const slugSample = existingSlugs.filter((s) => s !== newSlug).slice(0, 40).join(", ");
    const linkResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: LINKING_SYSTEM,
      messages: [{
        role: "user",
        content: `New post just published:
Title: "${newTitle}"
Slug: ${newSlug}
Excerpt: ${newExcerpt}

Existing posts (slugs): ${slugSample}

Which 2–3 existing posts should add a contextual link to the new post? Return JSON only.`,
      }],
    });

    const linkRaw = linkResponse.content[0].type === "text" ? linkResponse.content[0].text.trim() : "[]";
    const jsonStr = linkRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const suggestions: { slug: string; searchText: string; replaceText: string }[] = JSON.parse(jsonStr);

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      await Promise.all(
        suggestions.map(async (s) => {
          // Don't overwrite a file we're already modifying
          if (filesToPush.find((f) => f.path === `content/blog/${s.slug}.md`)) return;
          try {
            const existing = await getFileFromGitHub(`content/blog/${s.slug}.md`);
            if (!existing || !existing.includes(s.searchText)) return;
            filesToPush.push({ path: `content/blog/${s.slug}.md`, content: existing.replace(s.searchText, s.replaceText) });
            console.log(`[seo] Internal link added to: ${s.slug}`);
          } catch (err) {
            console.error(`[seo] Link injection failed for ${s.slug}:`, err);
          }
        })
      );
    }
  } catch (err) {
    console.error("[seo] Internal linking error (non-fatal):", err);
  }

  // ── 5. Single GitHub commit for everything ────────────────────────────────
  const linkedCount = filesToPush.length - 2 - (optimizeSlug ? 1 : 0);
  const commitMsg = [
    `SEO: ${newTitle} + optimize ${optimizeSlug ?? "—"} [SEO Agent]`,
    ``,
    `New post: ${newSlug} (${newCategory})`,
    optimizeSlug ? `Optimized: ${optimizeSlug} — ${optimizeReason}` : "",
    `Internal links added to ${linkedCount} existing posts`,
    ``,
    `Co-Authored-By: Prospera SEO Agent <agent@prosperaproperties.co>`,
  ].filter(Boolean).join("\n");

  const pushResult = await pushFilesToGitHub(filesToPush, commitMsg);

  if (!pushResult.success) {
    console.error("[seo] GitHub push failed:", pushResult.error);
    return NextResponse.json({ error: "GitHub push failed", detail: pushResult.error }, { status: 500 });
  }

  // ── 6. Trigger one Vercel rebuild ─────────────────────────────────────────
  try {
    await fetch("https://api.vercel.com/v1/integrations/deploy/prj_BepoLv37pz2jz2RiQDryRAyyJcmS/0PL9bLgRJf", { method: "POST" });
    console.log("[seo] Vercel rebuild triggered");
  } catch (err) {
    console.error("[seo] Vercel deploy hook failed:", err);
  }

  // ── 7. Google Indexing pings ──────────────────────────────────────────────
  const newPostUrl = `${SITE_URL}blog/${newSlug}`;
  const promises: Promise<unknown>[] = [submitUrlToGoogle(newPostUrl)];
  if (optimizeSlug) promises.push(submitUrlToGoogle(`${SITE_URL}blog/${optimizeSlug}`));
  await Promise.all(promises);

  // ── 8. Combined email ─────────────────────────────────────────────────────
  const notifySecret = process.env.SEO_NOTIFY_SECRET;
  if (notifySecret) {
    try {
      // New post via seo-notify endpoint
      await fetch(`${SITE_URL}api/seo-notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-notify-secret": notifySecret },
        body: JSON.stringify({ posts: [{ title: newTitle, slug: newSlug, category: newCategory }] }),
      });

      // Optimizer summary via Resend (appended to same email or separate)
      if (optimizeSlug && optimizedChanges.length > 0) {
        const changeList = optimizedChanges.map((c) => `<li style="margin-bottom:6px;font-size:13px;color:#5A5A5A;">${c}</li>`).join("");
        const html = `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2C2C2C;">
            <div style="background:#1F2F3A;padding:28px 32px;">
              <p style="color:#8B2030;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">Prospera SEO Optimizer</p>
              <h1 style="color:#FAF8F5;font-size:22px;font-weight:300;margin:0;">Post optimized</h1>
            </div>
            <div style="padding:32px;">
              <p style="color:#5A5A5A;font-size:14px;margin:0 0 6px;">Also improved this existing post:</p>
              <p style="font-size:16px;font-weight:500;color:#1F2F3A;margin:0 0 4px;">${optimizedTitle}</p>
              <p style="font-size:12px;color:#9B9B9B;margin:0 0 20px;">Reason: ${optimizeReason}</p>
              <p style="font-size:13px;font-weight:500;color:#1F2F3A;margin:0 0 10px;">Changes made:</p>
              <ul style="padding-left:20px;margin:0 0 24px;">${changeList}</ul>
              <a href="${SITE_URL}blog/${optimizeSlug}" style="display:inline-block;padding:10px 24px;background:#1F2F3A;color:#FAF8F5;text-decoration:none;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">View Post</a>
              <p style="font-size:11px;color:#B0B0B0;margin-top:24px;">Prospera Properties · London, St. Thomas &amp; Strathroy, Ontario</p>
            </div>
          </div>`;

        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Prospera SEO Agent <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          subject: `Post optimized: ${optimizedTitle} — Prospera SEO`,
          html,
        });
      }
    } catch (err) {
      console.error("[seo] Email notification failed:", err);
    }
  }

  // ── 9. Draft a Facebook post for approval ────────────────────────────────
  const notifySecretForSocial = process.env.SEO_NOTIFY_SECRET;
  if (notifySecretForSocial) {
    try {
      // Extract featured image from the new post frontmatter
      const featuredImageMatch = newBlog.match(/^featuredImage:\s*"(.+)"/m);
      const featuredImage = featuredImageMatch?.[1] ?? null;

      // Strip frontmatter, pass first ~800 chars of body to Claude
      const bodyOnly = newBlog.replace(/^---[\s\S]*?---\n/, "").slice(0, 800);

      const socialResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
        system: SOCIAL_SYSTEM,
        messages: [{
          role: "user",
          content: `Blog post topic: "${newTitle}"
Category: ${newCategory}
Excerpt: ${newExcerpt}

Opening content:
${bodyOnly}

Write one Facebook post about this topic in the style described. Do not promote the blog post — write standalone content that stands on its own.`,
        }],
      });

      const socialPost = socialResponse.content[0].type === "text"
        ? socialResponse.content[0].text.trim()
        : null;

      if (socialPost) {
        await fetch(`${SITE_URL}api/social/draft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-notify-secret": notifySecretForSocial,
          },
          body: JSON.stringify({
            slug: newSlug,
            message: socialPost,
            imageUrl: featuredImage,
            link: `${SITE_URL}blog/${newSlug}`,
          }),
        });
        console.log(`[seo] Social draft created for: ${newSlug}`);
      }
    } catch (err) {
      console.error("[seo] Social draft failed (non-fatal):", err);
    }
  }

  console.log(`[seo] Done | new: ${newSlug} | optimized: ${optimizeSlug ?? "—"} | links: ${linkedCount} | ${pushResult.commitUrl}`);

  await logAgentRun("seo-writer", "success", {
    written: newSlug,
    writtenTitle: newTitle,
    optimized: optimizeSlug ?? null,
    internalLinksAdded: linkedCount,
    commitUrl: pushResult.commitUrl,
  }, Date.now() - startedAt);

  return NextResponse.json({
    success: true,
    written: { slug: newSlug, title: newTitle, category: newCategory },
    optimized: optimizeSlug ? { slug: optimizeSlug, title: optimizedTitle, reason: optimizeReason, changes: optimizedChanges } : null,
    internalLinksAdded: linkedCount,
    commitUrl: pushResult.commitUrl,
  });
}
