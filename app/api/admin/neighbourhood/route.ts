import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
const WALK_SCORE_API_KEY = process.env.WALK_SCORE_API_KEY || "";

const PLACE_CATEGORIES = [
  { type: "grocery_or_supermarket", label: "Grocery Stores" },
  { type: "pharmacy", label: "Pharmacies" },
  { type: "gym", label: "Gyms" },
  { type: "transit_station", label: "Transit Stops" },
  { type: "school", label: "Schools" },
  { type: "hospital", label: "Hospitals" },
  { type: "park", label: "Parks" },
  { type: "restaurant", label: "Restaurants" },
  { type: "cafe", label: "Cafés" },
  { type: "bank", label: "Banks" },
];

// Popular Canadian chains and landmarks tenants actually search for
const POPULAR_KEYWORD_SEARCHES = [
  "Tim Hortons",
  "Costco",
  "Real Canadian Superstore",
  "Walmart",
  "Giant Tiger",
  "No Frills",
  "Food Basics",
  "Shoppers Drug Mart",
  "LCBO",
  "Canadian Tire",
  "Dollar Tree",
  "Dollarama",
  "McDonald's",
  "Starbucks",
  "Pizza Pizza",
  "FreshCo",
  "Metro",
];

interface PlaceResult {
  name: string;
  vicinity: string;
  rating?: number;
  place_id: string;
  geometry: { location: { lat: number; lng: number } };
}

function roundCoord(n: number): number {
  return Math.round(n * 1000) / 1000; // ~111m precision
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateWalkTime(distKm: number): string {
  const minutes = Math.round(distKm / 0.08); // ~5 km/h walking speed
  if (minutes <= 1) return "1 min walk";
  return `${minutes} min walk`;
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  let { latitude, longitude } = body;
  const { address, city } = body;

  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: "Google Maps API key not configured. Add GOOGLE_MAPS_API_KEY to your environment variables." }, { status: 500 });
  }

  // Step 1: Geocode if needed
  if (!latitude || !longitude) {
    if (!address || !city) {
      return NextResponse.json({ error: "Address and city are required" }, { status: 400 });
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${address}, ${city}, Ontario, Canada`)}&key=${GOOGLE_API_KEY}`;
    const geoRes = await fetch(geocodeUrl);
    const geoData = await geoRes.json();

    if (geoData.status !== "OK" || !geoData.results?.[0]) {
      return NextResponse.json({ error: `Geocoding failed: ${geoData.status}. Check the address.` }, { status: 400 });
    }

    latitude = geoData.results[0].geometry.location.lat;
    longitude = geoData.results[0].geometry.location.lng;
  }

  const supabase = getSupabaseAdmin();
  const latKey = roundCoord(latitude);
  const lngKey = roundCoord(longitude);

  // Step 2: Check for nearby properties with existing neighbourhood data (within ~1km)
  const { data: nearbyProps } = await supabase
    .from("properties")
    .select("id, neighbourhood_data, bus_routes, neighbourhood_vibe, walk_score, transit_score, bike_score")
    .gte("latitude", latitude - 0.009) // ~1km
    .lte("latitude", latitude + 0.009)
    .gte("longitude", longitude - 0.012)
    .lte("longitude", longitude + 0.012)
    .not("neighbourhood_data", "eq", "{}")
    .limit(3);

  let reusedData: Record<string, unknown[]> | null = null;
  let reusedMeta: { bus_routes?: unknown[]; neighbourhood_vibe?: string; walk_score?: number; transit_score?: number; bike_score?: number } | null = null;

  if (nearbyProps?.length) {
    // Use the nearest property's neighbourhood data as a starting point
    const nearest = nearbyProps[0];
    const nd = nearest.neighbourhood_data as Record<string, unknown[]>;
    if (nd && Object.keys(nd).length > 0) {
      reusedData = nd;
      reusedMeta = {
        bus_routes: nearest.bus_routes as unknown[] || undefined,
        neighbourhood_vibe: nearest.neighbourhood_vibe as string || undefined,
        walk_score: nearest.walk_score as number || undefined,
        transit_score: nearest.transit_score as number || undefined,
        bike_score: nearest.bike_score as number || undefined,
      };
    }
  }

  // Step 3: Check neighbourhood_cache
  const { data: cached } = await supabase
    .from("neighbourhood_cache")
    .select("category, data")
    .eq("lat_key", latKey)
    .eq("lng_key", lngKey)
    .gt("expires_at", new Date().toISOString());

  const cachedCategories = new Map((cached || []).map((c: { category: string; data: unknown }) => [c.category, c.data]));

  // If we have reused data from a nearby property and no cache, use it as baseline
  // (Google API calls will still run to get fresh data, but this gives immediate results)

  // Step 4: Fetch missing categories from Google Places
  const places: Record<string, unknown[]> = {};

  // Pre-fill from reused nearby property data
  if (reusedData) {
    for (const [key, val] of Object.entries(reusedData)) {
      if (Array.isArray(val) && val.length > 0) {
        places[key] = val;
      }
    }
  }

  for (const cat of PLACE_CATEGORIES) {
    if (cachedCategories.has(cat.type)) {
      places[cat.type] = cachedCategories.get(cat.type) as unknown[];
      continue;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&rankby=distance&type=${cat.type}&key=${GOOGLE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK" && data.results) {
        const results = (data.results as PlaceResult[]).slice(0, 8).map((p) => {
          const dist = haversineDistance(latitude, longitude, p.geometry.location.lat, p.geometry.location.lng);
          return {
            name: p.name,
            vicinity: p.vicinity,
            rating: p.rating || null,
            place_id: p.place_id,
            distance: `${(dist * 1000).toFixed(0)}m`,
            walk_time: estimateWalkTime(dist),
          };
        });

        // Sort by distance
        results.sort((a, b) => parseInt(a.distance) - parseInt(b.distance));
        places[cat.type] = results;

        // Cache the results
        await supabase.from("neighbourhood_cache").upsert({
          lat_key: latKey,
          lng_key: lngKey,
          category: cat.type,
          data: results,
          fetched_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: "lat_key,lng_key,category" });
      } else {
        places[cat.type] = [];
      }
    } catch (err) {
      console.error(`[neighbourhood] Failed to fetch ${cat.type}:`, err);
      places[cat.type] = [];
    }
  }

  // Step 3b: Search for popular Canadian chains (wider 5km radius for big-box)
  if (!cachedCategories.has("popular_spots") && !places["popular_spots"]) {
    const popularResults: { name: string; vicinity: string; rating: number | null; place_id: string; distance: string; walk_time: string }[] = [];
    const seenPlaceIds = new Set<string>();

    // Run keyword searches in parallel (batches of 5 to avoid rate limits)
    for (let i = 0; i < POPULAR_KEYWORD_SEARCHES.length; i += 5) {
      const batch = POPULAR_KEYWORD_SEARCHES.slice(i, i + 5);
      const batchResults = await Promise.allSettled(
        batch.map(async (keyword) => {
          const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&rankby=distance&keyword=${encodeURIComponent(keyword)}&key=${GOOGLE_API_KEY}`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.status === "OK" && data.results?.length) {
            // Sort by actual distance and take the closest, not Google's prominence ranking
            const sorted = (data.results as PlaceResult[]).sort((a, b) => {
              const distA = haversineDistance(latitude, longitude, a.geometry.location.lat, a.geometry.location.lng);
              const distB = haversineDistance(latitude, longitude, b.geometry.location.lat, b.geometry.location.lng);
              return distA - distB;
            });
            return sorted[0];
          }
          return null;
        })
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled" && result.value && !seenPlaceIds.has(result.value.place_id)) {
          const p = result.value;
          seenPlaceIds.add(p.place_id);
          const dist = haversineDistance(latitude, longitude, p.geometry.location.lat, p.geometry.location.lng);
          popularResults.push({
            name: p.name,
            vicinity: p.vicinity,
            rating: p.rating || null,
            place_id: p.place_id,
            distance: `${(dist * 1000).toFixed(0)}m`,
            walk_time: dist <= 2 ? estimateWalkTime(dist) : `${(dist).toFixed(1)} km`,
          });
        }
      }
    }

    // Sort by distance
    popularResults.sort((a, b) => parseInt(a.distance) - parseInt(b.distance));
    places["popular_spots"] = popularResults;

    // Cache
    if (popularResults.length > 0) {
      await supabase.from("neighbourhood_cache").upsert({
        lat_key: latKey,
        lng_key: lngKey,
        category: "popular_spots",
        data: popularResults,
        fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: "lat_key,lng_key,category" });
    }
  }

  // Step 4: Walk Score (optional)
  let walk_score: number | null = null;
  let transit_score: number | null = null;
  let bike_score: number | null = null;

  if (WALK_SCORE_API_KEY) {
    try {
      const wsUrl = `https://api.walkscore.com/score?format=json&address=${encodeURIComponent(`${address}, ${city}, ON`)}&lat=${latitude}&lon=${longitude}&transit=1&bike=1&wsapikey=${WALK_SCORE_API_KEY}`;
      const wsRes = await fetch(wsUrl);
      const wsData = await wsRes.json();

      if (wsData.status === 1) {
        walk_score = wsData.walkscore ?? null;
        transit_score = wsData.transit?.score ?? null;
        bike_score = wsData.bike?.score ?? null;
      }
    } catch (err) {
      console.error("[neighbourhood] Walk Score failed:", err);
    }
  }

  // Step 5: Bus routes — use Google Directions API to find transit routes to downtown
  let bus_routes: { route: string; stop_name: string; frequency: string; walk_time: string }[] = [];

  try {
    // Query transit directions to downtown London to discover route numbers
    const downtowns: Record<string, string> = {
      "London": "Dundas St & Richmond St, London, ON",
      "St. Thomas": "Talbot St & Railway St, St. Thomas, ON",
      "Strathroy": "Frank St & Centre St, Strathroy, ON",
    };
    // Match city name flexibly
    const cityStr = String(city || "").trim();
    const matchedCity = Object.keys(downtowns).find((k) => cityStr.toLowerCase().includes(k.toLowerCase()));
    const destination = matchedCity ? downtowns[matchedCity] : downtowns["London"];

    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${latitude},${longitude}&destination=${encodeURIComponent(destination)}&mode=transit&alternatives=true&key=${GOOGLE_API_KEY}`;
    const dirRes = await fetch(directionsUrl);
    const dirData = await dirRes.json();

    if (dirData.status === "OK" && dirData.routes) {
      const seenRoutes = new Set<string>();

      for (const route of dirData.routes) {
        for (const leg of route.legs || []) {
          for (const step of leg.steps || []) {
            if (step.travel_mode === "TRANSIT" && step.transit_details) {
              const td = step.transit_details;
              const routeNum = td.line?.short_name || td.line?.name || "";
              const stopName = td.departure_stop?.name || "";

              if (routeNum && !seenRoutes.has(routeNum)) {
                seenRoutes.add(routeNum);
                bus_routes.push({
                  route: routeNum,
                  stop_name: stopName,
                  frequency: td.headway ? `Every ${Math.round(td.headway / 60)} min` : "",
                  walk_time: step.duration?.text || "",
                });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("[neighbourhood] Transit directions failed:", err);
  }

  // Fallback: use transit station names from Places if Directions returned nothing
  if (bus_routes.length === 0) {
    const transitStops = (places.transit_station || []) as { name: string; distance: string; walk_time: string }[];
    bus_routes = transitStops.slice(0, 5).map((stop) => ({
      route: "",
      stop_name: stop.name,
      frequency: "",
      walk_time: stop.walk_time,
    }));
  }

  // Estimate scores from Google Places data if Walk Score API unavailable
  if (!walk_score && !reusedMeta?.walk_score) {
    // Score based on how many amenity categories have places within walking distance
    const categories = ["grocery_or_supermarket", "pharmacy", "restaurant", "cafe", "bank", "park"];
    const nearbyCount = categories.filter((cat) => {
      const list = places[cat] as { distance?: string }[] || [];
      return list.some((p) => parseInt(p.distance || "9999") < 1000); // within 1km
    }).length;
    walk_score = Math.min(100, Math.round((nearbyCount / categories.length) * 85 + 10));
  }

  if (!transit_score && !reusedMeta?.transit_score) {
    const transitCount = (places.transit_station as unknown[] || []).length;
    transit_score = transitCount >= 5 ? 75 : transitCount >= 3 ? 60 : transitCount >= 1 ? 45 : 25;
  }

  if (!bike_score && !reusedMeta?.bike_score) {
    // Estimate bike score: if walkable + has parks/cafes nearby, likely bikeable
    bike_score = walk_score ? Math.min(100, Math.round(walk_score * 0.85)) : 50;
  }

  const finalWalkScore = walk_score ?? reusedMeta?.walk_score ?? null;
  const finalTransitScore = transit_score ?? reusedMeta?.transit_score ?? null;
  const finalBikeScore = bike_score ?? reusedMeta?.bike_score ?? null;

  // Build categories array for listing page display
  const CATEGORY_LABELS: Record<string, string> = {
    grocery_or_supermarket: "Grocery Stores",
    pharmacy: "Pharmacies",
    gym: "Gyms & Fitness",
    transit_station: "Transit Stops",
    school: "Schools",
    hospital: "Hospitals & Clinics",
    park: "Parks",
    restaurant: "Restaurants",
    cafe: "Cafés",
    bank: "Banks",
    popular_spots: "Popular Spots",
  };

  const categories = Object.entries(places)
    .filter(([, list]) => Array.isArray(list) && list.length > 0)
    .map(([key, list]) => ({
      name: CATEGORY_LABELS[key] || key,
      places: (list as { name: string; distance?: string; walk_time?: string }[]).slice(0, 8).map((p) => ({
        name: p.name,
        distance: p.walk_time || p.distance || undefined,
      })),
    }));

  // Include both raw places and formatted categories
  const neighbourhoodData = { ...places, categories };

  return NextResponse.json({
    latitude,
    longitude,
    places: neighbourhoodData,
    walk_score: finalWalkScore,
    transit_score: finalTransitScore,
    bike_score: finalBikeScore,
    bus_routes: bus_routes.length > 0 ? bus_routes : (reusedMeta?.bus_routes || []),
    neighbourhood_vibe: reusedMeta?.neighbourhood_vibe || null,
    reused_from_nearby: !!reusedData,
  });
}
