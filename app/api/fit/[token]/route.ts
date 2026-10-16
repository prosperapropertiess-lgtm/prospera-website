import { NextRequest, NextResponse } from "next/server";
import { notifyFitSubmitted } from "@/lib/fit-notify";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { FIT_WRITABLE_FIELDS, cityFromArea } from "@/lib/fit-form";

// Public, capability-URL access: the fit_token is the only credential. Exposes just what the form needs.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = getSupabaseAdmin();
  const { data } = await db
    .from("discovery_calls")
    .select("landlord_name, landlord_phone, fit_submitted_at")
    .eq("fit_token", token)
    .single();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    name: data.landlord_name,
    phone: data.landlord_phone,
    submitted: !!data.fit_submitted_at,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`fit:${ip}`, 10, 60_000).allowed) {
    return NextResponse.json({ error: "Too many tries, wait a minute" }, { status: 429 });
  }

  const db = getSupabaseAdmin();
  const { data: call } = await db.from("discovery_calls").select("*").eq("fit_token", token).single();
  if (!call) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (call.fit_submitted_at) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  for (const f of FIT_WRITABLE_FIELDS) {
    if (!(f in body)) continue;
    const v = body[f];
    patch[f] = typeof v === "string" ? v.trim().slice(0, 2000) || null : v;
  }
  if (typeof patch.area === "string" && !patch.property_city) {
    patch.property_city = cityFromArea(patch.area) || null;
  }
  if (patch.address_disclosed === false) patch.property_address = null;

  const now = new Date().toISOString();
  const { error } = await db
    .from("discovery_calls")
    .update({ ...patch, fit_submitted_at: now, outcome: "pending_decision", updated_at: now })
    .eq("id", call.id);
  if (error) return NextResponse.json({ error: "Couldn't save, try again" }, { status: 500 });

  await notifyFitSubmitted(call.id, (patch.landlord_name as string) || call.landlord_name || "A landlord");

  return NextResponse.json({ ok: true });
}
