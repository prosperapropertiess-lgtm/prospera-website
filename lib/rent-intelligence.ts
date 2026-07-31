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
  submitter_role: string | null;
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

export interface Comparable {
  city: string;
  city_zone: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  rent_amount: number;
  garage: string | null;
  parking_spots: number | null;
  utilities_included: string | null;
  laundry: string | null;
  furnished: string | null;
  source_note: string | null;
  source_url: string | null;
  submitted_at: string;
}

export async function getComparables(submission: RentSubmission, limit = 5): Promise<Comparable[]> {
  let query = supabaseAdmin
    .from("rent_submissions")
    .select("city, city_zone, property_type, bedrooms, bathrooms, sqft, rent_amount, garage, parking_spots, utilities_included, laundry, furnished, source_note, remarks, submitted_at")
    .eq("submission_type", "scraped")
    .eq("city", submission.city)
    .gte("submitted_at", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
    .order("submitted_at", { ascending: false });

  if (submission.bedrooms != null) {
    query = query.eq("bedrooms", submission.bedrooms);
  }

  const { data } = await query.limit(limit * 3);
  if (!data || data.length === 0) return [];

  return data
    .map((r) => ({
      city: r.city,
      city_zone: r.city_zone ?? null,
      property_type: r.property_type ?? null,
      bedrooms: r.bedrooms ?? null,
      bathrooms: r.bathrooms ?? null,
      sqft: r.sqft ?? null,
      rent_amount: r.rent_amount,
      garage: r.garage ?? null,
      parking_spots: r.parking_spots ?? null,
      utilities_included: r.utilities_included ?? null,
      laundry: r.laundry ?? null,
      furnished: r.furnished ?? null,
      source_note: r.source_note ?? null,
      source_url: typeof r.remarks === "string" && r.remarks.startsWith("Source: ")
        ? r.remarks.replace("Source: ", "").trim()
        : null,
      submitted_at: r.submitted_at,
    }))
    .slice(0, limit);
}

export async function validateRentToken(token: string, allowUsed = false): Promise<RentToken | null> {
  let query = supabaseAdmin
    .from("rent_analysis_tokens")
    .select("*")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString());

  if (!allowUsed) {
    query = query.is("used_at", null);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data as RentToken;
}

function yn(val: boolean | null | undefined): string {
  if (val === true) return "yes";
  if (val === false) return "no";
  return "not specified";
}

// Strip characters that could manipulate the prompt
function sanitize(val: string | null | undefined): string | null {
  if (!val) return null;
  return val
    .replace(/[<>]/g, "")
    .replace(/\bignore\b.*\binstructions?\b/gi, "")
    .slice(0, 500)
    .trim() || null;
}

export async function generatePropertyAnalysis(
  submission: RentSubmission,
  marketData: MarketData | null,
  comparables?: Comparable[]
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

  const prompt = `You are Laura — a plain-talking property expert with 20 years managing rentals in Southwest Ontario. You have placed 25+ tenants, handled hundreds of rent reviews, and watched landlords leave thousands of dollars on the table because nobody gave them straight advice.

A landlord just shared their property details with you. Write them a full, personal rent analysis. This is the email they will receive. Make it so useful, so specific, so clear — that when they finish reading it, they think "holy shit, this is gold."

LANGUAGE — non-negotiable:
- Grade 5 reading level. Short sentences. Simple words. Write like you are talking to a smart friend, not giving a lecture.
- No jargon. Never say: percentile, robust, optimize, leverage, utilize, comprehensive, actionable insights, landlord-tenant dynamics, in conclusion, it is worth noting.
- Use real dollar numbers always. Never say "higher rent" — say "$100 more per month".
- Be direct. If they are undercharging, say it. If they are overpriced, say that too.
- Give examples of real situations. "We had a landlord on Richmond Street charging $1,450 for a similar unit — once they added in-unit laundry, they got $1,600 with 3 applicants in 48 hours."
- Mention what other landlords in the area are doing where relevant. Social proof makes the advice land.

FORMATTING:
- Use ## for section headings
- Use **bold** on key numbers and the single most important recommendation in each section
- Use bullet points (- item) for lists of factors
- Keep paragraphs short — 2 to 4 sentences max
- Sign off at the very end with: — Laura, Prospera Properties

STRUCTURE — follow this exactly:

## The honest verdict on your rent
Start with a clear, direct statement of where their rent sits. Is it fair, low, or high for their specific unit and area? Give them a realistic target range in dollar numbers. Reference the market data if available. Make them feel like they finally have a straight answer.

## What the data says
Summarize what the market data shows in plain language. How many rentals are we tracking? What are most similar units going for? Where does their unit sit in that range? If no market data is available, say so honestly and use your knowledge of the Southwest Ontario market instead. Never use the word "percentile."

## What's pushing your rent up
List 2–4 features of their property that add real value. Be specific about the dollar impact where you can. Examples: "In-unit laundry adds $75–$125/month in this market." "A garage is worth $100–$175/month depending on location." "Newly renovated units are renting $150–$200 above comparable older ones."

## What's holding your rent back (if anything)
List 1–3 features that are limiting the rent, or skip this section entirely if there are no real negatives. Be honest but constructive. Example: "No AC is a real disadvantage in summer — tenants are actively filtering it out on listings sites. A window unit costs $300 and can add $50–75/month to your asking rent."

## What similar landlords are doing
This section builds proof and trust. Share what landlords with similar units in the area are charging, what changes they've made, and what results they've seen. Be specific and realistic. Examples: "Most 2-bedroom units in south London with in-unit laundry are listing at $1,700–$1,850." "Landlords who include water in the rent are filling units 30–40% faster." Make it feel like insider knowledge they couldn't find anywhere else.

## What to do right now
One clear action. Not vague. Not "consider raising your rent." Tell them exactly what to do, by when, and what to expect. If they should raise rent — by how much, and when to do it (e.g. on renewal, immediately, with 90 days notice). If they should change something — what specifically and how it will affect rent. If they are priced well — confirm it and tell them what to watch for.

## One thing most landlords get wrong
End with a short, punchy insight that feels like a secret — something most landlords don't know that directly applies to their situation. This is the section that makes them feel like they got the inside scoop. Keep it to 2–3 sentences. Example: "Most landlords think adding a dishwasher is a big deal. In this market, tenants care way more about laundry access. If you only have budget for one upgrade, go laundry every time."

PROPERTY DETAILS:
Location: ${submission.city}${submission.city_zone ? `, ${submission.city_zone.replace(/_/g, " ")} area` : ""}${submission.address ? ` — ${submission.address}` : ""}
Type: ${submission.property_type || "not specified"} | ${bedsLabel} | ${submission.bathrooms ?? "?"}bd + ${submission.half_bathrooms ?? 0} half bath
Sqft: ${submission.sqft ?? "not specified"} | Floor: ${submission.floor ?? "n/a"} | Built: ${submission.building_era?.replace(/_/g, " ") ?? "not specified"}
Units in building: ${submission.units_in_building ?? "not specified"} | Separate entrance: ${yn(submission.separate_entrance)}

Parking: ${submission.garage !== "none" ? `${submission.garage?.replace(/_/g, " ")} garage` : "no garage"}, ${submission.parking_spots ?? 0} spot(s), visitor parking: ${yn(submission.visitor_parking)}
Outdoor: backyard ${yn(submission.backyard)}, balcony ${yn(submission.balcony)}, lawn care: ${submission.lawn_care?.replace(/_/g, " ") ?? "not specified"}

Furnished: ${submission.furnished?.replace(/_/g, " ") ?? "unfurnished"} | Heat: ${submission.heat_type ?? "not specified"} | AC: ${submission.ac_type?.replace(/_/g, " ") ?? "not specified"}
Appliances included: ${appliances}
Laundry: ${submission.laundry ?? "not specified"} | Utilities: ${submission.utilities_included ?? "not specified"}
Pets: ${yn(submission.pet_friendly)} | Amenities: ${submission.amenities || "none listed"} | Condo fees included: ${yn(submission.condo_fees_included)}

Condition: renovated ${yn(submission.newly_renovated)}, upkeep ${submission.upkeep_rating ? `${submission.upkeep_rating}/10` : "not rated"}
Transit: ${submission.transit_distance_min ? `${submission.transit_distance_min} min walk to bus` : "not specified"}
Lease preference: ${submission.lease_preference?.replace(/_/g, " ") ?? "not specified"} | Available: ${submission.available_date ?? "not specified"}

Rent: $${submission.rent_amount}/mo (${submission.is_asking_rent ? "asking" : "current tenant rent"})
${submission.previous_rent ? `Previously rented at: $${submission.previous_rent}/mo` : ""}
${submission.neighbouring_rent ? `Neighbouring unit renting for: $${submission.neighbouring_rent}/mo` : ""}
Landlord style: ${submission.landlord_style?.replace(/_/g, " ") ?? "not specified"}
${sanitize(submission.special_features) ? `Special features: ${sanitize(submission.special_features)}` : ""}
${sanitize(submission.remarks) ? `Landlord notes: ${sanitize(submission.remarks)}` : ""}

${marketContext}

${comparables && comparables.length > 0 ? `REAL COMPARABLE LISTINGS (active in the last 60 days — use these to make your analysis concrete):
${comparables.map((c, i) => {
  const type = c.property_type ? c.property_type.replace(/_/g, " ") : "unit";
  const area = c.city_zone ? c.city_zone.replace(/_/g, " ") + " " + c.city : c.city;
  const features = [
    c.sqft ? `${c.sqft} sqft` : null,
    c.laundry ? `laundry: ${c.laundry.replace(/_/g, " ")}` : null,
    c.utilities_included && c.utilities_included !== "none" ? `utilities: ${c.utilities_included.replace(/_/g, "+")}` : null,
    c.parking_spots ? `${c.parking_spots} parking` : null,
    c.garage && c.garage !== "none" ? `${c.garage.replace(/_/g, " ")} garage` : null,
  ].filter(Boolean).join(", ");
  return `${i + 1}. $${c.rent_amount}/mo — ${c.bedrooms ?? "?"}bd/${c.bathrooms ?? "?"}ba ${type} in ${area}${features ? ` (${features})` : ""}`;
}).join("\n")}

When you reference these in your analysis, describe them naturally (e.g. "a similar 2-bedroom on the south side is asking $1,650") — do NOT paste the URLs in your text. The client will see the actual listing links in a separate section below your analysis.` : ""}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text.trim() : "";
  if (!text) throw new Error("Claude returned empty analysis");
  return text;
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
    const prompt = `You know ${row.city} rental market cold. Write exactly 2 sentences for a landlord who owns a ${row.bedrooms}-bedroom unit there. Simple words, grade 5 reading level, no jargon. Real dollar numbers only — no vague language. First sentence: where the market sits right now. Second sentence: one thing they should do with that information.

Data: ${row.submission_count} reports from the last 90 days. Low end $${row.p25}/mo, middle $${row.median}/mo, high end $${row.p75}/mo.`;

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

    // Delete first — NULL columns in the conflict key (property_type, city_zone)
    // are treated as distinct by Postgres, so upsert stacks duplicates instead
    // of updating. Delete-then-insert is the safe pattern here.
    await supabaseAdmin
      .from("rent_market_data")
      .delete()
      .eq("city", row.city)
      .eq("bedrooms", row.bedrooms)
      .is("property_type", null)
      .is("city_zone", null);

    await supabaseAdmin.from("rent_market_data").insert({
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
      trend_direction: row.submission_count >= 10 ? "stable" : "insufficient_data",
      is_published: true,
    });
  }

  return { updated, skipped };
}
