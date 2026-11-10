// Run with: npm test
// Pure tests of the scheduling rules. No database: every test builds its own context.

import { test } from "node:test";
import assert from "node:assert/strict";
import { blocker, candidates, slotsFor, travelMin, verifyId, signId, DEFAULT_RULES, type Ctx, type PropertyRules } from "./engine";
import { addDays, localParts, todayToronto, weekdayOf, zonedToUtc } from "./time";

process.env.FIELDOPS_SECRET ||= "test-secret-for-unit-tests-only";

const HOME_A = "aaaaaaaa-0000-4000-8000-000000000001";
const HOME_B = "bbbbbbbb-0000-4000-8000-000000000002";
const ANA = "11111111-0000-4000-8000-00000000000a";
const BEN = "11111111-0000-4000-8000-00000000000b";
const DAY = addDays(todayToronto(), 3);           // far enough ahead to clear the notice period
const WD = weekdayOf(DAY);

function ctx(over: Partial<Ctx> = {}): Ctx {
  return {
    settings: { pay_basis: "household", showing_fee: 25, bonus_enabled: false, bonus_pct: 10, reminder_hours: [24, 2], booking_link_days: 7, weight_batch: 40, weight_fair: 30, weight_reliable: 20, weight_travel: 10 },
    agents: [{ id: ANA, name: "Ana", max_per_day: 8 }, { id: BEN, name: "Ben", max_per_day: 8 }],
    rules: [
      { agent_id: ANA, weekday: WD, start_min: 17 * 60, end_min: 19 * 60 },
      { agent_id: BEN, weekday: WD, start_min: 17 * 60, end_min: 19 * 60 },
    ],
    exceptions: [],
    appts: [],
    // Homes about 8 km apart → 2 min/km + 10 = 26 min estimated travel.
    props: new Map([[HOME_A, { id: HOME_A, latitude: 42.98, longitude: -81.25 }], [HOME_B, { id: HOME_B, latitude: 43.05, longitude: -81.25 }]]),
    reliability: new Map(),
    blackouts: [],
    ...over,
  };
}
const rules = (over: Partial<PropertyRules> = {}): PropertyRules => ({
  ...DEFAULT_RULES, property_id: HOME_A, booking_enabled: true, horizon_days: 5, min_notice_hours: 0,
  windows: [{ weekday: WD, start_min: 17 * 60, end_min: 19 * 60 }], ...over,
});
const at = (min: number) => zonedToUtc(DAY, min)!;
const plus = (d: Date, m: number) => new Date(d.getTime() + m * 60_000);
const appt = (id: string, agent: string, home: string, min: number, len = 20, status = "confirmed") =>
  ({ id, agent_id: agent, property_id: home, starts_at: at(min).toISOString(), ends_at: plus(at(min), len).toISOString(), status });

test("time: skipped spring hour doesn't exist, autumn repeat isn't doubled", () => {
  assert.equal(zonedToUtc("2026-03-08", 150), null);                         // 2:30am never happens
  assert.equal(zonedToUtc("2026-03-08", 180)!.toISOString(), "2026-03-08T07:00:00.000Z");
  assert.equal(zonedToUtc("2026-11-01", 90)!.toISOString(), "2026-11-01T05:30:00.000Z"); // first 1:30am (EDT)
  assert.deepEqual(localParts(new Date("2026-07-02T03:40:00Z")), { day: "2026-07-01", min: 23 * 60 + 40, weekday: 3 });
});

test("slots: only inside the home's window and specialist hours, one per showing length", () => {
  const s = slotsFor(ctx(), rules()).filter((x) => localParts(new Date(x.start)).day === DAY);
  assert.equal(s.length, 6);                                                  // 5:00, 5:20 … 6:40
  assert.equal(localParts(new Date(s[0].start)).min, 17 * 60);
  assert.equal(localParts(new Date(s[5].start)).min, 18 * 60 + 40);
  assert.equal(new Set(s.map((x) => x.start)).size, s.length);
});

test("slots: nobody free = no slots, even inside the home's window", () => {
  assert.equal(slotsFor(ctx({ rules: [] }), rules()).length, 0);
});

test("slots: a full slot at the home disappears, other homes unaffected", () => {
  const c = ctx({ appts: [appt("x", ANA, HOME_A, 17 * 60)] });
  const a = slotsFor(c, rules()).map((x) => x.start);
  assert.ok(!a.includes(at(17 * 60).toISOString()));
  const b = slotsFor(c, rules({ property_id: HOME_B })).map((x) => x.start);
  assert.ok(b.includes(at(17 * 60).toISOString()));                           // Ben is still free for Home B
});

test("slots: blackouts and the notice period remove times", () => {
  const c = ctx({ blackouts: [{ property_id: HOME_A, starts_at: at(17 * 60).toISOString(), ends_at: at(18 * 60).toISOString() }] });
  assert.equal(slotsFor(c, rules()).filter((x) => localParts(new Date(x.start)).day === DAY).length, 3);
  const tooSoon = slotsFor(ctx(), rules({ min_notice_hours: 24 * 30 }));
  assert.equal(tooSoon.length, 0);
});

test("blocker: time off and outside hours", () => {
  assert.equal(blocker(ctx(), ANA, HOME_A, at(16 * 60), at(16 * 60 + 20), 20), "not available then");
  const off = ctx({ exceptions: [{ agent_id: ANA, day: DAY, kind: "off", start_min: 0, end_min: 1440 }] });
  assert.equal(blocker(off, ANA, HOME_A, at(17 * 60), at(17 * 60 + 20), 20), "not available then");
  const extra = ctx({ exceptions: [{ agent_id: ANA, day: DAY, kind: "extra", start_min: 12 * 60, end_min: 13 * 60 }] });
  assert.equal(blocker(extra, ANA, HOME_A, at(12 * 60), at(12 * 60 + 20), 20), null);
});

test("blocker: back-to-back at the same home is fine, another home needs travel time", () => {
  const c = ctx({ appts: [appt("x", ANA, HOME_A, 17 * 60)] });
  assert.equal(blocker(c, ANA, HOME_A, at(17 * 60 + 20), at(17 * 60 + 40), 20), null);
  assert.equal(blocker(c, ANA, HOME_B, at(17 * 60 + 20), at(17 * 60 + 40), 20), "not enough travel time");
  assert.equal(blocker(c, ANA, HOME_B, at(18 * 60), at(18 * 60 + 20), 20), null);        // 40 min later is enough
  assert.equal(blocker(c, ANA, HOME_A, at(17 * 60 + 10), at(17 * 60 + 30), 20), "already showing then");
});

test("blocker: cancelled showings don't block, daily cap does", () => {
  const cancelled = ctx({ appts: [appt("x", ANA, HOME_A, 17 * 60, 20, "cancelled")] });
  assert.equal(blocker(cancelled, ANA, HOME_A, at(17 * 60), at(17 * 60 + 20), 20), null);
  const capped = ctx({ agents: [{ id: ANA, name: "Ana", max_per_day: 1 }], appts: [appt("x", ANA, HOME_A, 17 * 60)] });
  assert.equal(blocker(capped, ANA, HOME_A, at(18 * 60), at(18 * 60 + 20), 20), "daily limit reached");
});

test("travel: estimated from the map, never below the buffer, zero for the same home", () => {
  const c = ctx();
  assert.equal(travelMin(c, HOME_A, HOME_A, 20), 0);
  const t = travelMin(c, HOME_A, HOME_B, 20);
  assert.ok(t >= 20 && t <= 40, `got ${t}`);
  assert.equal(travelMin(ctx({ props: new Map() }), HOME_A, HOME_B, 25), 25);
});

test("assignment: prefers the specialist already at that home (batching)", () => {
  const c = ctx({ appts: [appt("x", BEN, HOME_A, 17 * 60)] });
  const ranked = candidates(c, HOME_A, at(17 * 60 + 20), at(17 * 60 + 40), 20);
  assert.equal(ranked[0].agentId, BEN);
  assert.match(ranked[0].reason, /already at this home/);
});

test("assignment: otherwise spreads work to whoever has less", () => {
  const busy = new Date(Date.now() + 2 * 864e5);
  const c = ctx({ appts: [{ id: "y", agent_id: ANA, property_id: HOME_B, starts_at: busy.toISOString(), ends_at: plus(busy, 20).toISOString(), status: "confirmed" }] });
  const ranked = candidates(c, HOME_A, at(18 * 60), at(18 * 60 + 20), 20);
  assert.equal(ranked[0].agentId, BEN);
});

test("links: signed ids verify, edited ones don't, kinds don't mix", () => {
  const id = "3f1c2b8a-1d2e-4f5a-9b6c-7d8e9f0a1b2c";
  const t = signId("book", id);
  assert.equal(verifyId("book", t), id);
  assert.equal(verifyId("manage", t), null);
  assert.equal(verifyId("book", t.slice(0, -1) + (t.endsWith("A") ? "B" : "A")), null);
  assert.equal(verifyId("book", "garbage"), null);
});
