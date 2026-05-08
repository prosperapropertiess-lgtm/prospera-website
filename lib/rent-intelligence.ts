import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface RentToken {
  id: string;
  token: string;
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  bedrooms: number | null;
  created_at: string;
  used_at: string | null;
  expires_at: string;
}

export interface RentSubmission {
  city: string;
  city_zone?: string | null;
  address?: string | null;
  property_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  half_bathrooms?: number | null;
  sqft?: number | null;
  floor?: number | null;
  building_era?: string | null;
  units_in_building?: number | null;
  separate_entrance?: boolean | null;
  garage?: string | null;
  parking_spots?: number | null;
  visitor_parking?: boolean | null;
  backyard?: boolean | null;
  balcony?: boolean | null;
  lawn_care?: string | null;
  furnished?: string | null;
  heat_type?: string | null;
  ac_type?: string | null;
  appliance_fridge?: boolean | null;
  appliance_stove?: boolean | null;
  appliance_dishwasher?: boolean | null;
  appliance_washer?: boolean | null;
  appliance_dryer?: boolean | null;
  laundry?: string | null;
  utilities_included?: string | null;
  pet_friendly?: boolean | null;
  amenities?: string | null;
  condo_fees_included?: boolean | null;
  newly_renovated?: boolean | null;
  upkeep_rating?: number | null;
  rent_amount: number;
  is_asking_rent?: boolean;
  previous_rent?: number | null;
  is_occupied?: boolean | null;
  last_rent_increase?: string | null;
  neighbouring_rent?: number | null;
  lease_preference?: string | null;
  available_date?: string | null;
  transit_distance_min?: number | null;
  landlord_style?: string | null;
  special_features?: string | null;
  remarks?: string | null;
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

function yn(val: boolean | null | undefined): string {
  if (val === true) return "yes";
  if (val === false) return "no";
  return "not specified";
}

export async function generatePropertyAnalysis(
  submission: RentSubmission,
  marketData: MarketData | null
): Promise<string> {
  const bedsLabel = submission.bedrooms ? `${submission.bedrooms}-bedroom` : "rental";

  const appliances = [
    submission.appliance_fridge && "fridge",
    submission.appliance_stove && "stove",
    submission.appliance_dishwasher && "dishwasher",
    submission.appliance_washer && "washer",
    submission.appliance_dryer && "dryer",
  ].filter(Boolean).join(", ") || "not specified";

  const marketContext = marketData?.median_rent
    ? `Market data for ${marketData.city}, ${bedsLabel} units (${marketData.submission_count} reports, last 90 days):
- 25th percentile: $${marketData.p25_rent}/mo
- Median: $${marketData.median_rent}/mo
- 75th percentile: $${marketData.p75_rent}/mo
- Trend: ${marketData.trend_direction || "insufficient data"}`
    : `No aggregated market data yet — use your knowledge of Ontario rental markets in London, St. Thomas, and Strathroy.`;

  const prompt = `You are a rental market expert in Ontario, Canada. A landlord submitted detailed property information for a rent analysis. Write a personalized 3–4 paragraph analysis in plain prose. No bullet points, no markdown, no headers. Be specific with dollar amounts. Be direct and actionable.

PROPERTY DETAILS:
Location: ${submission.city}${submission.city_zone ? `, ${submission.city_zone.replace("_", " ")} area` : ""}${submission.address ? ` — ${submission.address}` : ""}
Type: ${submission.property_type || "not specified"} | ${bedsLabel} | ${submission.bathrooms ?? "?"}bd + ${submission.half_bathrooms ?? 0} half bath
Sqft: ${submission.sqft ?? "not specified"} | Floor: ${submission.floor ?? "n/a"} | Built: ${submission.building_era?.replace(/_/g, " ") ?? "not specified"}
Units in building: ${submission.units_in_building ?? "not specified"} | Separate entrance: ${yn(submission.separate_entrance)}

Parking: ${submission.garage !== "none" ? `${submission.garage?.replace("_", " ")} garage` : "no garage"}, ${submission.parking_spots ?? 0} spot(s), visitor parking: ${yn(submission.visitor_parking)}
Outdoor: backyard ${yn(submission.backyard)}, balcony ${yn(submission.balcony)}, lawn care: ${submission.lawn_care?.replace("_", " ") ?? "not specified"}

Furnished: ${submission.furnished?.replace("_", " ") ?? "unfurnished"} | Heat: ${submission.heat_type ?? "not specified"} | AC: ${submission.ac_type?.replace("_", " ") ?? "not specified"}
Appliances included: ${appliances}
Laundry: ${submission.laundry ?? "not specified"} | Utilities: ${submission.utilities_included ?? "not specified"}
Pets: ${yn(submission.pet_friendly)} | Amenities: ${submission.amenities || "none listed"} | Condo fees included: ${yn(submission.condo_fees_included)}

Condition: renovated ${yn(submission.newly_renovated)}, upkeep ${submission.upkeep_rating ? `${submission.upkeep_rating}/10` : "not rated"}
Transit: ${submission.transit_distance_min ? `${submission.transit_distance_min} min walk to bus` : "not specified"}
Lease preference: ${submission.lease_preference?.replace("_", " ") ?? "not specified"} | Available: ${submission.available_date ?? "not specified"}

Rent: $${submission.rent_amount}/mo (${submission.is_asking_rent ? "asking" : "current tenant"})
${submission.previous_rent ? `Previously rented: $${submission.previous_rent}/mo` : ""}
${submission.neighbouring_rent ? `Neighbouring unit: $${submission.neighbouring_rent}/mo` : ""}
Landlord style: ${submission.landlord_style?.replace("_", " ") ?? "not specified"}
${submission.special_features ? `Special features: ${submission.special_features}` : ""}
${submission.remarks ? `Remarks: ${submission.remarks}` : ""}

${marketContext}

In your analysis:
1. Where does their rent sit vs the market — are they underpriced, overpriced, or at market?
2. Give a specific recommended rent range for their exact unit given all its features
3. The 2–3 features that most impact their rent potential (up or down)
4. One concrete next step they should take

Write as Ebin, a local property manager who knows Southwest Ontario well. Warm but direct. Sign off with "— Ebin, Prospera Properties".`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function computeMarketEstimates(): Promise<{ updated: number; skipped: number }> {
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
        property_type: null,
        city_zone: null,
        computed_at: new Date().toISOString(),
        submission_count: Number(row.submission_count),
        p25_rent: row.p25,
        median_rent: row.median,
        p75_rent: row.p75,
        market_narrative: narrative,
        trend_direction: "insufficient_data",
        is_published: true,
      },
      { onConflict: "city,bedrooms,property_type,city_zone" }
    );
  }

  return { updated, skipped };
}
