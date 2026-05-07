import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const bedrooms = searchParams.get("bedrooms");

  if (!city || !bedrooms) {
    return NextResponse.json({ source: "static" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("rent_market_data")
      .select("p25_rent, median_rent, p75_rent, submission_count, market_narrative, trend_direction")
      .eq("city", city)
      .eq("bedrooms", Number(bedrooms))
      .eq("is_published", true)
      .maybeSingle();

    if (error || !data || !data.median_rent) {
      return NextResponse.json({ source: "static" });
    }

    return NextResponse.json({
      source: "computed",
      p25: data.p25_rent,
      median: data.median_rent,
      p75: data.p75_rent,
      submission_count: data.submission_count,
      market_narrative: data.market_narrative,
      trend_direction: data.trend_direction,
    });
  } catch {
    return NextResponse.json({ source: "static" });
  }
}
