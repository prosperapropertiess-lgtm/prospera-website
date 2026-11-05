import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PUBLIC_HOME_FIELDS, toPublicHome, homeSlug } from "@/lib/viewing-requests";
import ViewFlow from "./ViewFlow";

export const viewMetadata: Metadata = {
  title: { absolute: "Request a viewing | Prospera Properties" },
  description: "Pick a home and answer a few short questions to request a viewing.",
  robots: { index: false },
};

/** Shared by /view, /view?home=<id> and /view/<address-slug>. */
export async function renderView(home: string | null | undefined) {
  const { data } = await getSupabaseAdmin()
    .from("properties")
    .select(PUBLIC_HOME_FIELDS)
    .eq("status", "published")
    .eq("is_managed", true)
    .eq("available", true)
    .order("price");
  const homes = (data ?? []).map(toPublicHome);
  const match = home ? homes.find((h) => h.id === home || homeSlug(h.address) === home.toLowerCase()) : null;
  return <ViewFlow homes={homes} preselect={match?.id ?? null} />;
}
