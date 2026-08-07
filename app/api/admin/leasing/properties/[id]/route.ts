import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("leasing_properties")
    .select(`
      *,
      property:properties(id, title, address, city, bedrooms, bathrooms, price, sqft, images, slug, available, available_date, pet_friendly, parking, utilities_included),
      checklist:leasing_checklist(*),
      leads:leasing_leads(*),
      showings:leasing_showings(*),
      channels:leasing_channels(*),
      comps:leasing_comps(*),
      tasks:leasing_tasks(*)
    `)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const body = await req.json();

  const { data, error } = await db
    .from("leasing_properties")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { error } = await db.from("leasing_properties").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
