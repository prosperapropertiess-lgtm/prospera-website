import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const now = new Date();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Build week buckets (Mon–Sun for past 8 weeks)
  const weeks: { label: string; start: string; end: string }[] = [];
  for (let i = 7; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    weeks.push({
      label: `${start.toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`,
      start: start.toISOString(),
      end: end.toISOString(),
    });
  }

  const [
    { data: submissionsAll },
    { data: submissionsWeek },
    { data: marketData },
    { data: analysisTokens },
    { data: analysisTokensWeek },
  ] = await Promise.all([
    supabase
      .from("rent_submissions")
      .select("city, submission_type, submitted_at"),
    supabase
      .from("rent_submissions")
      .select("city, submission_type, submitted_at")
      .gte("submitted_at", weekAgo),
    supabase
      .from("rent_market_data")
      .select("city, bedrooms, median_rent, p25_rent, p75_rent, submission_count, computed_at, trend_direction")
      .order("city")
      .order("bedrooms"),
    supabase
      .from("rent_analysis_tokens")
      .select("city, bedrooms, created_at, used_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("rent_analysis_tokens")
      .select("city, bedrooms, created_at, used_at")
      .gte("created_at", weekAgo),
  ]);

  // --- Submission stats ---
  const isLandlord = (type: string) => type === "landlord" || type === "initial_analysis";

  const cities: Record<string, { total: number; week: number; scraped: number; landlord: number; manual: number }> = {};
  for (const row of submissionsAll ?? []) {
    if (!cities[row.city]) cities[row.city] = { total: 0, week: 0, scraped: 0, landlord: 0, manual: 0 };
    cities[row.city].total++;
    if (row.submission_type === "scraped") cities[row.city].scraped++;
    else if (isLandlord(row.submission_type)) cities[row.city].landlord++;
    else cities[row.city].manual++;
  }
  for (const row of submissionsWeek ?? []) {
    if (!cities[row.city]) cities[row.city] = { total: 0, week: 0, scraped: 0, landlord: 0, manual: 0 };
    cities[row.city].week++;
  }

  const totalSubmissions = (submissionsAll ?? []).length;
  const scrapedTotal = (submissionsAll ?? []).filter((r) => r.submission_type === "scraped").length;
  const landlordTotal = (submissionsAll ?? []).filter((r) => isLandlord(r.submission_type)).length;
  const scrapedThisWeek = (submissionsWeek ?? []).filter((r) => r.submission_type === "scraped").length;
  const landlordThisWeek = (submissionsWeek ?? []).filter((r) => isLandlord(r.submission_type)).length;

  // --- Analysis request stats ---
  const analysisTotal = (analysisTokens ?? []).length;
  const analysisThisWeek = (analysisTokensWeek ?? []).length;
  const analysisUsed = (analysisTokens ?? []).filter((t) => t.used_at).length;
  const recentAnalysisRequests = (analysisTokens ?? []).slice(0, 10).map((t) => ({
    city: t.city,
    bedrooms: t.bedrooms,
    created_at: t.created_at,
    used: !!t.used_at,
  }));

  // --- Market data ---
  const lastRefresh = marketData && marketData.length > 0
    ? marketData.reduce((latest, row) => row.computed_at > latest ? row.computed_at : latest, "")
    : null;

  // --- Weekly scrape trend (past 8 weeks) ---
  const scrapeTrend = weeks.map((w) => ({
    label: w.label,
    count: (submissionsAll ?? []).filter(
      (r) => r.submission_type === "scraped" && r.submitted_at >= w.start && r.submitted_at < w.end
    ).length,
  }));

  return NextResponse.json({
    // Totals
    totalSubmissions,
    scrapedTotal,
    landlordTotal,
    scrapedThisWeek,
    landlordThisWeek,
    // Analysis requests
    analysisTotal,
    analysisThisWeek,
    analysisUsed,
    recentAnalysisRequests,
    // Per-city breakdown
    cities,
    // Market data
    market_data: marketData ?? [],
    last_refresh: lastRefresh,
    // Trend
    scrapeTrend,
  });
}
