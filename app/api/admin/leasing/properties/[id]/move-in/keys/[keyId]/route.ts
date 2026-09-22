import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; keyId: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { keyId } = await params;
  const { item_name, quantity } = await req.json();
  const patch: Record<string, unknown> = {};
  if (item_name !== undefined) patch.item_name = item_name;
  if (quantity !== undefined) patch.quantity = quantity;

  const db = getSupabaseAdmin();
  const { data, error } = await db.from("move_in_keys").update(patch).eq("id", keyId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; keyId: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { keyId } = await params;
  const db = getSupabaseAdmin();
  const { error } = await db.from("move_in_keys").delete().eq("id", keyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
