import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// The jobs vercel.json actually schedules. Keep this list in step with it:
// a job missing from vercel.json never runs, whatever this page says.
const JOBS = [
  {
    id: "monthly-owner-report",
    name: "Owner statements",
    what: "Emails each owner last month's rent, expenses and what's coming up.",
    when: "3rd of every month, 9am",
    runnable: false, // emails real owners, so it only runs on schedule
  },
  {
    id: "listings-integrity",
    name: "Listings check",
    what: "Makes sure live listings are still live and the apply link still works. Emails you if not.",
    when: "Every day, 9am",
    runnable: true,
  },
  {
    id: "move-in-review-requests",
    name: "Review requests",
    what: "Asks tenants for a review a few days after they move in.",
    when: "Every day, 11am",
    runnable: false, // emails tenants
  },
  {
    id: "intelligence",
    name: "Daily briefing",
    what: "Emails you a short business lesson that builds on the last week's.",
    when: "Every day, 7:30am",
    runnable: true,
  },
] as const;

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: runs } = await getSupabaseAdmin()
    .from("agent_runs")
    .select("agent, status, ran_at")
    .in("agent", JOBS.map((j) => j.id))
    .order("ran_at", { ascending: false })
    .limit(200);

  const last = new Map<string, { status: string; ran_at: string }>();
  for (const r of runs ?? []) if (!last.has(r.agent)) last.set(r.agent, r);

  return NextResponse.json({ jobs: JOBS.map((j) => ({ ...j, lastRun: last.get(j.id) ?? null })) });
}

// POST { id }: run a job now. The cron secret stays on the server.
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json().catch(() => ({}));
  const job = JOBS.find((j) => j.id === id);
  if (!job?.runnable) return NextResponse.json({ error: "That job only runs on its schedule." }, { status: 400 });

  const res = await fetch(new URL(`/api/cron/${job.id}`, req.url), {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  if (!res.ok) return NextResponse.json({ error: `It failed (${res.status}).` }, { status: 502 });
  return NextResponse.json({ ok: true });
}
