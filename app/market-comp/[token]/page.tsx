import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import MarketCompReport, {
  type MarketCompData,
} from "@/components/market-comp/MarketCompReport";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ token: string }>;
}

// ── Data fetch ────────────────────────────────────────────────────────────────

async function getReportData(token: string): Promise<MarketCompData | null> {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("onboarding_sessions")
      .select(
        "token, owner_name, property_address, property_city, property_type, service_type, approx_monthly_rent, bedrooms, bathrooms, parking_spots, parking_type, property_condition, owner_action_items, rent_low, rent_market, rent_premium, comparables, created_at"
      )
      .eq("token", token)
      .single();

    if (error || !data) return null;

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
      owner_action_items: (data.owner_action_items as string | null) ?? null,
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
