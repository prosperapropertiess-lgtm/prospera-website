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

// PATCH — set one condition on many items at once ("mark the rest Good").
// Body: { ids, condition }. Only touches items still 'not_inspected', so a
// stale tap can't overwrite something already marked as damaged.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const { ids, condition } = await req.json();
  if (!Array.isArray(ids) || !ids.length || !condition) return NextResponse.json({ error: "ids and condition required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("move_in_items")
    .update({ condition, updated_at: new Date().toISOString() })
    .in("id", ids)
    .eq("condition", "not_inspected")
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
