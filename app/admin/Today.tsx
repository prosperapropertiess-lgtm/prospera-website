"use client";
// The top of the admin home: everything that needs Ebin right now, across every home.
import { useEffect, useState } from "react";
import Link from "next/link";

const NAVY = "#1F2F3A", BURGUNDY = "#8B2030", BORDER = "#E0DBD4", MUTED = "#666666";

interface Item { id: string; kind: string; title: string; detail: string | null; home: string | null; href: string; at: string; urgent: boolean }
interface Data { items: Item[]; showingsToday: { at: string; home: string | null; name: string | null }[] }

const ICON: Record<string, string> = { viewing: "call", application: "assignment", owner: "person", payment: "payments", update: "campaign", showing: "event", repair: "handyman", next_action: "flag" };
const waited = (iso: string) => {
  const h = (Date.now() - new Date(iso).getTime()) / 36e5;
  if (h < 0) return "";
  if (h < 1) return "just now";
  if (h < 24) return `${Math.floor(h)} h`;
  return `${Math.floor(h / 24)} d`;
};
const time = (iso: string) => new Date(iso).toLocaleTimeString("en-CA", { timeZone: "America/Toronto", hour: "numeric", minute: "2-digit" }).replace(/\./g, "");
const title = (s: string | null) => s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : null;

export default function Today() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const load = () => fetch("/api/admin/today").then((r) => (r.ok ? r.json() : Promise.reject())).then(setD).catch(() => setErr(true));
    load();
    const t = setInterval(load, 60000);
    const vis = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, []);

  if (err) return null;
  const items = d?.items ?? [];

  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: NAVY, margin: 0 }}>
          {!d ? "Today" : items.length ? `${items.length} thing${items.length === 1 ? "" : "s"} need${items.length === 1 ? "s" : ""} you` : "You're all caught up"}
        </h2>
        {d && d.showingsToday.length > 0 && <span style={{ fontSize: 14, color: MUTED }}>{d.showingsToday.length} showing{d.showingsToday.length === 1 ? "" : "s"} today</span>}
      </div>

      {!d ? (
        <div style={{ display: "grid", gap: 10 }}>{[0, 1, 2].map((i) => <div key={i} style={{ height: 72, borderRadius: 16, background: "#FFF", border: `1px solid ${BORDER}`, opacity: 0.6 }} />)}</div>
      ) : items.length === 0 ? (
        <div style={{ background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "22px 20px", color: MUTED, fontSize: 15 }}>
          Nothing is waiting on you. New viewing requests, applications, owner questions and payments will show up here.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((it) => (
            <Link key={it.id} href={it.href} style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#FFF", border: `1px solid ${BORDER}`, borderLeft: `4px solid ${it.urgent ? BURGUNDY : BORDER}`, borderRadius: 16, padding: "14px 16px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: NAVY, width: 40, height: 40, borderRadius: 20, background: "rgba(31,47,58,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ICON[it.kind] ?? "task_alt"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: NAVY, lineHeight: 1.3 }}>{it.title}</div>
                  <div style={{ fontSize: 14, color: MUTED, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {[title(it.home), it.detail].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <span style={{ fontSize: 13, color: it.urgent ? BURGUNDY : MUTED, fontWeight: it.urgent ? 600 : 400, flexShrink: 0 }}>{waited(it.at)}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: MUTED, flexShrink: 0 }}>chevron_right</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {d && d.showingsToday.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {d.showingsToday.map((s, i) => (
            <Link key={i} href="/admin/fieldops" style={{ textDecoration: "none", fontSize: 14, color: NAVY, background: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 99, padding: "6px 12px" }}>
              <b>{time(s.at)}</b> · {title(s.home) ?? "Showing"}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
