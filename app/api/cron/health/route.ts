import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Last nightly intelligence run
  const { data: lastMarket } = await supabaseAdmin
    .from("rent_market_data")
    .select("computed_at, city, bedrooms, submission_count")
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Submissions with no email sent (analysis ran but email failed or never fired)
  const { count: pendingEmails } = await supabaseAdmin
    .from("rent_submissions")
    .select("id", { count: "exact", head: true })
    .eq("submission_type", "initial_analysis")
    .not("claude_analysis", "is", null)
    .is("email_sent_at", null);

  // Submissions with email errors
  const { count: emailErrors } = await supabaseAdmin
    .from("rent_submissions")
    .select("id", { count: "exact", head: true })
    .not("email_error", "is", null);

  // Total submissions this week
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: weeklySubmissions } = await supabaseAdmin
    .from("rent_submissions")
    .select("id", { count: "exact", head: true })
    .gte("submitted_at", weekAgo);

  const status = {
    ok: true,
    checked_at: new Date().toISOString(),
    last_nightly_run: lastMarket?.computed_at ?? null,
    pending_emails: pendingEmails ?? 0,
    email_errors: emailErrors ?? 0,
    weekly_submissions: weeklySubmissions ?? 0,
  };

  // Log so it shows in Vercel function logs
  console.log("[cron/health]", JSON.stringify(status));

  return NextResponse.json(status);
}
