import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { verifyId, ALL_SHOWINGS } from "@/lib/fieldops/engine";
import { SITE } from "@/lib/fieldops/messages";

export const dynamic = "force-dynamic";

// Private calendar feed (subscribe from Google/Apple Calendar). One link per
// specialist, plus one for Ebin with every showing. Read-only: the Prospera
// database stays the source of truth, calendars just mirror it.

const ics = (d: string | Date) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const fold = (line: string) => line.length <= 74 ? line : line.match(/.{1,74}/g)!.join("\r\n ");

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const raw = (await params).token.replace(/\.ics$/, "");
  const id = verifyId("ics", raw);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const all = id === ALL_SHOWINGS;
  let q = getSupabaseAdmin().from("fo_appointments")
    .select("id, starts_at, ends_at, status, tenant_name, updated_at, agent_id, properties(address, city), agents(name)")
    .gte("starts_at", new Date(Date.now() - 30 * 864e5).toISOString());
  if (!all) q = q.eq("agent_id", id);
  const { data } = await q.order("starts_at").limit(1000);

  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Prospera Properties//FieldOps//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    `X-WR-CALNAME:${all ? "Prospera showings (all)" : "My Prospera showings"}`, "X-WR-TIMEZONE:America/Toronto", "REFRESH-INTERVAL;VALUE=DURATION:PT30M"];
  for (const a of data ?? []) {
    const p = a.properties as unknown as { address: string; city: string };
    const who = (a.agents as unknown as { name: string } | null)?.name;
    const first = a.tenant_name.split(/\s+/)[0];
    lines.push(
      "BEGIN:VEVENT",
      `UID:${a.id}@fieldops.prosperaproperties.co`,
      `DTSTAMP:${ics(a.updated_at)}`,
      `SEQUENCE:${Math.floor(new Date(a.updated_at).getTime() / 1000) % 2147483647}`,
      `DTSTART:${ics(a.starts_at)}`,
      `DTEND:${ics(a.ends_at)}`,
      fold(`SUMMARY:${esc(`${a.status === "cancelled" ? "Cancelled: " : ""}Showing · ${p.address} · ${first}${all && who ? ` (${who})` : ""}`)}`),
      fold(`LOCATION:${esc(`${p.address}, ${p.city}, ON`)}`),
      fold(`DESCRIPTION:${esc(`${all ? `${SITE}/admin/fieldops?appt=${a.id}` : `${SITE}/team/showings/${a.id}`}`)}`),
      `STATUS:${a.status === "cancelled" ? "CANCELLED" : "CONFIRMED"}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return new NextResponse(lines.join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=300", "Content-Disposition": 'inline; filename="showings.ics"' },
  });
}
