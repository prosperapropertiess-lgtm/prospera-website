/**
 * Photo upload for a move-in item or appliance. Uploads to the existing
 * private `tenant-inspection` bucket, appends {url, path} to the target
 * row's `photos` jsonb array, and returns a signed URL (1 year — these
 * links end up in emailed PDFs/reports that people reasonably expect to
 * keep working) so the tablet can preview it immediately.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const BUCKET = "tenant-inspection";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: campaignId } = await params;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("photo") as File | null;
  const targetType = formData.get("targetType") as string | null; // 'item' | 'appliance'
  const targetId = formData.get("targetId") as string | null;
  if (!file || !targetType || !targetId) {
    return NextResponse.json({ error: "photo, targetType, targetId required" }, { status: 400 });
  }
  if (!["item", "appliance"].includes(targetType)) {
    return NextResponse.json({ error: "targetType must be 'item' or 'appliance'" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const buffer = await file.arrayBuffer();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${campaignId}/${targetType}/${targetId}/${Date.now()}-${safeName}`;

  const { error: uploadErr } = await db.storage.from(BUCKET).upload(path, buffer, { contentType: file.type, upsert: false });
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: signed, error: signErr } = await db.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr) return NextResponse.json({ error: signErr.message }, { status: 500 });

  const table = targetType === "item" ? "move_in_items" : "move_in_appliances";
  const { data: existing, error: fetchErr } = await db.from(table).select("photos").eq("id", targetId).single();
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const photo = { url: signed.signedUrl, path };
  const photos = [...(existing?.photos ?? []), photo];
  const { error: updateErr } = await db.from(table).update({ photos }).eq("id", targetId);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ photo, photos });
}
