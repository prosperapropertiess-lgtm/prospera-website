import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED = ["label", "condition", "notes", "repair_needed", "photos"];

// PATCH — autosave any subset of item fields (condition, notes, repair
// flag, photos array). Body: { ...fields }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { itemId } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const k of ALLOWED) if (k in body) patch[k] = body[k];
  patch.updated_at = new Date().toISOString();

  const db = getSupabaseAdmin();
  const { data, error } = await db.from("move_in_items").update(patch).eq("id", itemId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { itemId } = await params;
  const db = getSupabaseAdmin();
  const { error } = await db.from("move_in_items").delete().eq("id", itemId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
