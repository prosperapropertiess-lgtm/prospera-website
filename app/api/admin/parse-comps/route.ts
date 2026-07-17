import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rawText, bedrooms, city } = await req.json();

  if (!rawText?.trim()) {
    return NextResponse.json({ error: "No research text provided" }, { status: 400 });
  }

  const prompt = `You are parsing raw rental market research notes for a property management company in ${city || "Ontario"}, Canada.

The researcher has pasted everything they found: Kijiji URLs, Rentals.ca links, listing descriptions, prices, addresses, their own notes — in no particular format. Your job is to extract clean, structured data from it.

Property being analyzed: ${bedrooms || "?"} bedroom rental in ${city || "Ontario"}, Canada.

Here is the raw research:
---
${rawText.slice(0, 8000)}
---

Extract up to 5 comparable rental listings and estimate rent ranges.

Return ONLY valid JSON — no explanation, no markdown, no code fences. Just the raw JSON object:

{
  "comps": [
    {
      "address": "full street address including city",
      "rent": 1800,
      "days_on_market": "14",
      "ad_description": "brief description of the unit from the listing",
      "notes": "include source URL here if found, e.g. kijiji.ca/... or rentals.ca/..."
    }
  ],
  "rentLow": 1650,
  "rentMarket": 1800,
  "rentPremium": 1950,
  "insights": "2-3 sentence summary of what this market data shows"
}

Rules:
- rent must be a plain number (monthly CAD, no $ symbol)
- days_on_market is a string — use "" if not mentioned
- Include the listing URL in notes if visible in the research
- rentLow = conservative 25th percentile (units sitting, needing work)
- rentMarket = what well-maintained comparable units are actually renting for
- rentPremium = what a standout unit with extras (parking, laundry, upgrades) could get
- Only extract actual rental listings with a price — skip for-sale, wanted ads, or vague mentions
- If fewer than 5 real comps are found, return only what's actually there`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any markdown fences if Claude adds them despite instructions
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      comps: (parsed.comps || []).map((c: {
        address: string;
        rent: number;
        days_on_market: string;
        ad_description: string;
        notes: string;
      }) => ({
        address: c.address || "",
        rent: Number(c.rent) || 0,
        days_on_market: c.days_on_market || "",
        ad_description: c.ad_description || "",
        notes: c.notes || "",
      })),
      rentLow: Number(parsed.rentLow) || 0,
      rentMarket: Number(parsed.rentMarket) || 0,
      rentPremium: Number(parsed.rentPremium) || 0,
      insights: parsed.insights || "",
    });
  } catch (err) {
    console.error("[parse-comps] Claude parsing failed:", err);
    return NextResponse.json({ error: "Parsing failed — check your ANTHROPIC_API_KEY" }, { status: 500 });
  }
}
