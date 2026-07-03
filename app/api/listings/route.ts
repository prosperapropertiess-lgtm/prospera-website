import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const url = new URL(req.url);

  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", "published")
    .eq("is_managed", true)
    .eq("available", true)
    .order("created_at", { ascending: false });

  const city = url.searchParams.get("city");
  if (city && city !== "All Cities") query = query.eq("city", city);

  const petFriendly = url.searchParams.get("petFriendly");
  if (petFriendly === "true") query = query.eq("pet_friendly", true);

  const beds = url.searchParams.get("beds");
  if (beds === "3+") query = query.gte("bedrooms", 3);
  else if (beds && beds !== "Any") query = query.eq("bedrooms", parseInt(beds));

  const maxPrice = url.searchParams.get("maxPrice");
  if (maxPrice) query = query.lte("price", parseInt(maxPrice));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
