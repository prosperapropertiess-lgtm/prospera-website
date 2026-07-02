import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });
  const body = await req.json();

  // Vibe-only mode: generate neighbourhood description — this is the PRIMARY selling copy
  if (body._vibe_only) {
    // Separate popular spots (selling points) from generic amenities
    const sellingPoints: string[] = [];
    const walkableAmenities: string[] = [];

    if (body.neighbourhood_data) {
      for (const [category, places] of Object.entries(body.neighbourhood_data)) {
        const list = places as { name: string; walk_time?: string; distance?: string }[];
        if (!list?.length || category === "categories") continue;

        if (category === "popular_spots") {
          for (const p of list.slice(0, 10)) {
            sellingPoints.push(`${p.name} (${p.walk_time || p.distance || "nearby"})`);
          }
        } else {
          const label: Record<string, string> = {
            grocery_or_supermarket: "Grocery",
            pharmacy: "Pharmacy",
            gym: "Gym",
            transit_station: "Transit",
            school: "School",
            hospital: "Hospital",
            park: "Park",
            restaurant: "Restaurant",
            cafe: "Café",
            bank: "Bank",
          };
          const top = list.slice(0, 3).map((p) => `${p.name} (${p.walk_time || p.distance || "nearby"})`);
          walkableAmenities.push(`${label[category] || category}: ${top.join(", ")}`);
        }
      }
    }

    const busInfo = body.bus_routes?.length
      ? body.bus_routes.map((r: { route: string; stop_name: string; walk_time?: string }) =>
          `Route ${r.route} at ${r.stop_name}${r.walk_time ? ` (${r.walk_time} walk)` : ""}`
        ).join(", ")
      : "none found";

    const vibePrompt = `You are writing the neighbourhood description for a rental property listing at ${body.address}, ${body.city}, Ontario. This is published on prosperaproperties.co.

This description is the PRIMARY selling copy for this location. It needs to help a prospective tenant picture their daily life here, and it needs to rank in Google for "${body.city} rental" and "${body.address} rental" searches.

LOCATION DATA:
Walk Score: ${body.walk_score || "unknown"}/100
Transit Score: ${body.transit_score || "unknown"}/100
Bus Routes: ${busInfo}

DAILY ESSENTIALS NEARBY (these are selling points — mention the specific names):
${sellingPoints.length ? sellingPoints.join("\n") : "No data available"}

WALKABLE AMENITIES:
${walkableAmenities.length ? walkableAmenities.join("\n") : "No data available"}

COPYWRITING RULES (follow exactly):
- Audience: a prospective tenant scanning many listings. They want to picture themselves living here.
- Voice: direct, plain-spoken, warm but not soft. No hype words (stunning, vibrant, must-see, breathtaking, nestled, boasts). No exclamation marks.
- Describe the EXPERIENCE of living here. What does a Tuesday morning look like? Where do you grab coffee? Where do you do your weekly grocery run? How do you get to work?
- Name specific stores, parks, and transit stops by name. "Tim Hortons is a 4-minute walk" beats "coffee shops nearby."
- Costco, Real Canadian Superstore, Walmart, Giant Tiger — these aren't "attractions." They're where people do their weekly shop. Frame them as practical daily-life conveniences: "Your weekly Costco run is a 5-minute drive" or "Real Canadian Superstore is right down the road."
- Mention transit practically: "Route 10 stops at [stop name], [X] minute walk from the front door" — not just "transit nearby."
- Include the neighbourhood character: is it quiet residential? Busy? Student-heavy? Family-oriented? What's the noise level?
- DO NOT describe the ideal tenant (Ontario Human Rights Code). Describe the place, never who should live there.
- DO NOT invent any facts. Only use the data provided above.
- DO NOT use these AI tells: "nestled in the heart of," "stands as a testament," "vibrant community," negative parallelism ("It's not just X — it's Y"), em-dash pileups, or trailing participle phrases.

FORMAT:
Write 3-4 paragraphs, roughly 150-200 words total. First paragraph: the immediate surroundings and daily essentials (grocery, coffee, pharmacy). Second paragraph: getting around (transit, walkability, commute). Third paragraph: the neighbourhood feel and character. Optional fourth: parks, recreation, weekend life.

Make it specific enough that someone from ${body.city} would read it and think "yeah, that's exactly what that area is like."`;

    try {
      const msg = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 800, messages: [{ role: "user", content: vibePrompt }] });
      const vibeText = msg.content[0].type === "text" ? msg.content[0].text : "";
      return NextResponse.json({ description: vibeText.trim() });
    } catch (err) {
      console.error("[generate-listing] Vibe generation failed:", err);
      return NextResponse.json({ error: `AI generation failed: ${err instanceof Error ? err.message : "Unknown error"}` }, { status: 500 });
    }
  }

  // Build comprehensive property details
  const sections: string[] = [];

  // Basics
  const basics = [
    body.address && `Address: ${body.address}`,
    body.city && `City: ${body.city}, Ontario`,
    body.property_type && `Type: ${body.property_type}`,
    body.bedrooms && `Bedrooms: ${body.bedrooms}`,
    body.bathrooms && `Bathrooms: ${body.bathrooms}`,
    body.sqft && `Square feet: ${body.sqft}`,
    body.price && `Monthly rent: $${body.price}`,
    body.available_date && `Available: ${body.available_date}`,
  ].filter(Boolean);
  if (basics.length) sections.push("BASICS:\n" + basics.join("\n"));

  // Features
  const features = [
    body.parking_type && body.parking_type !== "none" && `Parking: ${body.parking_type}`,
    body.laundry_type && body.laundry_type !== "none" && `Laundry: ${body.laundry_type}`,
    body.ac && "Air conditioning: Yes",
    body.heating_type && `Heating: ${body.heating_type}`,
    body.appliances?.length && `Appliances: ${body.appliances.join(", ")}`,
    body.outdoor_space && body.outdoor_space !== "none" && `Outdoor: ${body.outdoor_space}`,
    body.furnished && "Furnished: Yes",
    body.storage && "Storage: Yes",
    body.elevator && "Elevator: Yes",
    body.wheelchair_accessible && "Wheelchair accessible: Yes",
  ].filter(Boolean);
  if (features.length) sections.push("FEATURES:\n" + features.join("\n"));

  // Policies
  const policies = [
    body.pet_friendly && "Pet friendly",
    body.pet_policy?.cats && "Cats allowed",
    body.pet_policy?.dogs && "Dogs allowed",
    body.smoking_allowed === false && "No smoking",
    body.quiet_hours && `Quiet hours: ${body.quiet_hours}`,
    body.lease_term && `Lease term: ${body.lease_term}`,
  ].filter(Boolean);
  if (policies.length) sections.push("POLICIES:\n" + policies.join("\n"));

  // Utilities
  if (body.utilities_detail && typeof body.utilities_detail === "object") {
    const utilLines: string[] = [];
    for (const [key, val] of Object.entries(body.utilities_detail)) {
      const v = val as { included?: boolean; avg_cost?: number };
      if (v.included) utilLines.push(`${key}: Included in rent`);
      else if (v.avg_cost) utilLines.push(`${key}: Tenant pays (~$${v.avg_cost}/mo)`);
    }
    if (utilLines.length) sections.push("UTILITIES:\n" + utilLines.join("\n"));
  }

  // Neighbourhood
  if (body.neighbourhood_data && typeof body.neighbourhood_data === "object") {
    const nearbyLines: string[] = [];
    for (const [category, places] of Object.entries(body.neighbourhood_data)) {
      const list = places as { name: string; walk_time?: string; distance?: string }[];
      if (list?.length) {
        const top3 = list.slice(0, 3).map((p) => `${p.name}${p.walk_time ? ` (${p.walk_time})` : ""}`).join(", ");
        nearbyLines.push(`${category}: ${top3}`);
      }
    }
    if (nearbyLines.length) sections.push("NEARBY PLACES:\n" + nearbyLines.join("\n"));
  }

  if (body.bus_routes?.length) {
    const routes = body.bus_routes.map((r: { route: string; stop_name: string; walk_time: string }) =>
      `Route ${r.route || "?"} at ${r.stop_name}${r.walk_time ? ` (${r.walk_time})` : ""}`
    ).join(", ");
    sections.push("TRANSIT:\n" + routes);
  }

  if (body.walk_score) sections.push(`Walk Score: ${body.walk_score}/100`);
  if (body.transit_score) sections.push(`Transit Score: ${body.transit_score}/100`);
  if (body.neighbourhood_vibe) sections.push(`NEIGHBOURHOOD VIBE: ${body.neighbourhood_vibe}`);

  // Transparency
  if (body.transparency && typeof body.transparency === "object") {
    const tLines = Object.entries(body.transparency)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
    if (tLines.length) sections.push("TRANSPARENCY NOTES:\n" + tLines.join("\n"));
  }

  const allDetails = sections.join("\n\n");

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `You are a rental property listing copywriter for Prospera Properties, a professional property management company in Ontario, Canada. You need to generate FIVE pieces of content for this property listing.

PROPERTY DATA:
${allDetails}

Generate ALL FIVE of these:

1. "title" — Short, catchy listing title. Max 60 characters. Highlight the best feature. Do NOT include the price. Examples: "Bright 2BR with In-Unit Laundry — Old South", "Spacious 3BR Townhouse — Steps to Western"

2. "description" — 2-3 paragraphs. Professional but warm. Mention key features, neighbourhood appeal, and ideal tenant. Under 200 words. No exclamation marks.

3. "highlights" — Array of exactly 5 strings. Each is one compelling selling point (1 sentence each). Focus on what makes daily life better here. Use REAL place names from the nearby places data if available.

4. "life_simulation" — Object with 4 keys: "morning", "afternoon", "evening", "night". Each is 2-3 sentences painting a picture of what that time of day looks like living here. Use REAL nearby place names, real distances, real transit info. Make the reader imagine themselves living here. Keep each period under 60 words.

5. "life_intro" — 3 short punchy lines separated by newlines. This is the emotional hook at the very top of the listing page. Format: "Wake up [distance] from [real place].\\nGrab coffee at [real nearby café].\\nBe downtown in [real commute time]." Use REAL data only. If you don't have nearby places data, write about the neighbourhood character instead.

RULES:
- Use ONLY facts from the property data above. Never invent features.
- Use REAL place names from NEARBY PLACES if available.
- Tone: calm, confident, professional. No hype. No exclamation marks.
- Write as if you're a trusted advisor, not a salesperson.

Respond in this exact JSON format only, no markdown code fences:
{"title": "...", "description": "...", "highlights": ["...", "...", "...", "...", "..."], "life_simulation": {"morning": "...", "afternoon": "...", "evening": "...", "night": "..."}, "life_intro": "..."}`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({
      title: parsed.title || "",
      description: parsed.description || "",
      highlights: parsed.highlights || [],
      life_simulation: parsed.life_simulation || { morning: "", afternoon: "", evening: "", night: "" },
      life_intro: parsed.life_intro || "",
    });
  } catch (err) {
    console.error("[generate-listing] AI generation failed:", err);
    return NextResponse.json({ error: `AI generation failed: ${err instanceof Error ? err.message : "Unknown error"}` }, { status: 500 });
  }
}
