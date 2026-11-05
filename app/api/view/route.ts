import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  INCOME_RANGES, CREDIT_RANGES, CONSENT_TEXT, PUBLIC_HOME_FIELDS, toPublicHome, torontoToday, incomeLabel, creditLabel,
} from "@/lib/viewing-requests";

export const dynamic = "force-dynamic";

function activeHomes() {
  return getSupabaseAdmin()
    .from("properties")
    .select(PUBLIC_HOME_FIELDS)
    .eq("status", "published")
    .eq("is_managed", true)
    .eq("available", true)
    .order("price");
}

// GET: homes currently taking viewing requests (public fields only).
export async function GET() {
  const { data, error } = await activeHomes();
  if (error) return NextResponse.json({ error: "Couldn't load homes." }, { status: 500 });
  return NextResponse.json({ homes: (data ?? []).map(toPublicHome) });
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// POST: save a viewing request. Same idempotency key twice returns the first result.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const key = clean(body.key, 80);
  const sb = getSupabaseAdmin();
  if (key) {
    const { data: prior } = await sb.from("viewing_requests").select("id").eq("idempotency_key", key).maybeSingle();
    if (prior) return NextResponse.json({ ok: true, ref: prior.id.slice(0, 8).toUpperCase() });
  }

  const errors: Record<string, string> = {};
  const homeId = clean(body.home, 64);
  const moveIn = clean(body.moveIn, 10);
  const occupants = Number(body.occupants);
  const income = clean(body.income, 20);
  const credit = clean(body.credit, 20);
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 200);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(moveIn) || moveIn < torontoToday()) errors.moveIn = "Pick a move-in date from today on.";
  if (!Number.isInteger(occupants) || occupants < 1 || occupants > 99) errors.occupants = "How many people will live there?";
  if (!INCOME_RANGES.some((r) => r.value === income)) errors.income = "Pick an income range.";
  if (!CREDIT_RANGES.some((r) => r.value === credit)) errors.credit = "Pick a credit range.";
  if (!name) errors.name = "Enter your name.";
  if (phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a phone number we can call.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Check your email address.";
  if (body.consent !== true) errors.consent = "Tick the box to send your request.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  // Recheck the home is still taking requests.
  const { data: home } = await activeHomes().eq("id", homeId).maybeSingle();
  if (!home) return NextResponse.json({ error: "That home isn't taking viewing requests any more. Pick another one.", code: "home_closed" }, { status: 409 });
  const snapshot = toPublicHome(home as Record<string, unknown>);

  const { data: saved, error } = await sb.from("viewing_requests").insert({
    property_id: snapshot.id,
    property_snapshot: snapshot,
    move_in_date: moveIn,
    occupants,
    income_range: income,
    credit_range: credit,
    full_name: name,
    phone,
    email: email || null,
    consent: true,
    consent_text: CONSENT_TEXT,
    idempotency_key: key || null,
  }).select("id").single();

  if (error || !saved) {
    // A racing duplicate with the same key: return the one that won.
    if (key) {
      const { data: prior } = await sb.from("viewing_requests").select("id").eq("idempotency_key", key).maybeSingle();
      if (prior) return NextResponse.json({ ok: true, ref: prior.id.slice(0, 8).toUpperCase() });
    }
    return NextResponse.json({ error: "We couldn't save your request. Try again." }, { status: 500 });
  }

  // Short heads-up to Ebin. The daily review does the sorting. A failed email doesn't undo the save.
  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Prospera Admin <hello@prosperaproperties.co>",
      to: ["prosperapropertiess@gmail.com"],
      subject: `Viewing request: ${snapshot.address}`,
      html: `<div style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222">
        <p><strong>${escapeHtml(name)}</strong> wants to see ${escapeHtml(snapshot.address)}.</p>
        <p>Move in ${moveIn} · ${occupants} ${occupants === 1 ? "person" : "people"} · income ${incomeLabel(income)} · credit ${creditLabel(credit)}</p>
        <p><a href="https://www.prosperaproperties.co/admin/viewing-requests" style="color:#8B2030;font-weight:600">Open viewing requests</a></p>
      </div>`,
    });
  } catch (err) {
    console.error("[view] notify failed", err);
  }

  return NextResponse.json({ ok: true, ref: saved.id.slice(0, 8).toUpperCase() }, { status: 201 });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
