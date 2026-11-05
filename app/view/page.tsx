import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PUBLIC_HOME_FIELDS, toPublicHome } from "@/lib/viewing-requests";
import ViewFlow from "./ViewFlow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Request a viewing | Prospera Properties" },
  description: "Pick a home and answer a few quick questions to request a viewing.",
  robots: { index: false },
};

export default async function ViewPage({ searchParams }: { searchParams: Promise<{ home?: string }> }) {
  const { home } = await searchParams;
  const { data } = await getSupabaseAdmin()
    .from("properties")
    .select(PUBLIC_HOME_FIELDS)
    .eq("status", "published")
    .eq("is_managed", true)
    .eq("available", true)
    .order("price");
  return <ViewFlow homes={(data ?? []).map(toPublicHome)} preselect={home ?? null} />;
}
