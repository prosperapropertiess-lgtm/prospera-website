import { Metadata } from "next";
import { notFound } from "next/navigation";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";
import MarketCompReport, {
  type MarketCompData,
} from "@/components/market-comp/MarketCompReport";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ token: string }>;
}

// ── Claude insight parser ─────────────────────────────────────────────────────

interface PropertyContext {
  ownerActionItems: string | null;
  bedrooms: number | null;
  city: string | null;
  condition: string | null;
  propertyType: string | null;
  rentMarket: number | null;
  rentPremium: number | null;
}

async function parseInsights(ctx: PropertyContext): Promise<string[]> {
  try {
    const client = new Anthropic();

    const conditionLabel: Record<string, string> = {
      needs_work: "needs work",
      fair: "fair condition",
      good: "good condition",
      great: "great condition",
      move_in_ready: "move-in ready / pristine",
    };

    const propertyDesc = [
      ctx.bedrooms ? `${ctx.bedrooms}-bedroom` : null,
      ctx.propertyType ?? null,
      ctx.city ? `in ${ctx.city}` : "in Ontario",
    ].filter(Boolean).join(" ");

    const conditionNote = ctx.condition
      ? `Condition: ${conditionLabel[ctx.condition] ?? ctx.condition}.`
      : "";

    const actionNote = ctx.ownerActionItems?.trim()
      ? `Agent notes / suggested improvements:\n${ctx.ownerActionItems}`
      : "The property is pristine and move-in ready. No owner action items were flagged.";

    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a leasing strategist at Prospera Properties.

Write 3–5 insight cards for the "How to command top rent" section of a market analysis report prepared for the property owner.

Property: ${propertyDesc}
${conditionNote}
${ctx.rentMarket ? `Market rent: $${ctx.rentMarket}/mo` : ""}
${ctx.rentPremium ? `Premium rent: $${ctx.rentPremium}/mo` : ""}

${actionNote}

Rules:
- Each card = one specific tactic + 1–2 sentences on WHY it works for THIS property
- If the property is pristine, lead with that strength — focus on marketing, positioning, and tenant quality tactics
- If there are action items, include those as the first cards
- Professional, direct, no hype words
- Always produce at least 3 cards, max 5

Return ONLY a JSON array of strings. Each string starts with the tactic bolded in ** ** then an em dash and the explanation.
Example: ["**Professional photography** — Listings with strong photos rent 30–50% faster. A pristine unit deserves a listing that matches.", "**Price at market from day one** — Overpricing on a well-maintained unit still delays your tenant. Starting at market rate attracts the strongest applicant pool immediately."]

Return only the JSON array, no other text.`,
        },
      ],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed.filter((s: unknown) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

// ── Data fetch ────────────────────────────────────────────────────────────────

async function getReportData(token: string): Promise<MarketCompData | null> {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("onboarding_sessions")
      .select(
        "token, owner_name, property_address, property_city, property_type, service_type, approx_monthly_rent, bedrooms, bathrooms, parking_spots, parking_type, property_condition, owner_action_items, rent_insights, rent_low, rent_market, rent_premium, comparables, created_at"
      )
      .eq("token", token)
      .single();

    if (error || !data) return null;

    const ownerActionItems = (data.owner_action_items as string | null) ?? null;

    // Generate insight cards via Claude — always, for every property (compute once, cache)
    let rentInsights = Array.isArray(data.rent_insights)
      ? (data.rent_insights as string[])
      : null;

    if (!rentInsights) {
      rentInsights = await parseInsights({
        ownerActionItems,
        bedrooms: (data.bedrooms as number | null) ?? null,
        city: (data.property_city as string | null) ?? null,
        condition: (data.property_condition as string | null) ?? null,
        propertyType: (data.property_type as string | null) ?? null,
        rentMarket: (data.rent_market as number | null) ?? null,
        rentPremium: (data.rent_premium as number | null) ?? null,
      });
      if (rentInsights.length > 0) {
        await sb
          .from("onboarding_sessions")
          .update({ rent_insights: rentInsights })
          .eq("token", token);
      }
    }

    return {
      token: data.token as string,
      owner_name: (data.owner_name as string | null) ?? null,
      property_address: (data.property_address as string | null) ?? null,
      property_city: (data.property_city as string | null) ?? null,
      property_type: (data.property_type as string | null) ?? null,
      service_type: (data.service_type as string | null) ?? null,
      approx_monthly_rent: (data.approx_monthly_rent as number | null) ?? null,
      bedrooms: (data.bedrooms as number | null) ?? null,
      bathrooms: (data.bathrooms as number | null) ?? null,
      parking_spots: (data.parking_spots as number | null) ?? null,
      parking_type: (data.parking_type as string | null) ?? null,
      property_condition: (data.property_condition as string | null) ?? null,
      owner_action_items: ownerActionItems,
      rent_insights: rentInsights ?? [],
      rent_low: (data.rent_low as number | null) ?? null,
      rent_market: (data.rent_market as number | null) ?? null,
      rent_premium: (data.rent_premium as number | null) ?? null,
      comparables: Array.isArray(data.comparables) ? data.comparables : [],
      created_at: data.created_at as string,
    };
  } catch {
    return null;
  }
}

// ── generateMetadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await getReportData(token);

  if (!data) {
    return { title: "Market Analysis Report | Prospera Properties" };
  }

  const address = [data.property_address, data.property_city]
    .filter(Boolean)
    .join(", ");

  return {
    title: `Market Analysis — ${address} | Prospera Properties`,
    description: `Rent comparable analysis for ${address}. Prepared by Prospera Properties.`,
    robots: { index: false, follow: false },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MarketCompPage({ params }: PageProps) {
  const { token } = await params;
  const data = await getReportData(token);

  if (!data) notFound();

  return <MarketCompReport data={data} />;
}
