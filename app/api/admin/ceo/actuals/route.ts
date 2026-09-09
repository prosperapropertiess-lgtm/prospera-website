/**
 * PSN-DATA-001 — CEO Monthly Actuals
 * GET  /api/admin/ceo/actuals?months=12  — merged actuals (management-fee revenue
 *                                          from Notion + company costs + manual)
 * POST /api/admin/ceo/actuals            — upsert manual actuals for a month
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { buildMonthlyActuals } from "@/lib/ceo-actuals";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const months = Math.min(Math.max(parseInt(searchParams.get("months") ?? "12"), 1), 24);

  const { actuals, pum, owner_count, owners, finances_configured } =
    await buildMonthlyActuals(months);

  return NextResponse.json({
    actuals,
    pum,
    owner_count,
    owners,
    finances_configured,
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  const body = await req.json();

  if (!body.period) {
    return NextResponse.json({ error: "period required (YYYY-MM-01)" }, { status: 400 });
  }

  const { data, error } = await db
    .from("ceo_monthly_actuals")
    .upsert({ ...body, updated_at: new Date().toISOString() }, { onConflict: "period" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("ceo_audit_log").insert({
    event_type: "actuals_entry",
    entity_type: "ceo_monthly_actuals",
    entity_id: data.id,
    field_name: "period",
    new_value: body.period,
    reason: body.notes ?? "Manual actuals entry",
  });

  return NextResponse.json(data);
}
