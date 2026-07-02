/**
 * Prospera Social Agent — runs twice daily (9am + 6pm EDT)
 *
 * Each run generates 2 posts:
 *   Post 1 — timely (news-driven)
 *   Post 2 — evergreen (landlord truth, RTA reality)
 *
 * Posts fire directly to Facebook + LinkedIn.
 * A notification-only email is sent to Ebin after posting.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getFileFromGitHub } from "@/lib/github";
import { getSupabaseAdmin } from "@/lib/supabase";
import { logAgentRun } from "@/lib/agent-logger";

export const maxDuration = 120;

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
const SITE_URL = "https://www.prosperaproperties.co/";
const FB_PAGE_URL = "https://www.facebook.com/381380218388134";
const LI_PAGE_URL = "https://www.linkedin.com/company/prospera-properties";

const RSS_FEEDS = [
  {
    name: "Google News — Ontario Landlord",
    url: "https://news.google.com/rss/search?q=Ontario+landlord+rental+tenant+RTA&hl=en-CA&gl=CA&ceid=CA:en",
  },
  {
    name: "Google News — Ontario Housing",
    url: "https://news.google.com/rss/search?q=Ontario+housing+rent+increase+eviction&hl=en-CA&gl=CA&ceid=CA:en",
  },
  {
    name: "Ontario Government News",
    url: "https://news.ontario.ca/opo/en/rss.html",
  },
];

const SOCIAL_SYSTEM = `
You are the social media content strategist for Prospera Properties — a property management company run by Ebin Jaison in London, St. Thomas, and Strathroy, Ontario.

YOUR JOB: Write TWO Facebook/LinkedIn posts per day. Each must be completely different in angle and framework. Together they create a varied, high-value feed.

POST 1 — TIMELY
Rooted in the news context provided. React to something happening in Ontario right now that affects landlords. Make landlords feel like insiders who know what's actually going on.

POST 2 — EVERGREEN
Not news-driven. Pick a raw, permanent truth about being a small Ontario landlord — self-managing stress, RTA traps, LTB realities, the math of bad tenants, tenant screening mistakes. Something that would be just as true 6 months from now.

RULES FOR BOTH POSTS:
- The two posts must use DIFFERENT frameworks (see below)
- The two posts must cover DIFFERENT topics — no overlap
- Neither post can repeat a topic from the recent history provided
- Neither post is a news summary, blog promotion, or ad

AUDIENCE: Small-scale Ontario landlords (1–5 units). Stressed, time-poor, self-managing. They've dealt with: late rent, LTB delays, bad tenants, 2am maintenance calls, RTA confusion, lease disputes.

VOICE: Direct. Confident. No fluff. Like a local property manager who's seen everything and tells the truth anyway. Never corporate. Never salesy. Dry humor is allowed sparingly.

STYLE RULES — follow exactly:
- Sentences are 4–10 words. Short. Punchy.
- Every sentence gets its own line. No paragraphs.
- No emojis in serious posts. One max in lighter posts. Never 🏠🔑💼.
- No exclamation marks. Ever.
- Numbers must be specific — not "many" but actual figures when available
- No hashtags
- Never mention a blog post, say "read more" or "link in bio"
- Never start with "At Prospera" or mention Prospera in the first 80% of the post
- Closing line: one short, final sentence. Make it land.

FRAMEWORKS — each post uses a different one:

REFRAME: State the common belief. Flip it in one sentence.

LIST DROP: Rapid-fire short lines, each adds pressure. End with one payoff line.

DATA BOMB: Open with a specific Ontario/Canadian stat. Explain what it means. What smart landlords do.

SCENARIO WALK: Put the landlord in a specific stressful moment. Walk through it step by step. Gut punch at the end.

TWO-TRUTH CONTRAST: Two short parallel sentences. Opposite truths. No explanation needed.

OPTIONAL SOFT CLOSE (use on one post, not both):
"That's exactly why we exist."
"Most landlords figure this out too late."
"London landlords — you can call us instead."
"That's the whole job."

NEWSLETTER CTA — add to post2 (evergreen) only, after the closing line, as a separate final line:
"Ontario landlord newsletter → prosperaproperties.co/newsletter"
This is the only time a URL is allowed. It must appear on its own line at the very end. Do not add it to post1.

OUTPUT FORMAT — return valid JSON only, exactly this structure:
{
  "post1": {
    "type": "timely",
    "framework": "name of framework used",
    "angle": "one sentence — what this is about and why",
    "post": "full post text, line breaks as \\n"
  },
  "post2": {
    "type": "evergreen",
    "framework": "name of framework used",
    "angle": "one sentence — what this is about and why",
    "post": "full post text, line breaks as \\n"
  }
}
`;

function parseRssHeadlines(xml: string, sourceName: string, limit = 6): string {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  const headlines = items.slice(0, limit).map((item) => {
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? item.match(/<title>(.*?)<\/title>/)?.[1]
      ?? "";
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    return `- ${title.trim()}${pubDate ? ` (${pubDate.trim()})` : ""}`;
  }).filter(Boolean);
  if (headlines.length === 0) return "";
  return `${sourceName}:\n${headlines.join("\n")}`;
}

function extractRecentPosts(brain: string, limit = 8): string {
  const lines = brain.split("\n").filter((l) => l.includes("✅"));
  return lines.slice(-limit).join("\n");
}

type SocialPost = { type: string; framework: string; angle: string; post: string };
type PostResult = { platform: string; success: boolean; error?: string };

async function postToFacebook(message: string): Promise<PostResult> {
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  const pageId    = process.env.META_PAGE_ID;

  if (!pageToken || !pageId) {
    return { platform: "Facebook", success: false, error: "Credentials not configured" };
  }

  try {
    const caption = `${message}\n\n${SITE_URL}`;
    const body = new URLSearchParams({ message: caption, access_token: pageToken });
    const res  = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, { method: "POST", body });
    const data = await res.json();

    if (!res.ok || data.error) {
      return { platform: "Facebook", success: false, error: data.error?.message ?? "Unknown error" };
    }
    return { platform: "Facebook", success: true };
  } catch (err) {
    return { platform: "Facebook", success: false, error: String(err) };
  }
}

async function postToLinkedIn(message: string): Promise<PostResult> {
  const liToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const liOrgId = process.env.LINKEDIN_ORGANIZATION_ID;

  if (!liToken || !liOrgId) {
    return { platform: "LinkedIn", success: false, error: "Credentials not configured" };
  }

  try {
    const body = {
      author: `urn:li:organization:${liOrgId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: message },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${liToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return { platform: "LinkedIn", success: false, error: data.message ?? JSON.stringify(data) };
    }
    return { platform: "LinkedIn", success: true };
  } catch (err) {
    return { platform: "LinkedIn", success: false, error: String(err) };
  }
}

async function saveToSupabase(slug: string, message: string, status: string) {
  try {
    await getSupabaseAdmin()
      .from("social_drafts")
      .insert([{ slug, message, image_url: null, link: SITE_URL, status }]);
  } catch {
    // Non-blocking
  }
}

async function sendNotificationEmail(
  posts: { post: SocialPost; results: PostResult[] }[]
) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const postRows = posts.map(({ post, results }, i) => {
      const platforms = results.filter((r) => r.success).map((r) => r.platform).join(" & ") || "None";
      const errors    = results.filter((r) => !r.success).map((r) => `${r.platform}: ${r.error}`).join("; ");

      return `
        <div style="margin-bottom:28px;">
          <p style="font-size:11px;color:#9B9B9B;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px;">
            Post ${i + 1} — ${post.type} · ${post.framework}
            &nbsp;·&nbsp;
            <span style="color:${platforms !== "None" ? "#2E7D32" : "#8B2030"};">${platforms !== "None" ? `Posted to ${platforms}` : `Failed — ${errors}`}</span>
          </p>
          <div style="background:white;border:1px solid #E8E4DF;padding:16px 20px;border-radius:6px;white-space:pre-wrap;font-size:13px;color:#2C2C2C;line-height:1.8;">
            ${post.post.replace(/\n/g, "<br/>")}
          </div>
        </div>
      `;
    }).join("");

    await resend.emails.send({
      from: "Prospera Social Agent <hello@prosperaproperties.co>",
      to: "prosperapropertiess@gmail.com",
      subject: `[Social] ${new Date().toLocaleString("en-CA", { timeZone: "America/Toronto", dateStyle: "medium", timeStyle: "short" })} — posts live`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1F2F3A;padding:24px 32px;">
            <p style="color:#8B2030;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Prospera Social Agent</p>
            <h1 style="color:#FAF8F5;font-size:20px;font-weight:300;margin:0;">Posts published</h1>
          </div>
          <div style="padding:32px;background:#FAF8F5;">
            ${postRows}
            <div style="display:flex;gap:12px;margin-top:8px;">
              <a href="${FB_PAGE_URL}" style="display:inline-block;padding:10px 20px;background:#1877F2;color:#fff;text-decoration:none;font-size:11px;letter-spacing:1px;text-transform:uppercase;border-radius:4px;">View Facebook →</a>
              <a href="${LI_PAGE_URL}" style="display:inline-block;padding:10px 20px;background:#0A66C2;color:#fff;text-decoration:none;font-size:11px;letter-spacing:1px;text-transform:uppercase;border-radius:4px;">View LinkedIn →</a>
            </div>
            <p style="font-size:11px;color:#B0B0B0;margin:20px 0 0;">Prospera Properties · London, St. Thomas &amp; Strathroy, Ontario</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("[social-agent] Notification email failed:", err);
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const today = new Date().toISOString().split("T")[0];
  const runId = `${today}-${Date.now()}`;

  // ── 1. Gather context in parallel ─────────────────────────────────────────
  const [rssResults, seoBrain, recentDrafts] = await Promise.all([
    Promise.all(
      RSS_FEEDS.map(async (feed) => {
        try {
          const res = await fetch(feed.url, {
            headers: { "User-Agent": "Prospera-Social-Agent/1.0" },
            signal: AbortSignal.timeout(8000),
          });
          return parseRssHeadlines(await res.text(), feed.name);
        } catch {
          return "";
        }
      })
    ),
    getFileFromGitHub("content/seo-brain.md").catch(() => null),
    (async () => {
      try {
        const { data } = await getSupabaseAdmin()
          .from("social_drafts")
          .select("slug, message, created_at")
          .gte("created_at", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: false })
          .limit(28);
        return (data ?? []) as { slug: string; message: string; created_at: string }[];
      } catch {
        return [] as { slug: string; message: string; created_at: string }[];
      }
    })(),
  ]);

  const newsContext       = rssResults.filter(Boolean).join("\n\n");
  const recentBlogPosts   = seoBrain ? extractRecentPosts(seoBrain) : "";
  const recentPostSummary = recentDrafts.length > 0
    ? recentDrafts.map((d) => `- ${d.slug} (${d.created_at?.slice(0, 10)}): ${d.message?.slice(0, 80)}...`).join("\n")
    : "None in the last 14 days.";

  // ── 2. Generate both posts ────────────────────────────────────────────────
  let raw = "";
  try {
    const client = getAnthropic();
    const socialResult = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `${SOCIAL_SYSTEM}\n\nToday: ${today}

RECENT ONTARIO LANDLORD NEWS:
${newsContext || "No news fetched today — use a timely evergreen angle for post 1."}

RECENT PROSPERA BLOG POSTS (topic reference):
${recentBlogPosts || "None available."}

RECENT SOCIAL POSTS — avoid these topics:
${recentPostSummary}

Write both posts. Return JSON only.`,
      }],
    });
    raw = (socialResult.content[0].type === "text" ? socialResult.content[0].text : "").trim();
  } catch (err) {
    console.error("[social-agent] Anthropic error:", err);
    return NextResponse.json({ error: "Anthropic API error", detail: String(err) }, { status: 500 });
  }

  // ── 3. Parse ──────────────────────────────────────────────────────────────
  let post1: SocialPost | null = null;
  let post2: SocialPost | null = null;
  try {
    const jsonStr = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed  = JSON.parse(jsonStr);
    post1 = parsed.post1 ?? null;
    post2 = parsed.post2 ?? null;
  } catch {
    console.error("[social-agent] Failed to parse JSON:", raw.slice(0, 300));
    return NextResponse.json({ error: "Failed to parse Claude response" }, { status: 500 });
  }

  if (!post1?.post && !post2?.post) {
    return NextResponse.json({ error: "No posts generated" }, { status: 500 });
  }

  // ── 4. Post directly to platforms ────────────────────────────────────────
  const outcomes: { post: SocialPost; results: PostResult[] }[] = [];

  for (const [i, post] of ([post1, post2] as (SocialPost | null)[]).entries()) {
    if (!post?.post) continue;

    const [fbResult, liResult] = await Promise.all([
      postToFacebook(post.post),
      postToLinkedIn(post.post),
    ]);

    const results = [fbResult, liResult];
    const status  = results.some((r) => r.success) ? "posted" : "failed";

    await saveToSupabase(`social-${runId}-${i + 1}`, post.post, status);
    outcomes.push({ post, results });

    console.log(`[social-agent] Post ${i + 1}: FB=${fbResult.success} LI=${liResult.success}`);
  }

  // ── 5. Send notification email ────────────────────────────────────────────
  await sendNotificationEmail(outcomes);

  await logAgentRun("social-agent", "success", {
    postsGenerated: outcomes.length,
    types: outcomes.map((o) => o.post.type),
    platforms: ["facebook", "linkedin"],
  }, Date.now() - startedAt);

  return NextResponse.json({
    success: true,
    posts: outcomes.map(({ post, results }) => ({
      type: post.type,
      framework: post.framework,
      angle: post.angle,
      preview: post.post.slice(0, 100),
      platforms: results.map((r) => ({ platform: r.platform, success: r.success, error: r.error })),
    })),
  });
}
