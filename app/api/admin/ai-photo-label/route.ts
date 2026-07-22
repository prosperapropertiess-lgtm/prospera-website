import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const client = new Anthropic();

const VALID_LABELS = [
  "exterior", "living", "kitchen", "bedroom", "bathroom",
  "attached_bathroom", "dining", "basement", "storage",
  "common_area", "outdoor", "other"
];

export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { urls } = await req.json() as { urls: string[] };
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  // Process in parallel, max 8 at once
  const batch = urls.slice(0, 8);

  const results = await Promise.allSettled(
    batch.map(async (url) => {
      try {
        const msg = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 20,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "url", url },
              },
              {
                type: "text",
                text: `You are labeling photos for a rental property listing. Look at this image and respond with ONLY one of these exact labels (no other text):
exterior, living, kitchen, bedroom, bathroom, attached_bathroom, dining, basement, storage, common_area, outdoor, other

Rules:
- exterior = outside of building, facade, entrance
- living = living room, lounge, family room
- kitchen = kitchen, kitchenette
- bedroom = bedroom
- bathroom = main bathroom, full bathroom with toilet+sink+tub/shower
- attached_bathroom = ensuite, bathroom directly connected to a bedroom
- dining = dining room, eating area
- basement = basement, lower level
- storage = storage room, utility room, laundry room, mechanical room
- common_area = hallway, lobby, shared space, stairwell
- outdoor = backyard, patio, deck, garden, balcony
- other = anything else

Respond with ONLY the label, nothing else.`
              }
            ],
          }],
        });

        const label = (msg.content[0] as { type: string; text: string }).text.trim().toLowerCase();
        return { url, label: VALID_LABELS.includes(label) ? label : "other" };
      } catch {
        return { url, label: "other" };
      }
    })
  );

  const labels = results.map((r, i) => ({
    url: batch[i],
    label: r.status === "fulfilled" ? r.value.label : "other",
  }));

  return NextResponse.json({ labels });
}
