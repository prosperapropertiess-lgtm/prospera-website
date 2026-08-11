/**
 * GET  /api/admin/leasing/properties/[id]/events — activity log
 * POST /api/admin/leasing/properties/[id]/events — log manual note
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated, getLeasingEmployee } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_events")
    .select("*")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const employeeId = await getLeasingEmployee(req);

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_events")
    .insert({
      campaign_id: id,
      event_type: body.event_type ?? "NOTE_ADDED",
      actor: body.actor ?? "Admin",
      actor_id: employeeId,
      related_entity_type: body.related_entity_type ?? null,
      related_entity_id: body.related_entity_id ?? null,
      metadata: body.metadata ?? { note: body.note },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
