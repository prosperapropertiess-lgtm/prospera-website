import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getFileFromGitHub, pushFilesToGitHub } from "@/lib/github";
import { submitUrlToGoogle } from "@/lib/google-indexing";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SEO_SYSTEM = `
You are the SEO content agent for Prospera Properties — a property management company in London, St. Thomas, and Strathroy, Ontario.

YOUR JOB:
Write one high-quality blog post targeting Ontario landlords. The post must target a MISSING keyword from the SEO brain document you will be given.

AUDIENCE: Independent landlords in Ontario who own 1–5 rental properties. They want practical, legally accurate, plain-language guidance. They are not experts.

VOICE: Direct, clear, knowledgeable. Like advice from a property manager who has seen everything. No fluff. No "in conclusion" paragraphs. No corporate speak.

BLOG POST REQUIREMENTS:
- Length: 1500–2000 words (body content only, not counting frontmatter)
- Structure: intro paragraph → H2 sections → practical step-by-step where relevant → summary or key takeaways at end
- Legally accurate for Ontario specifically (reference the Residential Tenancies Act where relevant)
- Include 2–3 internal links to related posts using this format: [anchor text](/blog/slug)
- End with a subtle CTA mentioning Prospera Properties manages properties in London, St. Thomas, and Strathroy

FRONTMATTER FIELDS (all required):
- title: Full SEO title in quotes (include "Ontario" where natural)
- date: Today's date in "YYYY-MM-DD" format
- slug: The exact keyword slug from the missing list (no changes)
- excerpt: 1–2 sentence summary, 120–155 chars, plain language
- category: One of "Landlord Tips" | "Ontario Law" | "Property Management"
- readTime: Estimate as "X min read" (1500w ≈ 7 min, 2000w ≈ 9 min)
- featuredImage: Pick the most relevant Unsplash URL:
  - LEGAL/LTB: https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=630&fit=crop&auto=format&q=80
  - MONEY/RENT/COST: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop&auto=format&q=80
  - HOUSE/PROPERTY: https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&h=630&fit=crop&auto=format&q=80
  - MAINTENANCE/REPAIR: https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=630&fit=crop&auto=format&q=80
  - CONTRACT/DOCS/LEGAL: https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop&auto=format&q=80
  - TENANT/SCREENING: https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=1200&h=630&fit=crop&auto=format&q=80

KEYWORD PRIORITY ORDER:
1. PAIN keywords marked ← HIGH PRIORITY
2. LONG-TAIL keywords marked ← HIGH PRIORITY
3. MONEY keywords
4. Any other PAIN keyword
5. Any other LONG-TAIL keyword
Pick the highest-priority item that appears in a "Still missing" section.

OUTPUT FORMAT — output EXACTLY this structure, nothing else:

===SLUG===
{the-slug-you-chose}
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

[full markdown blog post content here]
===END===

===BRAIN===
[the COMPLETE updated seo-brain.md — add the new slug with ✅ under its category section, update "Posts Written" count, update "Last Updated" date, add a brief session note at the bottom]
===END===
`;

// ── Parse Claude's structured output ─────────────────────────────────────────
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

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Read the SEO brain from GitHub ────────────────────────────────────────
  const seoBrain = await getFileFromGitHub("content/seo-brain.md");
  if (!seoBrain) {
    console.error("[seo-writer] Could not read seo-brain.md from GitHub");
    return NextResponse.json({ error: "Could not read seo-brain.md" }, { status: 500 });
  }

  const today = new Date().toISOString().split("T")[0];

  // ── Ask Claude to pick a keyword and write the post ───────────────────────
  let raw = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      system: SEO_SYSTEM,
      messages: [{
        role: "user",
        content: `Today's date: ${today}

Here is the current SEO brain document:

${seoBrain}

Pick the highest-priority missing keyword and write the blog post. Follow the output format exactly.`,
      }],
    });

    raw = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err) {
    console.error("[seo-writer] Claude error:", err);
    return NextResponse.json({ error: "Claude API error", detail: String(err) }, { status: 500 });
  }

  // ── Parse output ──────────────────────────────────────────────────────────
  const parsed = parseOutput(raw);
  if (!parsed) {
    console.error("[seo-writer] Failed to parse Claude output:", raw.substring(0, 500));
    return NextResponse.json({ error: "Failed to parse Claude output" }, { status: 500 });
  }

  const { slug, blog, brain } = parsed;

  // Extract title and category from frontmatter for the notification email
  const titleMatch    = blog.match(/^title:\s*"(.+)"/m);
  const categoryMatch = blog.match(/^category:\s*"(.+)"/m);
  const title    = titleMatch?.[1]    ?? slug;
  const category = categoryMatch?.[1] ?? "Landlord Tips";

  // ── Push to GitHub ────────────────────────────────────────────────────────
  const pushResult = await pushFilesToGitHub(
    [
      { path: `content/blog/${slug}.md`, content: blog },
      { path: "content/seo-brain.md",   content: brain },
    ],
    `SEO: ${title} [SEO Agent]\n\nKeyword: ${slug}\nCategory: ${category}\n\nCo-Authored-By: Prospera SEO Agent <agent@prosperaproperties.co>`
  );

  if (!pushResult.success) {
    console.error("[seo-writer] GitHub push failed:", pushResult.error);
    return NextResponse.json({ error: "GitHub push failed", detail: pushResult.error }, { status: 500 });
  }

  // ── Trigger Vercel rebuild so the post goes live ─────────────────────────
  try {
    await fetch("https://api.vercel.com/v1/integrations/deploy/prj_BepoLv37pz2jz2RiQDryRAyyJcmS/0PL9bLgRJf", {
      method: "POST",
    });
    console.log("[seo-writer] Vercel rebuild triggered");
  } catch (err) {
    console.error("[seo-writer] Vercel deploy hook failed:", err);
  }

  // ── Tell Google to index it immediately ──────────────────────────────────
  const postUrl = `https://www.prosperaproperties.co/blog/${slug}`;
  const indexed = await submitUrlToGoogle(postUrl);
  console.log(`[seo-writer] Google indexing ping: ${indexed ? "sent" : "skipped (no credentials)"}`);

  // ── Notify Ebin ───────────────────────────────────────────────────────────
  const base = "https://www.prosperaproperties.co";
  const notifySecret = process.env.SEO_NOTIFY_SECRET;
  if (notifySecret) {
    try {
      await fetch(`${base}/api/seo-notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-notify-secret": notifySecret,
        },
        body: JSON.stringify({
          posts: [{ title, slug, category }],
        }),
      });
    } catch (err) {
      // Non-fatal — post is already live
      console.error("[seo-writer] Notification email failed:", err);
    }
  }

  console.log(`[seo-writer] Published: ${slug} | ${pushResult.commitUrl}`);
  return NextResponse.json({
    success: true,
    slug,
    title,
    commitUrl: pushResult.commitUrl,
  });
}
