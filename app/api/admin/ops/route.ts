import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { listFilesFromGitHub } from "@/lib/github";

export const dynamic = "force-dynamic";

// Static agent definitions — schedule + description metadata
const AGENT_DEFS = [
  {
    id: "seo-writer",
    name: "SEO Writer",
    description: "Writes a new blog post + optimizes 1 existing post + drafts a Facebook post",
    schedule: "Mon–Thu · 8am EST",
    scheduleCode: "0 12 * * 1-4",
    category: "content",
  },
  {
    id: "seo-optimizer",
    name: "SEO Optimizer",
    description: "Optimizes 2 existing posts for CTR and content depth — no new post",
    schedule: "Fri · 8am EST",
    scheduleCode: "0 12 * * 5",
    category: "content",
  },
  {
    id: "social-agent",
    name: "Social Agent",
    description: "Generates 2 Facebook + LinkedIn posts and publishes them directly",
    schedule: "Daily · 9am + 6pm EST",
    scheduleCode: "0 14,23 * * *",
    category: "social",
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Sends the next blog in the drip sequence to all landlord subscribers",
    schedule: "Tue · 10am EST",
    scheduleCode: "0 15 * * 2",
    category: "email",
  },
  {
    id: "nightly-intelligence",
    name: "Nightly Intelligence",
    description: "Computes rental market estimates from submission data",
    schedule: "Nightly",
    scheduleCode: "0 5 * * *",
    category: "data",
  },
  {
    id: "monthly-owner-report",
    name: "Owner Reports",
    description: "Claude-written narrative monthly report emailed to each property owner",
    schedule: "3rd of month · 9am EST",
    scheduleCode: "0 13 3 * *",
    category: "email",
  },
  {
    id: "followup",
    name: "Tenant Follow-up",
    description: "Sends follow-up emails to tenant applications pending 48h+",
    schedule: "Event-driven · hourly check",
    scheduleCode: "0 * * * *",
    category: "crm",
  },
  {
    id: "cto-weekly",
    name: "CTO Weekly",
    description: "Strategic roadmap review and platform intelligence report",
    schedule: "Weekly",
    scheduleCode: "0 12 * * 1",
    category: "intelligence",
  },
  {
    id: "monthly-trends-email",
    name: "Market Trends Email",
    description: "Monthly rental market trends report from nightly intelligence data",
    schedule: "Monthly",
    scheduleCode: "0 13 1 * *",
    category: "email",
  },
] as const;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cookieAuth = req.cookies.get("admin_token")?.value;
  if (!authHeader && !cookieAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();

  // Fetch everything in parallel
  const [runsResult, subscribersResult, socialResult, marketResult, blogFiles] = await Promise.allSettled([
    // Last run per agent (last 30 days)
    sb.from("agent_runs")
      .select("agent, status, summary, error_msg, duration_ms, ran_at")
      .gte("ran_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("ran_at", { ascending: false })
      .limit(200),

    // Subscriber count
    sb.from("subscribers").select("id, unsubscribed", { count: "exact" }),

    // Pending social drafts
    sb.from("social_drafts")
      .select("id, status, created_at, message")
      .order("created_at", { ascending: false })
      .limit(5),

    // Latest market data
    sb.from("rent_market_data")
      .select("city, computed_at")
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Blog post count from GitHub
    listFilesFromGitHub("content/blog").catch(() => [] as string[]),
  ]);

  const runs = runsResult.status === "fulfilled" ? (runsResult.value.data ?? []) : [];
  const subscribers = subscribersResult.status === "fulfilled" ? subscribersResult.value : { data: [], count: 0 };
  const socialDrafts = socialResult.status === "fulfilled" ? (socialResult.value.data ?? []) : [];
  const marketData = marketResult.status === "fulfilled" ? marketResult.value.data : null;
  const blogFileList = blogFiles.status === "fulfilled" ? (blogFiles.value as string[]) : [];

  // Build last-run map per agent
  const lastRunMap: Record<string, { status: string; ran_at: string; duration_ms: number | null; summary: Record<string, unknown> | null }> = {};
  for (const run of runs) {
    if (!lastRunMap[run.agent]) {
      lastRunMap[run.agent] = {
        status: run.status,
        ran_at: run.ran_at,
        duration_ms: run.duration_ms,
        summary: run.summary,
      };
    }
  }

  // Compute run stats for the last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weekRuns = runs.filter((r) => r.ran_at >= weekAgo);
  const weekSuccesses = weekRuns.filter((r) => r.status === "success").length;

  // Subscriber stats
  const allSubs = subscribers.data ?? [];
  const activeSubs = allSubs.filter((s: { unsubscribed: boolean }) => !s.unsubscribed).length;

  // Newsletter last send
  const newsletterLast = lastRunMap["newsletter"];

  // Blog count from file list
  const blogCount = blogFileList.filter((f: string) => f.endsWith(".md") && !f.includes("seo-brain")).length;

  // Build agent list with last run data
  const agents = AGENT_DEFS.map((def) => ({
    ...def,
    lastRun: lastRunMap[def.id] ?? null,
  }));

  return NextResponse.json({
    agents,
    stats: {
      totalAgents: AGENT_DEFS.length,
      runsThisWeek: weekRuns.length,
      successRate: weekRuns.length > 0 ? Math.round((weekSuccesses / weekRuns.length) * 100) : null,
      blogPosts: blogCount,
      activeSubscribers: activeSubs,
      pendingSocialDrafts: socialDrafts.filter((d: { status: string }) => d.status === "pending").length,
      lastMarketUpdate: marketData?.computed_at ?? null,
      lastNewsletterSlug: newsletterLast?.summary?.blog as string ?? null,
    },
    recentRuns: runs.slice(0, 20),
  });
}
