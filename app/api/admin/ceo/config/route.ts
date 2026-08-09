/**
 * PSN-DATA-001 — UE Config (assumption targets & defaults)
 * GET  /api/admin/ceo/config — all config values
 * POST /api/admin/ceo/config — upsert a config value (audited)
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getSupabaseAdmin();
  const { data, error } = await db.from("ceo_ue_config").select("*").order("key");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getSupabaseAdmin();
  const body = await req.json();

  if (!body.key || body.value === undefined) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  // Get old value for audit
  const { data: existing } = await db
    .from("ceo_ue_config")
    .select("value")
    .eq("key", body.key)
    .single();

  const { data, error } = await db
    .from("ceo_ue_config")
    .upsert({ ...body, updated_at: new Date().toISOString() }, { onConflict: "key" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit
  await db.from("ceo_audit_log").insert({
    event_type: "config_change",
    entity_type: "ceo_ue_config",
    field_name: body.key,
    old_value: existing?.value?.toString() ?? null,
    new_value: String(body.value),
    reason: body.reason ?? null,
  });

  return NextResponse.json(data);
}
