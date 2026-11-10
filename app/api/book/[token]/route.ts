import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { availableSlots, verifyId, LIVE } from "@/lib/fieldops/engine";
import { bookFromToken, loadToken, manageUrl } from "@/lib/fieldops/service";

export const dynamic = "force-dynamic";

// GET: the home and its open times for this private link. POST: book one.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const id = verifyId("book", token);
  if (!id) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  const t = await loadToken(id);
  if (!t.ok) return NextResponse.json({ error: t.error }, { status: 410 });

  const sb = getSupabaseAdmin();
  await sb.from("fo_booking_tokens").update({ views: (t.token.views ?? 0) + 1 }).eq("id", id);
  const [{ data: home }, { data: live }] = await Promise.all([
    sb.from("properties").select("address, city, price, bedrooms, bathrooms, images, utilities_included").eq("id", t.token.property_id).single(),
    sb.from("fo_appointments").select("id, starts_at, ends_at").eq("booking_token_id", id).in("status", [...LIVE]).maybeSingle(),
  ]);
  const { rules, slots } = await availableSlots(t.token.property_id);
  return NextResponse.json({
    name: t.token.tenant_name.split(/\s+/)[0],
    home: home && {
      address: home.address, city: home.city, price: Number(home.price), bedrooms: home.bedrooms, bathrooms: home.bathrooms,
      image: (home.images as string[] | null)?.[0] ?? null, utilities_included: home.utilities_included,
    },
    duration: rules.duration_min,
    paused: !rules.booking_enabled,
    slots: slots.map((s) => s.start),
    booked: live ? { starts_at: live.starts_at, ends_at: live.ends_at, manage: manageUrl(live.id) } : null,
    expires_at: t.token.expires_at,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const id = verifyId("book", token);
  if (!id) return NextResponse.json({ error: "This link isn't valid." }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const start = new Date(String(body.start ?? ""));
  if (isNaN(start.getTime())) return NextResponse.json({ error: "Pick a time." }, { status: 400 });
  try {
    const r = await bookFromToken(id, start);
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 409 });
    return NextResponse.json({ ok: true, manage: r.manage });
  } catch (err) {
    console.error("[book]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
