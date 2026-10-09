import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyApiKey, logApiKeyActivity } from "@/lib/api-key-auth";
import { normalizePropertyPayload, downloadAndStoreImage, findUnrecognizedFields } from "@/lib/agent-listings";

// GET a single listing — API-key gated (unlike the public /api/listings
// index, this can return a listing regardless of status, which is why it
// needs a key rather than being open).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { valid } = await verifyApiKey(req);
  if (!valid) return NextResponse.json({ error: "Unauthorized — missing or invalid API key" }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { valid, keyId } = await verifyApiKey(req);
  if (!valid) return NextResponse.json({ error: "Unauthorized — missing or invalid API key" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const unrecognizedFields = findUnrecognizedFields(body);

  // Un-publishing a live listing is high-stakes and near-invisible when it
  // happens by accident — it silently kills the public listing AND the
  // apply link with no obvious signal to anyone. Require an explicit
  // confirmation rather than letting it happen as a side effect of a
  // routine edit that happens to include status.
  if (body.status !== undefined && body.status !== "published") {
    const { data: existing } = await supabase.from("properties").select("status").eq("id", id).maybeSingle();
    if (existing?.status === "published" && body.confirm_unpublish !== true) {
      return NextResponse.json(
        { error: `This listing is currently published. To change its status to "${body.status}", resend the request with "confirm_unpublish": true.` },
        { status: 409 }
      );
    }
  }

  // image_urls on PATCH — download, re-host, and append to whatever images
  // already exist (rather than replacing) unless the caller explicitly
  // passes `images` to replace the full list themselves.
  const imageUrls = Array.isArray(body.image_urls) ? (body.image_urls as string[]) : [];
  const imageErrors: string[] = [];
  if (imageUrls.length && body.images === undefined) {
    const { data: existing } = await supabase.from("properties").select("images").eq("id", id).maybeSingle();
    const current: string[] = existing?.images ?? [];
    for (const url of imageUrls) {
      try {
        current.push(await downloadAndStoreImage(url, id));
      } catch (err) {
        imageErrors.push(err instanceof Error ? err.message : String(err));
      }
    }
    body.images = current;
  }

  const payload = normalizePropertyPayload(body, false);
  payload.last_saved_at = new Date().toISOString();

  const { data, error } = await supabase.from("properties").update(payload).eq("id", id).select().maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await logApiKeyActivity(keyId, "update_listing", `Updated ${data.address}, ${data.city}${body.status !== undefined ? ` (status → ${data.status})` : ""}`, data.id);

  return NextResponse.json({
    ...data,
    image_errors: imageErrors.length ? imageErrors : undefined,
    unrecognized_fields: unrecognizedFields.length
      ? { fields: unrecognizedFields, note: "These fields were not recognized and were ignored. See docs/AGENT_LISTINGS_API.md for exact field names." }
      : undefined,
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { valid, keyId } = await verifyApiKey(req);
  if (!valid) return NextResponse.json({ error: "Unauthorized — missing or invalid API key" }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: property } = await supabase.from("properties").select("status, address, city, images").eq("id", id).maybeSingle();

  // Same reasoning as the unpublish guardrail above — deleting a live
  // listing is a lot more consequential than deleting a draft, so it gets
  // a real confirmation step instead of being one accidental call away.
  const url = new URL(req.url);
  if (property?.status === "published" && url.searchParams.get("confirm_delete") !== "true") {
    return NextResponse.json(
      { error: `This listing is currently published. Resend the request with ?confirm_delete=true to delete it anyway.` },
      { status: 409 }
    );
  }

  if (property?.images?.length) {
    const paths = (property.images as string[])
      .map((u) => u.split("/property-images/")[1])
      .filter(Boolean) as string[];
    if (paths.length) await supabase.storage.from("property-images").remove(paths);
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logApiKeyActivity(keyId, "delete_listing", `Deleted ${property?.address ?? id}${property?.city ? `, ${property.city}` : ""}`, id);

  return NextResponse.json({ success: true });
}
