import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// PATCH — rename a room. Body: { name }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { roomId } = await params;
  const { name } = await req.json();
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("move_in_rooms").update({ name }).eq("id", roomId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — remove a room and its items (cascade).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; roomId: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { roomId } = await params;
  const db = getSupabaseAdmin();
  const { error } = await db.from("move_in_rooms").delete().eq("id", roomId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
