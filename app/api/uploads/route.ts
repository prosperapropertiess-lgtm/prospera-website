import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyApiKey } from "@/lib/api-key-auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

// Agent-facing direct file upload — API-key gated. Alternative to passing
// `image_urls` on create/PATCH: use this when the calling agent has raw
// image bytes (not a hosted URL) to hand over. Returns a URL that can then
// be included in `images` on a create/PATCH call.
export async function POST(req: NextRequest) {
  const { valid } = await verifyApiKey(req);
  if (!valid) return NextResponse.json({ error: "Unauthorized — missing or invalid API key" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file") as File | null;
  const propertyId = (formData?.get("propertyId") as string) || "unassigned";

  if (!file) return NextResponse.json({ error: "No file provided (expected multipart field `file`)" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, and HEIC images are allowed." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `properties/${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("property-images")
    .upload(filename, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from("property-images").getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}
