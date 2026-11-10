// FieldOps concurrency check against a live site. Creates throwaway specialists,
// turns booking on for one home, fires many bookings at once, checks the results,
// then removes everything it made (and restores the home's booking rules).
//
//   node --env-file=.env.production.local scripts/fieldops-stress.mjs [https://www.prosperaproperties.co]
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_PASSWORD.

import { createClient } from "@supabase/supabase-js";

const BASE = process.argv[2] ?? "https://www.prosperaproperties.co";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const AGENTS = ["22222222-0000-4000-8000-000000000001", "22222222-0000-4000-8000-000000000002"];
const TAG = "ZZ Stress";
let failures = 0;
const check = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) failures++; };

let cookie = "";
async function admin(body) {
  const r = await fetch(`${BASE}/api/admin/fieldops`, { method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify(body) });
  return r.json();
}

const { data: home } = await sb.from("properties").select("id, address").eq("is_managed", true).eq("available", true).eq("status", "published").limit(1).single();
const { data: savedRules } = await sb.from("fo_property_rules").select("*").eq("property_id", home.id).maybeSingle();

async function cleanup() {
  const { data: appts } = await sb.from("fo_appointments").select("id").or(`tenant_name.like.${TAG}%,agent_id.in.(${AGENTS.join(",")})`);
  const ids = (appts ?? []).map((a) => a.id);
  if (ids.length) {
    await sb.from("fo_earnings").delete().in("appointment_id", ids);
    await sb.from("fo_messages").delete().in("appointment_id", ids);
    await sb.from("fo_events").delete().in("appointment_id", ids);
    await sb.from("fo_appointments").delete().in("id", ids);
  }
  const { data: toks } = await sb.from("fo_booking_tokens").select("id").like("tenant_name", `${TAG}%`);
  if (toks?.length) { await sb.from("fo_messages").delete().in("booking_token_id", toks.map((t) => t.id)); await sb.from("fo_booking_tokens").delete().in("id", toks.map((t) => t.id)); }
  await sb.from("agent_sessions").delete().in("agent_id", AGENTS);
  await sb.from("agents").delete().in("id", AGENTS);
  if (savedRules) await sb.from("fo_property_rules").upsert(savedRules);
  else await sb.from("fo_property_rules").delete().eq("property_id", home.id);
}

try {
  await cleanup();
  await sb.from("agents").insert(AGENTS.map((id, i) => ({ id, name: `${TAG} ${i + 1}`, email: `delivered+stress${i}@resend.dev`, is_active: true, role: "specialist", activated_at: new Date().toISOString(), max_per_day: 20 })));
  await sb.from("fo_availability_rules").insert(AGENTS.flatMap((agent_id) => [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ agent_id, weekday, start_min: 600, end_min: 720 }))));
  await sb.from("fo_property_rules").upsert({ ...(savedRules ?? {}), property_id: home.id, booking_enabled: true, duration_min: 20, min_notice_hours: 12, horizon_days: 4, max_per_slot: 1, windows: [] });

  const login = await fetch(`${BASE}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }) });
  cookie = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(";")[0]).join("; ");
  check(login.ok, "admin login");

  const N = 12;
  const links = await Promise.all(Array.from({ length: N }, (_, i) => admin({ action: "direct_booking_link", property: home.id, name: `${TAG} Tenant ${i}`, sendEmail: false }).then((r) => r.url.split("/book/")[1])));
  const { slots } = await (await fetch(`${BASE}/api/book/${links[0]}`)).json();
  check(slots.length >= 6, `${slots.length} open times with 2 specialists`);

  // 1) Everyone tries the very same time at once. Home allows one household per slot.
  const same = await Promise.all(links.map((t) => fetch(`${BASE}/api/book/${t}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ start: slots[0] }) }).then((r) => r.status)));
  check(same.filter((s) => s === 200).length === 1, `${N} people, same time: ${same.filter((s) => s === 200).length} booked, ${same.filter((s) => s === 409).length} told it's taken`);

  // 2) The rest spread over the next times at once: at most one per time, no specialist overlaps.
  const rest = links.filter((_, i) => same[i] !== 200);
  const picks = rest.map((_, i) => slots[1 + (i % Math.min(4, slots.length - 1))]);
  const spread = await Promise.all(rest.map((t, i) => fetch(`${BASE}/api/book/${t}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ start: picks[i] }) }).then((r) => r.status)));
  const wanted = new Set(picks).size;
  check(spread.filter((s) => s === 200).length === wanted, `${rest.length} people over ${wanted} times: ${spread.filter((s) => s === 200).length} booked (expected ${wanted})`);

  const { data: booked } = await sb.from("fo_appointments").select("agent_id, starts_at, ends_at, property_id").like("tenant_name", `${TAG}%`).in("status", ["confirmed", "in_progress", "reassignment_pending"]);
  const perSlot = new Map();
  for (const b of booked) perSlot.set(b.starts_at, (perSlot.get(b.starts_at) ?? 0) + 1);
  check([...perSlot.values()].every((n) => n === 1), "never two households in one slot");
  const overlap = booked.some((a, i) => booked.some((b, j) => i < j && a.agent_id === b.agent_id && a.starts_at < b.ends_at && b.starts_at < a.ends_at));
  check(!overlap, "no specialist booked twice at once");
} catch (err) {
  failures++;
  console.error(err);
} finally {
  await cleanup();
  const { count } = await sb.from("fo_appointments").select("id", { count: "exact", head: true }).like("tenant_name", `${TAG}%`);
  check(count === 0, "cleaned up");
  process.exit(failures ? 1 : 0);
}
