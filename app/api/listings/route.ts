import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);

  const city = url.searchParams.get("city");
  const petFriendly = url.searchParams.get("petFriendly");
  const beds = url.searchParams.get("beds");
  const maxPrice = url.searchParams.get("maxPrice");

  // ── Available listings ──────────────────────────────────────────────
  let availableQuery = supabase
    .from("properties")
    .select("*")
    .eq("status", "published")
    .eq("is_managed", true)
    .eq("available", true)
    .order("created_at", { ascending: false });

  if (city && city !== "All Cities") availableQuery = availableQuery.eq("city", city);
  if (petFriendly === "true") availableQuery = availableQuery.eq("pet_friendly", true);
  if (beds === "3+") availableQuery = availableQuery.gte("bedrooms", 3);
  else if (beds && beds !== "Any") availableQuery = availableQuery.eq("bedrooms", parseInt(beds));
  if (maxPrice) availableQuery = availableQuery.lte("price", parseInt(maxPrice));

  const { data: available, error: availErr } = await availableQuery;

  if (availErr) {
    return NextResponse.json({ error: availErr.message }, { status: 500 });
  }

  // ── Recently rented (social proof — last 120 days) ──────────────────
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 120);

  let rentedQuery = supabase
    .from("properties")
    .select("id, title, address, city, price, bedrooms, bathrooms, sqft, images, property_type, pet_friendly, parking, utilities_included, status, created_at, rented_at")
    .eq("status", "rented")
    .eq("is_managed", true)
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: false })
    .limit(6);

  if (city && city !== "All Cities") rentedQuery = rentedQuery.eq("city", city);

  const { data: rented, error: rentedErr } = await rentedQuery;

  // Rented fetch failures are non-fatal — just skip the section
  const rentedProperties = rentedErr ? [] : (rented || []).map((p) => ({ ...p, _rented: true }));

  return NextResponse.json({
    available: available || [],
    rented: rentedProperties,
  });
}
