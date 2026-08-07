import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const db = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("property_id");
  const todayOnly = searchParams.get("today") === "true";

  let q = db
    .from("leasing_tasks")
    .select(`*, property:leasing_properties(id, property:properties(address, city))`)
    .eq("completed", false)
    .order("priority", { ascending: false })
    .order("due_date", { ascending: true });

  if (propertyId) q = q.eq("leasing_property_id", propertyId);
  if (todayOnly) {
    const today = new Date().toISOString().split("T")[0];
    q = q.lte("due_date", today);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  const body = await req.json();

  if (body._action === "complete") {
    const { data, error } = await db
      .from("leasing_tasks")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", body.task_id)
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await db
    .from("leasing_tasks")
    .insert(body)
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
