import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const FIELDS = ["price_basis", "type", "bedrooms", "bathrooms", "price", "area", "exclude"];

// POST { listing_id, field, original_value, reviewed_value, reason, scope, snapshot_id }
// Corrections live here with their history. The Google Sheet is never edited.
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.listing_id || !FIELDS.includes(b.field) || b.reviewed_value == null) return NextResponse.json({ error: "Pick a field and a value." }, { status: 400 });
  const { error } = await getSupabaseAdmin().from("market_overrides").insert({
    listing_id: String(b.listing_id), field: b.field, original_value: b.original_value ?? null,
    reviewed_value: String(b.reviewed_value).slice(0, 200), reason: b.reason ? String(b.reason).slice(0, 500) : null,
    scope: b.scope === "observation" ? "observation" : "listing", snapshot_id: b.scope === "observation" ? b.snapshot_id : null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE ?id=<override id>: undo a correction.
export async function DELETE(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await getSupabaseAdmin().from("market_overrides").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
