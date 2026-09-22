import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// POST — add an inspection item to a room. Body: { roomId, label }
// Starts as 'not_inspected' — unchecked items must stay uninspected, never
// silently become "good".
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const { roomId, label } = await req.json();
  if (!roomId || !label?.trim()) return NextResponse.json({ error: "roomId and label required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { count } = await db.from("move_in_items").select("id", { count: "exact", head: true }).eq("room_id", roomId);
  const { data, error } = await db
    .from("move_in_items")
    .insert({ room_id: roomId, label: label.trim(), sort_order: count ?? 0 })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
