import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED = ["name", "location", "cosmetic_condition", "test_status", "brand", "model", "serial_number", "photos"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; applianceId: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { applianceId } = await params;
  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const k of ALLOWED) if (k in body) patch[k] = body[k];

  const db = getSupabaseAdmin();
  const { data, error } = await db.from("move_in_appliances").update(patch).eq("id", applianceId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; applianceId: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { applianceId } = await params;
  const db = getSupabaseAdmin();
  const { error } = await db.from("move_in_appliances").delete().eq("id", applianceId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
