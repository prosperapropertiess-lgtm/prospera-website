import { NextRequest, NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";

export async function POST(req: NextRequest) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { origin, destination, modes } = body;

  if (!origin || !destination) {
    return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 });
  }

  const requestedModes = modes || ["driving", "transit", "walking"];
  const results: Record<string, { duration: string; distance: string }> = {};

  for (const mode of requestedModes) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&mode=${mode}&key=${GOOGLE_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK" && data.rows?.[0]?.elements?.[0]?.status === "OK") {
        const element = data.rows[0].elements[0];
        results[mode] = {
          duration: element.duration.text,
          distance: element.distance.text,
        };
      }
    } catch (err) {
      console.error(`[commute] Failed for mode ${mode}:`, err);
    }
  }

  return NextResponse.json(results);
}
