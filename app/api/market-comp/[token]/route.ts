import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Comparable {
  address: string;
  rent: number;
  days_on_market: number | null;
  ad_description: string;
  bedrooms?: number;
  bathrooms?: number;
  neighbourhood_data?: Record<string, unknown[]>;
  walk_score?: number;
  transit_score?: number;
  bike_score?: number;
  bus_routes?: Array<{ route: string; stop_name: string }>;
  latitude?: number;
  longitude?: number;
}

interface NeighbourhoodPlace {
  name: string;
  address?: string;
  distance?: number;
  walk_time?: number;
  rating?: number;
  place_id?: string;
}

// ── Haversine (used server-side for ordering but client computes display) ─────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Google Maps neighbourhood fetch ──────────────────────────────────────────

const NEIGHBOURHOOD_CATEGORIES: Record<string, string> = {
  grocery: "grocery_or_supermarket",
  pharmacy: "pharmacy",
  transit: "transit_station",
  schools: "school",
  parks: "park",
  restaurants: "restaurant",
  cafes: "cafe",
  banks: "bank",
  gyms: "gym",
  hospitals: "hospital",
};

async function fetchPlacesForCategory(
  lat: number,
  lng: number,
  type: string,
  radius = 1000
): Promise<NeighbourhoodPlace[]> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", String(radius));
  url.searchParams.set("type", type);
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 604800 } });
    const json = await res.json();
    if (json.status !== "OK" && json.status !== "ZERO_RESULTS") return [];

    return (json.results ?? []).slice(0, 10).map((p: Record<string, unknown>) => {
      const geometry = p.geometry as Record<string, unknown> | undefined;
      const location = geometry?.location as Record<string, number> | undefined;
      const placeLat = location?.lat ?? 0;
      const placeLng = location?.lng ?? 0;
      const distKm = haversineKm(lat, lng, placeLat, placeLng);
      return {
        name: p.name as string,
        address: p.vicinity as string | undefined,
        distance: Math.round(distKm * 1000),
        walk_time: Math.round((distKm / 5) * 60),
        rating: p.rating as number | undefined,
        place_id: p.place_id as string | undefined,
      } satisfies NeighbourhoodPlace;
    });
  } catch {
    return [];
  }
}

async function fetchNeighbourhoodData(
  lat: number,
  lng: number
): Promise<Record<string, NeighbourhoodPlace[]>> {
  const entries = await Promise.all(
    Object.entries(NEIGHBOURHOOD_CATEGORIES).map(async ([key, type]) => {
      const places = await fetchPlacesForCategory(lat, lng, type);
      return [key, places] as const;
    })
  );
  return Object.fromEntries(entries);
}

async function fetchWalkScore(
  lat: number,
  lng: number,
  address: string
): Promise<{ walk: number; transit: number; bike: number }> {
  const apiKey = process.env.WALK_SCORE_API_KEY;
  if (!apiKey) return { walk: 0, transit: 0, bike: 0 };

  try {
    const url = new URL("https://api.walkscore.com/score");
    url.searchParams.set("format", "json");
    url.searchParams.set("address", address);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("transit", "1");
    url.searchParams.set("bike", "1");
    url.searchParams.set("wsapikey", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 604800 } });
    const json = await res.json();
    return {
      walk: json.walkscore ?? 0,
      transit: json.transit?.score ?? 0,
      bike: json.bike?.score ?? 0,
    };
  } catch {
    return { walk: 0, transit: 0, bike: 0 };
  }
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sb = getSupabaseAdmin();

  const { data, error } = await sb
    .from("onboarding_sessions")
    .select(
      "token, owner_name, property_address, property_city, property_type, service_type, approx_monthly_rent, bedrooms, bathrooms, parking_spots, parking_type, property_condition, owner_action_items, rent_low, rent_market, rent_premium, comparables, created_at"
    )
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const comparables: Comparable[] = Array.isArray(data.comparables)
    ? (data.comparables as Comparable[])
    : [];

  // Enrich comparables that are missing neighbourhood_data
  const enriched = await Promise.all(
    comparables.map(async (comp) => {
      if (comp.neighbourhood_data || !comp.latitude || !comp.longitude) return comp;

      const [neighbourhoodData, scores] = await Promise.all([
        fetchNeighbourhoodData(comp.latitude, comp.longitude),
        fetchWalkScore(comp.latitude, comp.longitude, comp.address),
      ]);

      return {
        ...comp,
        neighbourhood_data: neighbourhoodData,
        walk_score: scores.walk,
        transit_score: scores.transit,
        bike_score: scores.bike,
      } satisfies Comparable;
    })
  );

  // Persist enriched comparables back if any changed
  const anyEnriched = enriched.some((e, i) => e !== comparables[i]);
  if (anyEnriched) {
    await sb
      .from("onboarding_sessions")
      .update({ comparables: enriched })
      .eq("token", token);
  }

  return NextResponse.json({ ...data, comparables: enriched });
}
