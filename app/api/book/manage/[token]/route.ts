import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { availableSlots, verifyId, LIVE } from "@/lib/fieldops/engine";
import { cancel, reschedule } from "@/lib/fieldops/service";

export const dynamic = "force-dynamic";

async function load(token: string) {
  const id = verifyId("manage", token);
  if (!id) return null;
  const { data } = await getSupabaseAdmin().from("fo_appointments")
    .select("id, property_id, starts_at, ends_at, status, tenant_name, properties(address, city)").eq("id", id).maybeSingle();
  return data;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const a = await load((await params).token);
  if (!a) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  const live = (LIVE as readonly string[]).includes(a.status) && new Date(a.starts_at).getTime() > Date.now();
  const p = a.properties as unknown as { address: string; city: string };
  const slots = live ? (await availableSlots(a.property_id)).slots.map((s) => s.start) : [];
  return NextResponse.json({
    name: a.tenant_name.split(/\s+/)[0], address: p.address, city: p.city,
    starts_at: a.starts_at, ends_at: a.ends_at, status: a.status, changeable: live, slots,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const a = await load((await params).token);
  if (!a) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  if (!(LIVE as readonly string[]).includes(a.status) || new Date(a.starts_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: "This viewing can't be changed any more." }, { status: 409 });
  }
  const body = await req.json().catch(() => ({}));
  try {
    if (body.action === "cancel") {
      const r = await cancel(a.id, "tenant", "Cancelled by the tenant");
      return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: 409 });
    }
    if (body.action === "reschedule") {
      const start = new Date(String(body.start ?? ""));
      if (isNaN(start.getTime())) return NextResponse.json({ error: "Pick a time." }, { status: 400 });
      const { slots } = await availableSlots(a.property_id);
      if (!slots.some((s) => s.start === start.toISOString())) return NextResponse.json({ error: "That time was just taken. Pick another." }, { status: 409 });
      const r = await reschedule(a.id, start, "tenant");
      return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error }, { status: 409 });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[book/manage]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
