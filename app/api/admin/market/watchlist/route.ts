import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const num = (v: unknown) => (v === "" || v == null || !Number.isFinite(Number(v)) ? null : Number(v));

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await getSupabaseAdmin().from("market_watchlist").select("*").eq("active", true).order("source").order("label");
  return NextResponse.json({ properties: data ?? [] });
}

// POST { label, rent_low, rent_high?, config?, notes? }: add your own property.
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const label = String(b.label ?? "").trim().slice(0, 200);
  if (!label || num(b.rent_low) == null) return NextResponse.json({ error: "Give the property a name and a rent." }, { status: 400 });
  const { data, error } = await getSupabaseAdmin().from("market_watchlist").insert({
    label, source: "manual", rent_low: num(b.rent_low), rent_high: num(b.rent_high) ?? num(b.rent_low),
    config: b.config ?? { type: [], beds: [], area: [], basis: "whole", warnings: [], excluded: [] }, notes: b.notes ?? null,
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ property: data });
}

// PATCH { id, config?, notes?, rent_low?, rent_high?, active? }
export async function PATCH(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.config !== undefined) patch.config = b.config;
  if (b.notes !== undefined) patch.notes = String(b.notes).slice(0, 4000) || null;
  if (b.rent_low !== undefined) patch.rent_low = num(b.rent_low);
  if (b.rent_high !== undefined) patch.rent_high = num(b.rent_high);
  if (b.active !== undefined) patch.active = !!b.active;
  const { error } = await getSupabaseAdmin().from("market_watchlist").update(patch).eq("id", b.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
