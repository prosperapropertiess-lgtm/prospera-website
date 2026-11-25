import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

// POST — add a room. Body: { sessionId, name, items? }. `items` is the
// room's usual checklist (labels), created in the same request so the
// walkthrough doesn't need a tap per item. Items still start 'not_inspected'.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const { sessionId, name, items } = await req.json();
  if (!sessionId || !name?.trim()) return NextResponse.json({ error: "sessionId and name required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { count } = await db.from("move_in_rooms").select("id", { count: "exact", head: true }).eq("session_id", sessionId);
  const { data, error } = await db
    .from("move_in_rooms")
    .insert({ session_id: sessionId, name: name.trim(), sort_order: count ?? 0 })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const labels: string[] = Array.isArray(items) ? items.filter((l: unknown) => typeof l === "string" && l.trim()).map((l: string) => l.trim()) : [];
  let created: unknown[] = [];
  if (labels.length) {
    const { data: rows, error: itemsErr } = await db
      .from("move_in_items")
      .insert(labels.map((label, i) => ({ room_id: data.id, label, sort_order: i })))
      .select();
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });
    created = (rows ?? []).sort((a, b) => a.sort_order - b.sort_order);
  }
  return NextResponse.json({ ...data, items: created });
}
