import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB — generous for a phone photo, not open-ended

/**
 * Fetches an externally-hosted image and re-hosts it in the property-images
 * bucket, same path convention as the admin wizard's upload route. External
 * URLs aren't trustworthy long-term (can expire, get deleted, rate-limit) —
 * every image a listing points to should live in our own storage.
 */
export async function downloadAndStoreImage(url: string, propertyId: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not download image from ${url} (${res.status})`);

  const contentType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(`Unsupported image type "${contentType}" for ${url}`);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`Image at ${url} is too large (${(buf.byteLength / 1024 / 1024).toFixed(1)}MB, max 15MB)`);
  }

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : contentType.includes("heic") || contentType.includes("heif") ? "heic" : "jpg";
  const filename = `properties/${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from("property-images")
    .upload(filename, buf, { contentType, upsert: false });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from("property-images").getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * Normalizes an inbound create/update payload to the real `properties`
 * columns, with the same defaults the PropertyWizard uses, so a minimal
 * request ("address, city, price, bedrooms, bathrooms") still produces a
 * complete, consistent row. Only fields actually present in `body` are
 * included on update (so PATCH doesn't clobber untouched fields); on create,
 * defaults fill in anything missing.
 */
export function normalizePropertyPayload(body: Record<string, unknown>, isCreate: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => {
    if (isCreate || value !== undefined) out[key] = value;
  };

  const d = (key: string, fallback: unknown) => (body[key] !== undefined ? body[key] : isCreate ? fallback : undefined);

  if (body.address !== undefined) set("address", body.address);
  if (body.city !== undefined || isCreate) set("city", d("city", "London"));
  if (body.property_type !== undefined || isCreate) set("property_type", d("property_type", null));
  if (body.price !== undefined) set("price", body.price !== null ? Number(body.price) : null);
  if (body.bedrooms !== undefined) set("bedrooms", body.bedrooms !== null ? Number(body.bedrooms) : null);
  if (body.bathrooms !== undefined) set("bathrooms", body.bathrooms !== null ? Number(body.bathrooms) : null);
  if (body.sqft !== undefined || isCreate) set("sqft", d("sqft", null));
  if (body.available_date !== undefined || isCreate) set("available_date", d("available_date", null));
  if (body.deposit !== undefined) set("deposit", body.deposit);
  else if (isCreate) set("deposit", body.price ?? null);
  if (body.parking_type !== undefined || isCreate) set("parking_type", d("parking_type", "none"));
  if (body.parking !== undefined) set("parking", body.parking);
  else if (isCreate) set("parking", body.parking_type ? body.parking_type !== "none" : false);
  if (body.laundry_type !== undefined || isCreate) set("laundry_type", d("laundry_type", "none"));
  if (body.ac !== undefined || isCreate) set("ac", d("ac", false));
  if (body.heating_type !== undefined || isCreate) set("heating_type", d("heating_type", null));
  if (body.appliances !== undefined || isCreate) set("appliances", d("appliances", []));
  if (body.outdoor_space !== undefined || isCreate) set("outdoor_space", d("outdoor_space", "none"));
  if (body.furnished !== undefined || isCreate) set("furnished", d("furnished", false));
  if (body.pet_friendly !== undefined || isCreate) set("pet_friendly", d("pet_friendly", false));
  if (body.utilities_included !== undefined || isCreate) set("utilities_included", d("utilities_included", false));
  if (body.utilities_list !== undefined || isCreate) set("utilities_list", d("utilities_list", []));
  if (body.description !== undefined || isCreate) set("description", d("description", null));
  if (body.ai_highlights !== undefined || isCreate) set("ai_highlights", d("ai_highlights", []));
  if (body.images !== undefined) set("images", body.images);
  if (body.available !== undefined || isCreate) set("available", d("available", true));
  if (body.status !== undefined || isCreate) set("status", d("status", "draft"));

  if (isCreate) {
    out.title = body.title || `${out.bedrooms ?? ""} Bedroom ${out.property_type ? String(out.property_type).charAt(0).toUpperCase() + String(out.property_type).slice(1) : "Home"} — ${out.city}`.trim();
    out.first_month_required = true;
    out.last_month_required = true;
    out.move_in_costs = [];
    out.storage = false;
    out.elevator = false;
    out.wheelchair_accessible = false;
    out.wizard_step = 8;
  }

  return out;
}
