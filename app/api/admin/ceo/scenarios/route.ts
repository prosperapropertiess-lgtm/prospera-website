/**
 * PSN-DATA-001 — Forecast Scenarios & Assumptions
 * GET  /api/admin/ceo/scenarios   — list all scenarios with their assumptions
 * POST /api/admin/ceo/scenarios   — create scenario or upsert assumptions
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getSupabaseAdmin();

  const [{ data: scenarios, error: sErr }, { data: assumptions, error: aErr }] = await Promise.all([
    db.from("forecast_scenarios").select("*").eq("is_active", true).order("created_at"),
    db.from("forecast_assumptions").select("*").is("period", null).order("created_at"),
  ]);

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  // Merge assumptions into scenarios
  const result = (scenarios ?? []).map((s) => ({
    ...s,
    assumptions: (assumptions ?? []).find((a) => a.scenario_id === s.id) ?? null,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getSupabaseAdmin();
  const body = await req.json();

  // Action: upsert_assumptions
  if (body._action === "upsert_assumptions") {
    const { scenario_id, ...assumptionFields } = body;
    if (!scenario_id) return NextResponse.json({ error: "scenario_id required" }, { status: 400 });

    // Check if assumptions exist for this scenario (global, no period)
    const { data: existing } = await db
      .from("forecast_assumptions")
      .select("id, version")
      .eq("scenario_id", scenario_id)
      .is("period", null)
      .single();

    let result;
    if (existing) {
      const { data, error } = await db
        .from("forecast_assumptions")
        .update({ ...assumptionFields, version: (existing.version ?? 1) + 1, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = data;

      // Audit assumption change
      await db.from("ceo_audit_log").insert({
        event_type: "assumption_change",
        entity_type: "forecast_assumptions",
        entity_id: existing.id,
        new_value: JSON.stringify(assumptionFields),
        reason: body.notes ?? "Assumption update",
      });
    } else {
      const { data, error } = await db
        .from("forecast_assumptions")
        .insert({ scenario_id, ...assumptionFields })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      result = data;
    }

    return NextResponse.json(result);
  }

  // Action: create scenario
  const { data, error } = await db
    .from("forecast_scenarios")
    .insert(body)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
