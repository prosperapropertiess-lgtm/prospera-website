import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const { address, city, bedrooms, bathrooms, sqft, price, pet_friendly, parking, utilities_included, utilities_list } = body;

  const details = [
    address && `Address: ${address}`,
    city && `City: ${city}, Ontario`,
    bedrooms && `Bedrooms: ${bedrooms}`,
    bathrooms && `Bathrooms: ${bathrooms}`,
    sqft && `Square feet: ${sqft}`,
    price && `Monthly rent: $${price}`,
    pet_friendly && "Pet friendly",
    parking && "Parking included",
    utilities_included && utilities_list?.length
      ? `Utilities included: ${utilities_list.join(", ")}`
      : utilities_included
        ? "Utilities included"
        : null,
  ]
    .filter(Boolean)
    .join("\n");

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a rental property listing copywriter for Prospera Properties, a professional property management company in Ontario, Canada. Generate a compelling listing title and description for this rental property.

Property details:
${details}

Rules:
- Title: Short, catchy, max 60 characters. Highlight the best feature. Do NOT include the price. Examples: "Bright 2BR with In-Unit Laundry — Old South", "Spacious 3BR Townhouse — Steps to Western"
- Description: 2-3 short paragraphs. Professional but warm tone. Mention key features, neighbourhood appeal, and who it's ideal for (students, young professionals, families). Keep it under 150 words.
- Do NOT invent features not listed above. Only describe what's provided.
- Do NOT use exclamation marks excessively. Keep it calm and professional.

Respond in this exact JSON format only, no markdown:
{"title": "...", "description": "..."}`,
      },
    ],
  });

  try {
    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = JSON.parse(text);
    return NextResponse.json({
      title: parsed.title,
      description: parsed.description,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }
}
