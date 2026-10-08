import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyApiKey } from "@/lib/api-key-auth";
import { normalizePropertyPayload, downloadAndStoreImage, findUnrecognizedFields } from "@/lib/agent-listings";

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

// Agent-facing create — requires `Authorization: Bearer <api key>` (generated
// and revocable from /admin/settings/api-keys). This is a separate auth path
// from the admin-session-cookie-gated /api/admin/properties route the wizard
// uses, so an external AI agent can create listings without ever touching
// a browser session.
export async function POST(req: NextRequest) {
  const { valid } = await verifyApiKey(req);
  if (!valid) return NextResponse.json({ error: "Unauthorized — missing or invalid API key" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  for (const field of ["address", "city", "price", "bedrooms", "bathrooms"]) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  const supabase = getSupabaseAdmin();
  const payload = normalizePropertyPayload(body, true);
  const unrecognizedFields = findUnrecognizedFields(body);

  const { data: created, error } = await supabase.from("properties").insert([payload]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // image_urls — externally-hosted images to download and re-host under this
  // property's own storage path. Failures here don't roll back the listing;
  // they're reported back so the caller can retry just the images.
  const imageUrls = Array.isArray(body.image_urls) ? (body.image_urls as string[]) : [];
  const storedImages: string[] = [];
  const imageErrors: string[] = [];
  for (const url of imageUrls) {
    try {
      storedImages.push(await downloadAndStoreImage(url, created.id));
    } catch (err) {
      imageErrors.push(err instanceof Error ? err.message : String(err));
    }
  }
  if (storedImages.length) {
    const { data: updated } = await supabase
      .from("properties")
      .update({ images: storedImages })
      .eq("id", created.id)
      .select()
      .single();
    if (updated) Object.assign(created, updated);
  }

  return NextResponse.json(
    {
      ...created,
      image_errors: imageErrors.length ? imageErrors : undefined,
      unrecognized_fields: unrecognizedFields.length
        ? { fields: unrecognizedFields, note: "These fields were not recognized and were ignored. See docs/AGENT_LISTINGS_API.md for exact field names." }
        : undefined,
    },
    { status: 201 }
  );
}
