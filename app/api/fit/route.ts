import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { notifyFitSubmitted } from "@/lib/fit-notify";
import { getSupabaseAdmin } from "@/lib/supabase";
import { rateLimit } from "@/lib/rate-limit";
import { FIT_WRITABLE_FIELDS, cityFromArea } from "@/lib/fit-form";

// Evergreen entry point: anyone can submit, each submission becomes its own discovery row.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!rateLimit(`fit-new:${ip}`, 5, 60 * 60_000).allowed) {
    return NextResponse.json({ error: "Too many tries, please try again later" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.website) return NextResponse.json({ ok: true }); // honeypot: pretend success

  const email = String(body.landlord_email ?? "").trim().slice(0, 200);
  const name = String(body.landlord_name ?? "").trim();
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }

  const row: Record<string, unknown> = {};
  for (const f of FIT_WRITABLE_FIELDS) {
    if (!(f in body)) continue;
    const v = body[f];
    row[f] = typeof v === "string" ? v.trim().slice(0, 2000) || null : v;
  }
  if (typeof row.area === "string" && !row.property_city) row.property_city = cityFromArea(row.area) || null;
  if (row.address_disclosed === false) row.property_address = null;

  const now = new Date().toISOString();
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("discovery_calls")
    .insert({
      ...row,
      landlord_email: email,
      source: "link",
      fit_token: `fit-${randomBytes(9).toString("hex")}`,
      fit_sent_at: now,
      fit_submitted_at: now,
      outcome: "pending_decision",
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "Couldn't save, try again" }, { status: 500 });

  await notifyFitSubmitted(data.id, name);

  return NextResponse.json({ ok: true });
}
