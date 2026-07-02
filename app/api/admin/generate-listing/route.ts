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

    const vibePrompt = `You're writing the full listing description for a rental at ${body.address}, ${body.city}, Ontario, managed by Prospera Properties. This gets published on prosperaproperties.co, then copy-pasted to Kijiji, Facebook Marketplace, and other listing sites.

Someone scrolling Kijiji at midnight on their phone should read this and think: "I need to see this place. And these people seem like they actually give a shit about their tenants."

You're selling TWO things: the LOCATION and the EXPERIENCE of renting through Prospera.

Write it so a third grader could follow it. Short sentences. Simple words. Bullet points for anything that's a list. No big paragraphs. No fancy language. Break everything down.

TARGET: ~800-1000 words across 6 sections.

LOCATION DATA:
Walk Score: ${body.walk_score || "unknown"}/100
Transit Score: ${body.transit_score || "unknown"}/100
Bus Routes: ${busInfo}

STORES & DAILY ESSENTIALS NEARBY:
${sellingPoints.length ? sellingPoints.join("\n") : "No data available"}

OTHER AMENITIES:
${walkableAmenities.length ? walkableAmenities.join("\n") : "No data available"}

WRITING RULES:
- Write like you're texting a friend about why this spot is solid. Not a brochure. Not a sales pitch. Just real talk.
- Short sentences. If a sentence has a comma, ask yourself if it should be two sentences instead.
- No hype words: stunning, vibrant, must-see, breathtaking, nestled, boasts, pristine, charming, exquisite. None.
- No exclamation marks.
- No AI tells: "nestled in the heart of," "stands as a testament," "rich tapestry," "Whether you're a..."
- DO NOT describe who should live here (Ontario Human Rights Code). Describe the place only.
- DO NOT invent facts. Only use the data above.

===== STRUCTURE (follow this exactly) =====

**What's Nearby**

Start with ONE sentence: "Everything you need is close." Then bullet every single store from the data:

• [Store Name] — [distance or drive time]
• [Store Name] — [distance or drive time]
• [Store Name] — [distance or drive time]
(list ALL of them — Real Canadian Superstore, Costco, Walmart, Giant Tiger, No Frills, Shoppers Drug Mart, LCBO, Canadian Tire, Dollarama, Tim Hortons, Starbucks, McDonald's, Pizza Pizza — whatever is in the data)

After the bullets, add 2-3 short sentences painting the picture: "Your Costco run is [X] minutes. Grab a coffee at Tim Hortons on the way back. Shoppers Drug Mart is right there when you need a pharmacy."

---

**Getting Around**

Bullet the transit info:
• Walk Score: [X]/100 — then one sentence explaining what that actually means in plain English
• Transit Score: [X]/100
• Bus Route [number] at [stop name] — [walk time] from the door
(list each route as a bullet)

Then 2-3 sentences: Can you get to work without a car? How long to get downtown? Be honest. If you need a car, say so.

---

**The Neighbourhood**

3-5 short sentences. What does this street actually feel like? Quiet at night? Kids playing? Mature trees? What do you hear on a Saturday morning? Keep it real and specific to THIS area. No generic "great community" stuff.

---

**Parks & Schools Nearby**

Bullet everything from the data:
• [Park name] — [distance]
• [School name] — [distance]
• [Hospital/clinic name] — [distance]

1-2 sentences after the bullets if there's something worth saying about a major park.

---

**Why Rent With Prospera Properties**

This is the closer. This is where you sell the COMPANY. Write it as bullets. Every bullet should make someone think "damn, that's better than my current landlord."

• Professionally managed — your landlord isn't some guy who doesn't answer the phone. Prospera Properties handles everything.
• 24/7 emergency line — pipe bursts at 2am? You call, someone picks up. Every time.
• Online everything — pay rent, submit maintenance requests, check your lease. All from your phone.
• Fast maintenance — you report it, we're on it. No chasing. No "I'll get to it next week."
• Applications reviewed within 24 hours — no waiting around wondering if you got the place.
• Real people, not a call centre — Prospera is a local ${body.city} company. You're not a ticket number.
• Transparent lease terms — no hidden fees, no surprises on move-in day. You know exactly what you're paying for.

Write this section with confidence. These aren't maybes — these are how Prospera actually operates.

---

**Schedule a Viewing**

3-4 sentences. Direct. Confident. Make them feel like this place won't sit empty long.

"${body.address} is [X] from [biggest store] and [X] from [best park]. You've got your groceries, your coffee, your commute, and a management company that actually picks up the phone. Spots like this don't sit. Book a viewing at prosperaproperties.co or call (519) 697-1227."

===== END STRUCTURE =====

SEO: Naturally include "${body.city} rental" and "${body.address}" at least once each.

FORMAT: Use • for bullets. Use ** for headers. Keep paragraphs to 2-3 sentences max. This gets read on a phone screen.`;

    try {
      const msg = await client.messages.create({ model: "claude-haiku-4-5-20251001", max_tokens: 2500, messages: [{ role: "user", content: vibePrompt }] });
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
