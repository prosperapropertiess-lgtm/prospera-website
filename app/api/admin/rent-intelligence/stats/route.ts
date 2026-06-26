import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: byCityAll },
    { data: byCityWeek },
    { data: marketData },
  ] = await Promise.all([
    supabase.from("rent_submissions").select("city, submission_type"),
    supabase.from("rent_submissions").select("city, submission_type").gte("submitted_at", weekAgo),
    supabase.from("rent_market_data").select("city, bedrooms, median_rent, p25_rent, p75_rent, submission_count, computed_at, trend_direction").order("city").order("bedrooms"),
  ]);

  // Aggregate by city
  const cities: Record<string, { total: number; week: number; manual: number; landlord: number }> = {};
  for (const row of byCityAll ?? []) {
    if (!cities[row.city]) cities[row.city] = { total: 0, week: 0, manual: 0, landlord: 0 };
    cities[row.city].total++;
    if (row.submission_type === "manual_entry") cities[row.city].manual++;
    else cities[row.city].landlord++;
  }
  for (const row of byCityWeek ?? []) {
    if (!cities[row.city]) cities[row.city] = { total: 0, week: 0, manual: 0, landlord: 0 };
    cities[row.city].week++;
  }

  const lastRefresh = marketData && marketData.length > 0
    ? marketData.reduce((latest, row) => row.computed_at > latest ? row.computed_at : latest, "")
    : null;

  return NextResponse.json({
    cities,
    market_data: marketData ?? [],
    last_refresh: lastRefresh,
  });
}
