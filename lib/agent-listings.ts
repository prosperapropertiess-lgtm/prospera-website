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

// AI agents reliably guess at reasonable-sounding field names that don't
// exactly match our schema (pets_allowed vs pet_friendly, laundry vs
// laundry_type, etc). Rather than silently dropping those — which is what
// happened to Muse's McLarenwood listing — accept the common variants.
const SIMPLE_ALIASES: Record<string, string> = {
  pets_allowed: "pet_friendly",
  pet_allowed: "pet_friendly",
  petFriendly: "pet_friendly",
  pets: "pet_friendly",
  allows_pets: "pet_friendly",
  laundry: "laundry_type",
  laundryType: "laundry_type",
  availability_date: "available_date",
  availableDate: "available_date",
  available_from: "available_date",
  move_in_date: "available_date",
  moveInDate: "available_date",
  outdoorSpace: "outdoor_space",
};

// Boolean convenience flags for outdoor space — "backyard: true" should mean
// the same thing as outdoor_space: "yard", not get silently ignored.
const OUTDOOR_FLAGS: Record<string, string> = {
  backyard: "yard",
  yard: "yard",
  balcony: "balcony",
  patio: "patio",
  deck: "deck",
  rooftop: "rooftop",
};

// Same idea for appliances — accept either an array of names (the
// documented shape) or individual booleans / a {name: true} object.
const APPLIANCE_FLAGS: Record<string, string> = {
  dishwasher: "Dishwasher",
  fridge: "Refrigerator",
  refrigerator: "Refrigerator",
  stove: "Stove/Oven",
  oven: "Stove/Oven",
  stove_oven: "Stove/Oven",
  microwave: "Microwave",
  washer: "Washer",
  dryer: "Dryer",
  garbage_disposal: "Garbage Disposal",
};

const KNOWN_KEYS = new Set([
  "address", "city", "property_type", "price", "bedrooms", "bathrooms", "sqft",
  "available_date", "deposit", "parking_type", "parking", "laundry_type", "ac",
  "heating_type", "appliances", "outdoor_space", "furnished", "pet_friendly",
  "utilities_included", "utilities_list", "description", "ai_highlights",
  "images", "image_urls", "available", "status", "title",
  ...Object.keys(SIMPLE_ALIASES),
  ...Object.keys(OUTDOOR_FLAGS),
  ...Object.keys(APPLIANCE_FLAGS),
]);

/** Renames/reshapes known alias fields onto their canonical names in-place on a copy. */
function applyAliases(body: Record<string, unknown>): Record<string, unknown> {
  const b: Record<string, unknown> = { ...body };

  for (const [alias, canonical] of Object.entries(SIMPLE_ALIASES)) {
    if (b[alias] !== undefined && b[canonical] === undefined) b[canonical] = b[alias];
  }

  if (b.outdoor_space === undefined) {
    const active = Object.entries(OUTDOOR_FLAGS)
      .filter(([flag]) => b[flag] === true)
      .map(([, value]) => value);
    if (active.length) b.outdoor_space = [...new Set(active)].join(",");
  }

  if (b.appliances === undefined) {
    const active = Object.entries(APPLIANCE_FLAGS)
      .filter(([flag]) => b[flag] === true)
      .map(([, label]) => label);
    if (active.length) b.appliances = [...new Set(active)];
  } else if (b.appliances && typeof b.appliances === "object" && !Array.isArray(b.appliances)) {
    b.appliances = Object.entries(b.appliances as Record<string, unknown>)
      .filter(([, v]) => v === true)
      .map(([k]) => APPLIANCE_FLAGS[k.toLowerCase()] || k);
  }

  return b;
}

/** Any top-level key the caller sent that we don't recognize at all — surfaced in the response so a mistake is visible immediately instead of silently dropped. */
export function findUnrecognizedFields(body: Record<string, unknown>): string[] {
  return Object.keys(body).filter((k) => !KNOWN_KEYS.has(k));
}

/**
 * Normalizes an inbound create/update payload to the real `properties`
 * columns, with the same defaults the PropertyWizard uses, so a minimal
 * request ("address, city, price, bedrooms, bathrooms") still produces a
 * complete, consistent row. Only fields actually present in `body` are
 * included on update (so PATCH doesn't clobber untouched fields); on create,
 * defaults fill in anything missing.
 */
export function normalizePropertyPayload(rawBody: Record<string, unknown>, isCreate: boolean): Record<string, unknown> {
  const body = applyAliases(rawBody);
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
  // A bare `parking: true` with no parking_type used to default parking_type
  // to "none" — contradicting the boolean (McLarenwood: parking true,
  // parking_type "none"). If the caller says there's parking but doesn't say
  // what kind, "lot" is a safer unspecified-but-not-contradictory default.
  if (body.parking_type !== undefined) set("parking_type", body.parking_type);
  else if (isCreate) set("parking_type", body.parking === true ? "lot" : "none");
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
