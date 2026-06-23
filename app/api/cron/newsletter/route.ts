/**
 * Weekly landlord newsletter — runs every Tuesday at 10am EST (15:00 UTC)
 *
 * Each run:
 *   1. Reads all blog posts from GitHub
 *   2. Checks newsletter_log in Supabase to find the next unsent blog
 *   3. Uses Claude to write: subject line, 3-4 takeaways, "why it matters" paragraph
 *   4. Sends to all landlord subscribers via Resend (personalised per recipient)
 *   5. Logs the send to newsletter_log
 *
 * 62 blogs = 62 weeks of automated nurture already banked.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";
import { getFileFromGitHub, listFilesFromGitHub } from "@/lib/github";
import { weeklyBlogEmail } from "@/lib/emails";
import { logAgentRun } from "@/lib/agent-logger";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
function getResend() { return new Resend(process.env.RESEND_API_KEY!); }

const FROM = "Ebin at Prospera <ebin@prosperaproperties.co>";
const BASE_URL = "https://www.prosperaproperties.co";

// ── Parse frontmatter from a blog markdown file ────────────────────────────
function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      fm[key.trim()] = rest.join(":").trim().replace(/^"|"$/g, "");
    }
  }
  return fm;
}

// ── Use Claude to generate email copy from the blog post ───────────────────
async function generateEmailCopy(
  title: string,
  excerpt: string,
  body: string
): Promise<{ subject: string; takeaways: string[]; whyItMatters: string } | null> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: `You write weekly newsletter copy for Prospera Properties — a property management company in London, St. Thomas, and Strathroy, Ontario. The audience is independent Ontario landlords with 1–5 properties.

Write copy that is:
- Direct and useful, not salesy
- Specific — reference the actual content of the post
- Personal — from Ebin, a real property manager, not a faceless brand
- Short — landlords are busy

Output EXACTLY this JSON structure (no markdown, no code fences):
{
  "subject": "one compelling subject line under 60 chars — specific, no clickbait",
  "takeaways": ["bullet 1", "bullet 2", "bullet 3", "bullet 4"],
  "whyItMatters": "2 sentences max — why this is relevant RIGHT NOW to a landlord in London/Ontario. Be specific. Reference a real pain point."
}`,
      messages: [{
        role: "user",
        content: `Blog title: ${title}\nExcerpt: ${excerpt}\n\nPost body (first 800 words):\n${body.slice(0, 3200)}`,
      }],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";
    return JSON.parse(raw);
  } catch (err) {
    console.error("[newsletter] Claude error:", err);
    return null;
  }
}

// ── Main handler ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get all blog files from GitHub, sorted by date (oldest first for drip)
  const fileNames = await listFilesFromGitHub("content/blog");
  if (!fileNames.length) {
    return NextResponse.json({ error: "No blog files found" }, { status: 500 });
  }

  // 2. Find which slugs have already been sent
  const { data: sentRows } = await supabaseAdmin
    .from("newsletter_log")
    .select("blog_slug");
  const sentSlugs = new Set((sentRows ?? []).map((r: { blog_slug: string }) => r.blog_slug));

  // 3. Load blog metadata for all files to find the next unsent one
  //    Sort by frontmatter date ascending (oldest blog first)
  type BlogMeta = { slug: string; title: string; excerpt: string; date: string; category: string; fileName: string };
  const allMeta: BlogMeta[] = [];

  for (const fileName of fileNames) {
    const slug = fileName.replace(".md", "");
    if (sentSlugs.has(slug)) continue; // already sent

    const content = await getFileFromGitHub(`content/blog/${fileName}`);
    if (!content) continue;

    const fm = parseFrontmatter(content);
    if (!fm.title || !fm.date) continue;

    allMeta.push({
      slug,
      title: fm.title,
      excerpt: fm.excerpt || "",
      date: fm.date,
      category: fm.category || "Landlord Tips",
      fileName,
    });
  }

  if (!allMeta.length) {
    console.log("[newsletter] All blogs have been sent — loop complete or no subscribers");
    return NextResponse.json({ message: "All blogs sent — drip cycle complete" });
  }

  // Sort oldest first
  allMeta.sort((a, b) => a.date.localeCompare(b.date));
  const next = allMeta[0];

  // 4. Load full post body for Claude
  const fullContent = await getFileFromGitHub(`content/blog/${next.fileName}`);
  if (!fullContent) {
    return NextResponse.json({ error: "Could not load blog content" }, { status: 500 });
  }
  // Strip frontmatter to get body only
  const body = fullContent.replace(/^---[\s\S]*?---\n/, "");

  // 5. Generate email copy with Claude
  const copy = await generateEmailCopy(next.title, next.excerpt, body);
  if (!copy) {
    return NextResponse.json({ error: "Claude failed to generate email copy" }, { status: 500 });
  }

  console.log(`[newsletter] Sending: "${next.title}" — subject: "${copy.subject}"`);

  // 6. Get all landlord subscribers
  const { data: subscribers, error: subError } = await supabaseAdmin
    .from("subscribers")
    .select("email, name")
    .in("type", ["landlord", "general"])
    .eq("unsubscribed", false)
    .not("email", "is", null);

  if (subError) {
    console.error("[newsletter] Supabase error:", subError);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }

  if (!subscribers?.length) {
    return NextResponse.json({ message: "No subscribers to send to" });
  }

  // 7. Send to each subscriber
  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      const html = weeklyBlogEmail({
        name: sub.name || "there",
        blogTitle: next.title,
        blogSlug: next.slug,
        blogExcerpt: next.excerpt,
        takeaways: copy.takeaways,
        whyItMatters: copy.whyItMatters,
        category: next.category,
      });

      await getResend().emails.send({
        from: FROM,
        to: sub.email,
        subject: copy.subject,
        html,
        headers: {
          "List-Unsubscribe": `<${BASE_URL}/unsubscribe?email=${encodeURIComponent(sub.email)}>`,
        },
      });

      sent++;
    } catch (err) {
      console.error(`[newsletter] Failed to send to ${sub.email}:`, err);
      failed++;
    }
  }

  // 8. Log the send
  await supabaseAdmin.from("newsletter_log").insert({
    blog_slug: next.slug,
    blog_title: next.title,
    subject_line: copy.subject,
    recipient_count: sent,
    sent_at: new Date().toISOString(),
  });

  console.log(`[newsletter] Done — ${sent} sent, ${failed} failed — blog: ${next.slug}`);

  await logAgentRun("newsletter", "success", {
    sent,
    failed,
    blog: next.slug,
    title: next.title,
    subject: copy.subject,
    totalRemaining: allMeta.length - 1,
  });

  return NextResponse.json({
    sent,
    failed,
    blog: next.slug,
    title: next.title,
    subject: copy.subject,
    totalRemaining: allMeta.length - 1,
  });
}
