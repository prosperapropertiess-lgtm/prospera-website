import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { scrapeIngestNotificationEmail } from "@/lib/emails";

const VALID_CITIES = ["London", "St. Thomas", "Strathroy"];
const VALID_PROPERTY_TYPES = ["house", "apartment", "condo", "basement"];
const VALID_LAUNDRY = ["in_unit", "shared", "none"];
const VALID_FURNISHED = ["unfurnished", "semi_furnished", "fully_furnished"];
const VALID_GARAGES = ["none", "single", "double", "attached", "detached", "attached_single", "attached_double"];
const VALID_UTILITIES = ["none", "water", "hydro", "water_hydro", "water_hydro_gas", "all"];

const VALID_ZONES = ["north", "north_east", "north_west", "south", "south_east", "south_west", "east", "west", "downtown", "central"];

function normalizeZone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.toLowerCase().replace(/[\s-]/g, "_");
  if (VALID_ZONES.includes(v)) return v;
  // handle compressed forms like "northeast" → "north_east"
  const expanded = v
    .replace(/northeast/, "north_east")
    .replace(/northwest/, "north_west")
    .replace(/southeast/, "south_east")
    .replace(/southwest/, "south_west");
  return VALID_ZONES.includes(expanded) ? expanded : null;
}

function normalizeUtilities(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const v = raw.toLowerCase().replace(/\s/g, "");
  if (VALID_UTILITIES.includes(v)) return v;
  const hasHeat = v.includes("heat") || v.includes("gas");
  const hasHydro = v.includes("hydro") || v.includes("electric");
  const hasWater = v.includes("water");
  if (v.includes("all") || v.includes("everything")) return "all";
  if (hasHeat && hasHydro && hasWater) return "water_hydro_gas";
  if (hasHydro && hasWater) return "water_hydro";
  if (hasHydro) return "hydro";
  if (hasWater) return "water";
  return null;
}

interface ScrapedListing {
  city: string;
  city_zone?: string | null;
  property_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  rent_amount: number;
  garage?: string | null;
  parking_spots?: number | null;
  utilities_included?: string | null;
  pet_friendly?: boolean | null;
  laundry?: string | null;
  furnished?: string | null;
  source: string;
  source_url?: string | null;
  scraped_at?: string | null;
}

function clean(listing: ScrapedListing) {
  const city = VALID_CITIES.find(
    (c) => c.toLowerCase() === String(listing.city ?? "").toLowerCase()
  );
  if (!city) return null;

  const rent = Number(listing.rent_amount);
  if (!rent || isNaN(rent) || rent < 500 || rent > 15000) return null;

  return {
    submission_type: "scraped" as const,
    city,
    city_zone: normalizeZone(listing.city_zone),
    property_type: VALID_PROPERTY_TYPES.includes(listing.property_type ?? "")
      ? listing.property_type
      : null,
    bedrooms: listing.bedrooms != null ? Number(listing.bedrooms) : null,
    bathrooms: listing.bathrooms != null ? Number(listing.bathrooms) : null,
    sqft: listing.sqft ? Number(listing.sqft) : null,
    rent_amount: rent,
    is_asking_rent: true, // scraped listings are always asking rent
    garage: VALID_GARAGES.includes(listing.garage ?? "") ? listing.garage : "none",
    parking_spots: listing.parking_spots != null ? Number(listing.parking_spots) : 0,
    utilities_included: normalizeUtilities(listing.utilities_included),
    pet_friendly: listing.pet_friendly ?? null,
    laundry: VALID_LAUNDRY.includes(listing.laundry ?? "") ? listing.laundry : null,
    furnished: VALID_FURNISHED.includes(listing.furnished ?? "")
      ? listing.furnished
      : "unfurnished",
    source_note: listing.source ?? null,
    remarks: listing.source_url ? `Source: ${listing.source_url}` : null,
    submitted_at: listing.scraped_at ?? new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Auth
    if (!process.env.INGEST_SECRET || body.secret !== process.env.INGEST_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw: ScrapedListing[] = Array.isArray(body.listings) ? body.listings : [];

    console.log(`[ingest-scraped] body keys: ${Object.keys(body).join(", ")}`);
    console.log(`[ingest-scraped] listings type: ${typeof body.listings}, is array: ${Array.isArray(body.listings)}, length: ${raw.length}`);
    if (raw.length > 0) console.log(`[ingest-scraped] first listing sample: ${JSON.stringify(raw[0])}`);

    if (raw.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, skipped: 0, reason: "empty" });
    }

    // Clean and validate
    const cleaned = raw.map(clean).filter(Boolean) as ReturnType<typeof clean>[];
    const skipped = raw.length - cleaned.length;
    console.log(`[ingest-scraped] cleaned: ${cleaned.length}, skipped (invalid): ${skipped}`);

    if (cleaned.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, skipped, reason: "all_invalid" });
    }

    // Deduplicate against recent scraped entries (same city + bedrooms + rent + source in last 8 days)
    const { data: recent } = await supabaseAdmin
      .from("rent_submissions")
      .select("city, bedrooms, rent_amount, source_note")
      .eq("submission_type", "scraped")
      .gte("submitted_at", new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString());

    const seen = new Set(
      (recent ?? []).map(
        (r) => `${r.city}|${r.bedrooms}|${r.rent_amount}|${r.source_note}`
      )
    );

    const toInsert = cleaned.filter(
      (r) => r && !seen.has(`${r.city}|${r.bedrooms}|${r.rent_amount}|${r.source_note}`)
    );

    const duplicates = cleaned.length - toInsert.length;

    if (toInsert.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, skipped: skipped + duplicates, reason: "all_duplicates" });
    }

    // Insert in batches of 100
    let inserted = 0;
    for (let i = 0; i < toInsert.length; i += 100) {
      const batch = toInsert.slice(i, i + 100);
      const { error } = await supabaseAdmin.from("rent_submissions").insert(batch);
      if (error) {
        console.error("[ingest-scraped] Batch insert error:", error.message);
      } else {
        inserted += batch.length;
      }
    }

    console.log(`[ingest-scraped] inserted: ${inserted}, skipped: ${skipped}, duplicates: ${duplicates}`);

    // Email notification
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && inserted >= 5) {
      const cities: Record<string, number> = {};
      for (const r of toInsert) {
        if (r) cities[r.city] = (cities[r.city] ?? 0) + 1;
      }
      const source = raw[0]?.source ?? "unknown";
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Prospera Intelligence <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          subject: `Scrape complete — ${inserted} new listings ingested`,
          html: scrapeIngestNotificationEmail({
            inserted,
            skipped: skipped + duplicates,
            cities,
            source,
            scrapedAt: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("[ingest-scraped] Notification email failed:", err);
      }
    }

    return NextResponse.json({ success: true, inserted, skipped: skipped + duplicates });
  } catch (err) {
    console.error("[ingest-scraped] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
