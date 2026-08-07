import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_checklist")
    .select("*")
    .eq("leasing_property_id", id)
    .order("sort_order");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const body = await req.json();

  // Toggle complete
  if (body._action === "toggle") {
    const { data: existing } = await db.from("leasing_checklist").select("completed").eq("id", body.item_id).single();
    const nowComplete = !existing?.completed;
    const { data, error } = await db
      .from("leasing_checklist")
      .update({
        completed: nowComplete,
        completed_by: nowComplete ? (body.completed_by || "Ebin") : null,
        completed_at: nowComplete ? new Date().toISOString() : null,
      })
      .eq("id", body.item_id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Add custom item
  const { data, error } = await db
    .from("leasing_checklist")
    .insert({
      leasing_property_id: id,
      category: body.category,
      item: body.item,
      is_custom: true,
      sort_order: body.sort_order || 99,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest, _ctx: Ctx) {
  const db = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("item_id");
  if (!itemId) return NextResponse.json({ error: "item_id required" }, { status: 400 });
  const { error } = await db.from("leasing_checklist").delete().eq("id", itemId).eq("is_custom", true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
