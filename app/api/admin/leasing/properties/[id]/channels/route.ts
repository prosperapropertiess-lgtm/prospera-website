import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_channels")
    .select("*")
    .eq("leasing_property_id", id)
    .order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, _ctx: Ctx) {
  const db = getSupabaseAdmin();
  const body = await req.json();
  const { id: channelId, ...updates } = body;
  const { data, error } = await db
    .from("leasing_channels")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", channelId)
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const body = await req.json();
  const { data, error } = await db
    .from("leasing_channels")
    .insert({ leasing_property_id: id, ...body })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
