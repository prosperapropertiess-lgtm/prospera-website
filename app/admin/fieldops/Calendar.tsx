"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Button, Loading, ErrorNote, C } from "@/components/admin/kit";
import { api, fTime, dayOf, shade, STATUS, input, mm } from "./shared";

interface Appt { id: string; property_id: string; agent_id: string | null; starts_at: string; ends_at: string; status: string; tenant_name: string; acknowledged_at: string | null; properties: { address: string } }
interface Data {
  appts: Appt[];
  blocks: { agent_id: string; day: string; start_min: number; end_min: number }[];
  agents: { id: string; name: string }[];
  homes: { id: string; address: string }[];
  capacity: Record<string, Record<string, number>>;
}

const HOUR = 64;
const TZ = "America/Toronto";

function addDays(day: string, n: number) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
function minOfDay(iso: string) {
  const [h, m] = new Date(iso).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).split(":").map(Number);
  return h * 60 + m;
}
const label = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString("en-CA", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });

export default function Calendar({ onOpen }: { onOpen: (id: string) => void }) {
  const [from, setFrom] = useState(() => dayOf(new Date().toISOString()));
  const [d, setD] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState("all");
  const [home, setHome] = useState("all");

  useEffect(() => {
    let live = true;
    api<Data>("calendar", `&from=${from}&days=7`).then((x) => { if (live) { setD(x); setError(null); } }).catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, [from]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(from, i)), [from]);
  const colour = useMemo(() => new Map((d?.agents ?? []).map((a, i) => [a.id, shade(i)])), [d]);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!d) return <Loading />;

  const blocks = d.blocks.filter((b) => agent === "all" || b.agent_id === agent);
  const appts = d.appts.filter((a) => (agent === "all" || a.agent_id === agent) && (home === "all" || a.property_id === home));
  const mins = [...blocks.map((b) => b.start_min), ...appts.map((a) => minOfDay(a.starts_at)), 9 * 60];
  const maxs = [...blocks.map((b) => b.end_min), ...appts.map((a) => minOfDay(a.ends_at)), 19 * 60];
  const top = Math.floor(Math.min(...mins) / 60) * 60;
  const bottom = Math.min(24 * 60, Math.ceil(Math.max(...maxs) / 60) * 60);
  const hours = Array.from({ length: (bottom - top) / 60 }, (_, i) => top + i * 60);
  const y = (m: number) => ((m - top) / 60) * HOUR;
  const agentCount = Math.max(1, agent === "all" ? d.agents.length : 1);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
        <Button size="sm" onClick={() => setFrom(addDays(from, -7))}>← Earlier</Button>
        <Button size="sm" onClick={() => setFrom(dayOf(new Date().toISOString()))}>This week</Button>
        <Button size="sm" onClick={() => setFrom(addDays(from, 7))}>Later →</Button>
        <span style={{ fontWeight: 600, color: C.navy, marginLeft: 6 }}>{label(days[0])} – {label(days[6])}</span>
        <span style={{ flex: 1 }} />
        <select value={agent} onChange={(e) => setAgent(e.target.value)} style={{ ...input, width: 200 }} aria-label="Specialist">
          <option value="all">All specialists</option>
          {d.agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={home} onChange={(e) => setHome(e.target.value)} style={{ ...input, width: 220 }} aria-label="Home">
          <option value="all">All homes</option>
          {d.homes.map((h) => <option key={h.id} value={h.id}>{h.address}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: C.muted, marginBottom: 10 }}>
        <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "rgba(47,107,63,0.16)", verticalAlign: -2, marginRight: 6 }} />Someone is free (darker = more people)</span>
        <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: C.navy, verticalAlign: -2, marginRight: 6 }} />Booked showing</span>
        <span><span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, border: `2px dashed ${C.burgundy}`, verticalAlign: -3, marginRight: 6 }} />Not acknowledged yet</span>
      </div>

      <Card padding={0} style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `56px repeat(7, minmax(130px, 1fr))`, minWidth: 980 }}>
            <div style={{ borderBottom: `1px solid ${C.border}` }} />
            {days.map((day) => {
              const open = Object.entries(d.capacity).filter(([h]) => home === "all" || h === home).reduce((s, [, v]) => s + (v[day] ?? 0), 0);
              const isToday = day === dayOf(new Date().toISOString());
              return (
                <div key={day} style={{ padding: "10px 10px 8px", borderBottom: `1px solid ${C.border}`, borderLeft: `1px solid ${C.border}`, background: isToday ? "#FBFAF8" : C.surface }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isToday ? C.burgundy : C.navy }}>{label(day)}</div>
                  <div style={{ fontSize: 12, color: open ? C.green : C.faint }}>{open ? `${open} open ${open === 1 ? "time" : "times"}` : "no open times"}</div>
                </div>
              );
            })}

            <div style={{ position: "relative", height: hours.length * HOUR }}>
              {hours.map((h) => <div key={h} style={{ position: "absolute", top: y(h) - 7, right: 8, fontSize: 11, color: C.faint }}>{mm(h)}</div>)}
            </div>
            {days.map((day) => {
              const dayBlocks = blocks.filter((b) => b.day === day);
              const dayAppts = appts.filter((a) => dayOf(a.starts_at) === day);
              // Count how many people are free in each 30-minute step for the shading.
              const steps: { m: number; n: number }[] = [];
              for (let m = top; m < bottom; m += 30) steps.push({ m, n: dayBlocks.filter((b) => b.start_min <= m && b.end_min >= m + 30).length });
              return (
                <div key={day} style={{ position: "relative", height: hours.length * HOUR, borderLeft: `1px solid ${C.border}` }}>
                  {hours.map((h) => <div key={h} style={{ position: "absolute", left: 0, right: 0, top: y(h), borderTop: `1px solid ${h % 60 ? "transparent" : "#F0ECE6"}` }} />)}
                  {steps.filter((s) => s.n).map((s) => (
                    <div key={s.m} title={`${s.n} free at ${mm(s.m)}`} style={{ position: "absolute", left: 0, right: 0, top: y(s.m), height: HOUR / 2, background: `rgba(47,107,63,${0.08 + 0.16 * (s.n / agentCount)})` }} />
                  ))}
                  {dayAppts.map((a) => {
                    const s = minOfDay(a.starts_at), e = minOfDay(a.ends_at);
                    const st = STATUS[a.status];
                    const dim = ["completed", "followed_up", "no_show", "failed"].includes(a.status);
                    const unacked = !a.acknowledged_at && a.status === "confirmed";
                    return (
                      <button key={a.id} onClick={() => onOpen(a.id)} title={`${fTime(a.starts_at)} ${a.properties.address} · ${a.tenant_name} · ${st?.label}`}
                        style={{
                          position: "absolute", left: 4, right: 4, top: y(s) + 1, height: Math.max(16, y(e) - y(s) - 2), borderRadius: 6, cursor: "pointer", textAlign: "left",
                          padding: "1px 7px", overflow: "hidden", fontFamily: "inherit", lineHeight: 1.2, boxSizing: "border-box",
                          background: a.status === "reassignment_pending" ? C.redBg : dim ? "#EDEAE5" : a.agent_id ? colour.get(a.agent_id) ?? C.navy : C.redBg,
                          color: a.status === "reassignment_pending" || !a.agent_id ? C.red : dim ? C.muted : "#fff",
                          border: unacked ? `2px dashed ${C.burgundy}` : "1px solid rgba(0,0,0,0.05)",
                        }}>
                        <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fTime(a.starts_at)} {a.tenant_name.split(" ")[0]}</div>
                        {y(e) - y(s) >= 34 && <div style={{ fontSize: 11, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.properties.address}</div>}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {d.agents.length > 0 && (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12, fontSize: 13, color: C.muted }}>
          {d.agents.map((a) => <span key={a.id}><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 99, background: colour.get(a.id), marginRight: 6 }} />{a.name}</span>)}
        </div>
      )}
    </div>
  );
}
