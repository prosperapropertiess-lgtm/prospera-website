import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface RentToken {
  id: string;
  token: string;
  email: string;
  name: string | null;
  city: string | null;
  bedrooms: number | null;
  created_at: string;
  used_at: string | null;
  expires_at: string;
}

export interface RentSubmission {
  city: string;
  address?: string | null;
  unit_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  floor?: number | null;
  parking?: boolean | null;
  laundry?: string | null;
  utilities_included?: boolean | null;
  pet_friendly?: boolean | null;
  rent_amount: number;
  is_asking_rent?: boolean;
  is_occupied?: boolean | null;
  last_rent_increase?: string | null;
}

export interface MarketData {
  city: string;
  bedrooms: number;
  submission_count: number;
  p25_rent: number | null;
  median_rent: number | null;
  p75_rent: number | null;
  market_narrative: string | null;
  trend_direction: string | null;
}

export async function validateRentToken(token: string): Promise<RentToken | null> {
  const { data, error } = await supabaseAdmin
    .from("rent_analysis_tokens")
    .select("*")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  return data as RentToken;
}

export async function generatePropertyAnalysis(
  submission: RentSubmission,
  marketData: MarketData | null
): Promise<string> {
  const bedsLabel = submission.bedrooms ? `${submission.bedrooms}-bedroom` : "rental";
  const unitTypeLabel = submission.unit_type || "unit";

  const marketContext =
    marketData && marketData.median_rent
      ? `Market data for ${marketData.city}, ${bedsLabel} units (${marketData.submission_count} reports, last 90 days):
- 25th percentile: $${marketData.p25_rent}/mo
- Median: $${marketData.median_rent}/mo
- 75th percentile: $${marketData.p75_rent}/mo
- Trend: ${marketData.trend_direction || "insufficient data"}`
      : `No aggregated market data yet for this city/bedroom combination — use your general knowledge of Ontario rental markets in London, St. Thomas, and Strathroy.`;

  const prompt = `You are a rental market expert in Ontario, Canada. A landlord has submitted details about their property for a rent analysis. Write a personalized 3–4 paragraph analysis in plain prose (no bullet points, no markdown, no headers). Be specific with dollar amounts. Be direct and actionable.

Property details:
- City: ${submission.city}
- Unit type: ${unitTypeLabel}
- Bedrooms: ${submission.bedrooms ?? "not specified"}
- Bathrooms: ${submission.bathrooms ?? "not specified"}
- Square footage: ${submission.sqft ?? "not specified"}
- Floor: ${submission.floor ?? "not specified"}
- Parking: ${submission.parking ? "yes" : submission.parking === false ? "no" : "not specified"}
- Laundry: ${submission.laundry ?? "not specified"}
- Utilities included: ${submission.utilities_included ? "yes" : submission.utilities_included === false ? "no" : "not specified"}
- Pet friendly: ${submission.pet_friendly ? "yes" : submission.pet_friendly === false ? "no" : "not specified"}
- ${submission.is_asking_rent ? "Asking rent" : "Current tenant rent"}: $${submission.rent_amount}/mo
- Currently occupied: ${submission.is_occupied ? "yes" : submission.is_occupied === false ? "no" : "not specified"}

${marketContext}

In your analysis:
1. Tell them where their rent sits relative to the market (above/below/at market rate)
2. Give them a specific recommended rent range for their unit given its features
3. Mention 1–2 features of their unit that most impact their rent potential (positively or negatively)
4. One actionable next step

Write as if you're Ebin, a local property manager who knows Southwest Ontario well. Warm but direct. Sign off with "— Ebin, Prospera Properties".`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 900,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function computeMarketEstimates(): Promise<{ updated: number; skipped: number }> {
  // Call the RPC function defined in Supabase
  const { data: rows, error } = await supabaseAdmin.rpc("compute_rent_percentiles");

  if (error) {
    console.error("computeMarketEstimates RPC error:", error);
    throw error;
  }

  if (!rows || rows.length === 0) return { updated: 0, skipped: 0 };

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const prompt = `You are a rental market analyst. Write exactly 2 sentences for Ontario landlords. Plain prose, no markdown, no bullet points. Be specific with dollar amounts.

${row.city}, ${row.bedrooms}-bedroom units — ${row.submission_count} reports (last 90 days)
25th pct: $${row.p25}/mo | Median: $${row.median}/mo | 75th pct: $${row.p75}/mo

Describe where the market sits and one actionable takeaway for a landlord pricing their unit.`;

    let narrative = "";
    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      });
      narrative = response.content[0].type === "text" ? response.content[0].text : "";
      updated++;
    } catch (err) {
      console.error(`Claude narrative error for ${row.city}/${row.bedrooms}:`, err);
      skipped++;
    }

    await supabaseAdmin.from("rent_market_data").upsert(
      {
        city: row.city,
        bedrooms: row.bedrooms,
        unit_type: null,
        computed_at: new Date().toISOString(),
        submission_count: Number(row.submission_count),
        p25_rent: row.p25,
        median_rent: row.median,
        p75_rent: row.p75,
        market_narrative: narrative,
        trend_direction: "insufficient_data",
        is_published: true,
      },
      { onConflict: "city,bedrooms,unit_type" }
    );
  }

  return { updated, skipped };
}
