import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { incomeLabel, creditLabel, type Answers, type PublicHome } from "@/lib/viewing-requests";

export const dynamic = "force-dynamic";

// The renter list = rental_profiles where the person said yes to hearing
// about homes (marketing_consent). Anti-spam law (CASL) means nobody goes on
// it without that yes, and "remove" turns it off rather than deleting the row,
// so we keep proof of when they asked to stop.

// GET: everyone on the list, with what they told us on their viewing request.
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  const { data: profiles, error } = await sb
    .from("rental_profiles")
    .select("*")
    .eq("completed", true)
    .eq("marketing_consent", true)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // RentMatch rows from /view carry session_id "view-<viewing request id>".
  const requestIds = (profiles ?? []).map((p) => p.session_id?.startsWith("view-") ? p.session_id.slice(5) : null).filter(Boolean) as string[];
  const { data: requests } = requestIds.length
    ? await sb.from("viewing_requests").select("id, move_in_date, occupants, income_range, credit_range, answers, property_snapshot").in("id", requestIds)
    : { data: [] };
  const byId = new Map((requests ?? []).map((r) => [r.id, r]));

  const renters = (profiles ?? []).map((p) => {
    const r = p.session_id?.startsWith("view-") ? byId.get(p.session_id.slice(5)) : undefined;
    const a = (r?.answers ?? {}) as Answers;
    const home = r?.property_snapshot as PublicHome | undefined;
    return {
      id: p.id,
      name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "No name",
      email: p.email || null,
      phone: p.phone || null,
      source: p.source,
      joined: p.created_at,
      moveDate: r?.move_in_date ?? null,
      moveTiming: r ? null : p.move_timing,
      people: r?.occupants ?? p.household_size ?? null,
      income: r ? incomeLabel(r.income_range) : null,
      credit: r ? creditLabel(r.credit_range) : null,
      pets: a.pets === "yes" ? (a.pet_details || "Yes") : a.pets ? "No pets" : (p.pets_note || null),
      bedrooms: p.bedrooms || (home?.bedrooms != null ? `${home.bedrooms}` : null),
      maxBudget: p.max_budget ?? null,
      askedAbout: home ? { address: home.address, price: home.price, bedrooms: home.bedrooms } : null,
      notes: r ? null : p.notes,
    };
  });
  return NextResponse.json({ renters });
}

// POST: add someone by hand (Marketplace message, phone call, walk-in).
// Requires the consent box — we only add people who said yes.
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase() || null;
  const phone = String(b.phone ?? "").trim() || null;
  if (!name) return NextResponse.json({ error: "Add their name." }, { status: 400 });
  if (!email && !phone) return NextResponse.json({ error: "Add an email or a phone number." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  if (b.consent !== true) return NextResponse.json({ error: "Only add people who said yes to getting homes from us." }, { status: 400 });

  const sb = getSupabaseAdmin();
  if (email) {
    const { data: dupe } = await sb.from("rental_profiles").select("id").eq("email", email).eq("marketing_consent", true).maybeSingle();
    if (dupe) return NextResponse.json({ error: "They're already on the list." }, { status: 409 });
  }
  const [first, ...rest] = name.split(/\s+/);
  const maxBudget = Number(String(b.maxBudget ?? "").replace(/[^0-9.]/g, "")) || null;
  const { data, error } = await sb.from("rental_profiles").insert({
    source: "manual",
    first_name: first,
    last_name: rest.join(" ") || null,
    email,
    phone,
    move_timing: String(b.moveTiming ?? "").trim() || null,
    bedrooms: String(b.bedrooms ?? "").trim() || null,
    max_budget: maxBudget,
    household_size: Number(b.people) || null,
    notes: [String(b.notes ?? "").trim(), `Added by hand ${new Date().toISOString().slice(0, 10)}; they said yes to getting homes from Prospera.`].filter(Boolean).join("\n"),
    marketing_consent: true,
    completed: true,
    completed_at: new Date().toISOString(),
    session_id: `manual-${crypto.randomUUID()}`,
    last_step: "complete",
  }).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}

// DELETE ?id=…: take someone off the list (they asked to stop).
export async function DELETE(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const sb = getSupabaseAdmin();
  const { data: row } = await sb.from("rental_profiles").select("notes").eq("id", id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { error } = await sb.from("rental_profiles").update({
    marketing_consent: false,
    notes: [row.notes, `Removed from the renter list ${new Date().toISOString().slice(0, 10)}.`].filter(Boolean).join("\n"),
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
