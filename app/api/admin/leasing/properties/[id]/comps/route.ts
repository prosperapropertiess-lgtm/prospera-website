import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_comps")
    .select("*")
    .eq("leasing_property_id", id)
    .order("rent");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const body = await req.json();
  const { data, error } = await db
    .from("leasing_comps")
    .insert({ leasing_property_id: id, ...body })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest, _ctx: Ctx) {
  const db = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const compId = searchParams.get("comp_id");
  if (!compId) return NextResponse.json({ error: "comp_id required" }, { status: 400 });
  const { error } = await db.from("leasing_comps").delete().eq("id", compId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
