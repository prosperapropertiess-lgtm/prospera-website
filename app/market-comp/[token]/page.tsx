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

async function parseInsights(
  ownerActionItems: string,
  bedrooms: number | null,
  city: string | null
): Promise<string[]> {
  try {
    const client = new Anthropic();
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a property management specialist at Prospera Properties in ${city ?? "Ontario"}.

Based on the agent's notes and owner action items below, write 3–5 numbered insight cards for a "How to command top rent" section in a market analysis report shown to the property owner.

Each card should:
- Start with a clear, specific tactic (e.g. "Including utilities in rent")
- Follow with 1–2 sentences explaining WHY it helps command higher rent or attract better tenants
- Be professional, direct, confident — no hype, no filler words
- Be specific to this property based on the notes

Property: ${bedrooms ?? "?"}-bedroom unit in ${city ?? "Ontario"}

Agent notes / owner action items:
${ownerActionItems}

Return ONLY a JSON array of strings — one string per insight card, starting with the tactic name bolded with ** then the explanation. Example:
["**Including utilities in rent** — Tenants in this market pay a premium for predictable monthly costs. Bundling water and heat supports a higher asking price and widens your applicant pool.", "**Professional photography** — Listings with high-quality photos receive 3× more inquiries and rent faster in competitive markets."]

Return only the JSON array, no other text.`,
        },
      ],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    // Extract JSON array from response
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

    // Parse agent notes into insight cards (compute once, cache in Supabase)
    let rentInsights = Array.isArray(data.rent_insights)
      ? (data.rent_insights as string[])
      : null;

    if (ownerActionItems && ownerActionItems.trim().length > 0 && !rentInsights) {
      rentInsights = await parseInsights(
        ownerActionItems,
        (data.bedrooms as number | null) ?? null,
        (data.property_city as string | null) ?? null
      );
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
