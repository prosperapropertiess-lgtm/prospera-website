"use client";
import { useEffect, useRef, useState } from "react";
import { C, Button, inputStyle } from "@/components/admin/kit";
import {
  cad, bedsLabel, areaLabel, availabilityLabel, FLAG_TEXT, LISTING_FIELDS, exclusionReason, type Obs, type Override,
} from "@/lib/market/core";
import { Note, fmtDate, fmtDateTime, tabular, type Ctx } from "./shared";

interface Point { snapshot_id: string; scan_date: string | null; scan_label: string | null; seen: boolean; price: number | null; price_basis: string | null; cohort: string | null }

const REVIEW_FIELDS = [
  { v: "price_basis", label: "Price basis (whole_unit / per_room)" },
  { v: "type", label: "Property type" },
  { v: "bedrooms", label: "Bedrooms" },
  { v: "bathrooms", label: "Bathrooms" },
  { v: "price", label: "Price" },
  { v: "area", label: "Area" },
  { v: "exclude", label: "Leave out of statistics (true/false)" },
];

export default function Drawer({ o, ctx, overrides, outlierIds, sheetUrl, onClose, onChanged }: {
  o: Obs; ctx: Ctx; overrides: (Override & { id: string; reason: string | null; created_at: string; original_value: string | null })[];
  outlierIds: Set<string>; sheetUrl: string | null; onClose: () => void; onChanged: () => void;
}) {
  const [history, setHistory] = useState<Point[] | null>(null);
  const [field, setField] = useState("price_basis");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [scope, setScope] = useState<"listing" | "observation">("listing");
  const [saving, setSaving] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    opener.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); (opener.current as HTMLElement | null)?.focus?.(); };
  }, [onClose]);

  useEffect(() => {
    let live = true;
    fetch(`/api/admin/market/listing/${encodeURIComponent(o.listing_id)}`).then((r) => r.json()).then((d) => { if (live) setHistory(d.timeline ?? []); }).catch(() => live && setHistory([]));
    return () => { live = false; };
  }, [o.listing_id]);

  const n = o.norm;
  const reasonOut = exclusionReason(o, outlierIds, ctx.filters.outliers);
  const mine = overrides.filter((x) => x.listing_id === o.listing_id);
  const seenScans = (history ?? []).filter((p) => p.seen);

  async function saveReview() {
    if (!value.trim()) return;
    setSaving(true);
    await fetch("/api/admin/market/overrides", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listing_id: o.listing_id, field, original_value: field === "exclude" ? null : o.raw[field] ?? null, reviewed_value: value.trim(), reason, scope, snapshot_id: ctx.snapshot.id }),
    });
    setSaving(false); setValue(""); setReason("");
    onChanged();
  }

  const group = (title: string, rows: [string, React.ReactNode, string?][]) => (
    <div style={{ marginBottom: 18 }}>
      <h4 style={{ margin: "0 0 6px", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted }}>{title}</h4>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "minmax(110px, 38%) 1fr", gap: "6px 12px", fontSize: 14 }}>
        {rows.map(([k, v, raw]) => (
          <div key={k} style={{ display: "contents" }}>
            <dt style={{ color: C.muted }}>{k}</dt>
            <dd style={{ margin: 0, color: C.text, wordBreak: "break-word" }}>
              {v == null || v === "" ? <span style={{ color: C.faint }}>Not stated</span> : v}
              {raw !== undefined && raw !== "" && String(v) !== raw && <div style={{ fontSize: 12, color: C.faint }}>Source: “{raw}”</div>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label={n.title} style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(31,47,58,0.35)" }} />
      <aside style={{ position: "relative", width: "min(560px, 100vw)", height: "100%", background: C.surface, overflowY: "auto", padding: "20px 22px 40px", boxShadow: "-8px 0 24px rgba(0,0,0,0.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 13, color: C.muted }}>Listing {o.listing_id}</div>
            <h2 style={{ margin: "4px 0 6px", fontSize: 20, color: C.navy, lineHeight: 1.3 }}>{n.title || "Untitled ad"}</h2>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, ...tabular }}>
              {cad(n.price)} <span style={{ fontSize: 14, fontWeight: 500, color: C.muted }}>{n.price_basis === "per_room" ? "per room" : n.price_basis === "whole_unit" ? "whole unit" : n.price_basis} · asking rent</span>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" style={{ background: C.greyBg, border: "none", borderRadius: 8, width: 36, height: 36, fontSize: 18, cursor: "pointer", color: C.navy }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
          {n.url && <Button size="sm" href={n.url} target="_blank">Open on Marketplace ↗</Button>}
          <Button size="sm" onClick={() => { onClose(); ctx.drill({ type: [n.type], beds: [n.beds_cat], area: n.area ? [n.area] : [], market: n.price_basis === "per_room" ? "room" : "whole" }); }}>Similar listings</Button>
          {sheetUrl && o.source_row && <Button size="sm" href={`${sheetUrl}#gid=0&range=A${o.source_row}`} target="_blank">Source row {o.source_row} ↗</Button>}
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
          {reasonOut ? <Note tone="amber">Kept out of rent statistics: {reasonOut}</Note> : <Note>Used in {n.price_basis === "per_room" ? "per-room" : "whole-unit"} rent statistics.</Note>}
          {o.flags.filter((f) => f !== "reviewed").map((f) => <Note key={f} tone="amber">{FLAG_TEXT[f]}</Note>)}
        </div>

        {group("Configuration", [
          ["Property type", n.type, o.raw.type],
          ["Bedrooms", bedsLabel(n.beds_cat), o.raw.bedrooms],
          ["Bathrooms", n.baths, o.raw.bathrooms],
          ["Size", n.sqft ? `${n.sqft.toLocaleString()} sq ft` : null, o.raw.sqft],
          ["Rent per sq ft", n.price && n.sqft ? `$${(n.price / n.sqft).toFixed(2)}` : null],
          ["Furnished", n.furnished, o.raw.furnished],
          ["Pets (as advertised)", n.pets, o.raw.pets],
        ])}
        {group("Location", [
          ["Area", areaLabel(n.area), o.raw.area],
          ["Street", n.address, o.raw.street_address],
        ])}
        {group("Inclusions", [
          ["Utilities", n.utilities.join(", "), o.raw.utilities],
          ["Parking", n.parking, o.raw.parking],
          ["Laundry", n.laundry, o.raw.laundry],
        ])}
        {group("Dates", [
          ["Available", availabilityLabel(n.available, o.raw.available_date ?? ""), o.raw.available_date],
          ["Posted", n.created_at ? fmtDateTime(n.created_at) : null, o.raw.creation_date],
          ["Days since posting", n.created_at && ctx.snapshot.scan_date ? Math.max(0, Math.round((new Date(`${ctx.snapshot.scan_date}T23:59:00-05:00`).getTime() - new Date(n.created_at).getTime()) / 86_400_000)) : null],
          ["First seen (source)", fmtDate(n.first_seen)],
        ])}
        {group("Provenance", [
          ["Found by searches", n.queries.join(", ")],
          ["Scan", `${fmtDate(ctx.snapshot.scan_date)}${ctx.snapshot.scan_label ? ` (${ctx.snapshot.scan_label})` : ""}`],
          ["Snapshot ID", <code key="s" style={{ fontSize: 12 }}>{ctx.snapshot.id}</code>],
          ["Sheet row", o.source_row],
          ...Object.entries(n.extra).map(([k, v]) => [`${k} (new source field)`, v] as [string, React.ReactNode]),
        ])}

        <div style={{ marginBottom: 18 }}>
          <h4 style={{ margin: "0 0 6px", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted }}>Asking-price history</h4>
          {!history ? <p style={{ color: C.faint, fontSize: 14 }}>Loading…</p> : (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, ...tabular }}>
                <tbody>
                  {history.map((p, i) => {
                    const prev = history.slice(0, i).reverse().find((x) => x.seen);
                    const change = p.seen && prev?.seen && p.price != null && prev.price != null && p.price_basis === prev.price_basis ? p.price - prev.price : null;
                    const wasAbsent = p.seen && i > 0 && !history[i - 1].seen && history.slice(0, i - 1).some((x) => x.seen);
                    return (
                      <tr key={p.snapshot_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "6px 0" }}>{fmtDate(p.scan_date)}</td>
                        <td style={{ padding: "6px 0", textAlign: "right" }}>
                          {p.seen ? cad(p.price) : <span style={{ color: C.faint }}>Not seen in this scan</span>}
                          {change ? <span style={{ color: C.muted }}> ({change > 0 ? "+" : ""}{cad(change)})</span> : null}
                          {wasAbsent && <span style={{ color: C.muted }}> · reappeared</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ fontSize: 12, color: C.muted, margin: "6px 0 0" }}>
                {seenScans.length <= 1 ? "Only one scan so far. History builds as weekly scans are imported." : `Seen in ${seenScans.length} of ${history.length} scans, ${fmtDate(seenScans[0].scan_date)} to ${fmtDate(seenScans[seenScans.length - 1].scan_date)}. Being seen doesn't prove it stayed available.`}
              </p>
            </>
          )}
        </div>

        <div style={{ marginBottom: 18 }}>
          <h4 style={{ margin: "0 0 6px", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.5, color: C.muted }}>Original source row</h4>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "minmax(110px, 38%) 1fr", gap: "4px 12px", fontSize: 13 }}>
            {[...LISTING_FIELDS, ...Object.keys(o.raw).filter((k) => !(LISTING_FIELDS as readonly string[]).includes(k))].map((k) => (
              <div key={k} style={{ display: "contents" }}>
                <dt style={{ color: C.muted, fontFamily: "monospace" }}>{k}</dt>
                <dd style={{ margin: 0, wordBreak: "break-word" }}>{o.raw[k] ? o.raw[k] : <span style={{ color: C.faint }}>(blank)</span>}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div style={{ background: C.greyBg, borderRadius: 10, padding: 14 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 14, color: C.navy }}>Correct this listing</h4>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: C.muted }}>Corrections are saved here with your reason. The Google Sheet is never changed.</p>
          <div style={{ display: "grid", gap: 8 }}>
            <select aria-label="Field to correct" value={field} onChange={(e) => setField(e.target.value)} style={inputStyle}>
              {REVIEW_FIELDS.map((f) => <option key={f.v} value={f.v}>{f.label}</option>)}
            </select>
            <input aria-label="Corrected value" placeholder={field === "exclude" ? "true" : `Source: ${o.raw[field] || "(blank)"}`} value={value} onChange={(e) => setValue(e.target.value)} style={inputStyle} />
            <input aria-label="Reason" placeholder="Why (e.g. ad says it's the whole basement)" value={reason} onChange={(e) => setReason(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: 13, display: "flex", gap: 6 }}><input type="radio" checked={scope === "listing"} onChange={() => setScope("listing")} /> Apply to this listing in every scan</label>
            <label style={{ fontSize: 13, display: "flex", gap: 6 }}><input type="radio" checked={scope === "observation"} onChange={() => setScope("observation")} /> Only this scan</label>
            <Button variant="primary" disabled={saving || !value.trim()} onClick={saveReview}>{saving ? "Saving…" : "Save correction"}</Button>
          </div>
          {mine.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 13 }}>
              <strong>History</strong>
              {mine.map((x) => (
                <div key={x.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span>{fmtDateTime(x.created_at)}: {x.field} “{x.original_value ?? ""}” → “{x.reviewed_value}”{x.reason ? ` (${x.reason})` : ""}{x.scope === "observation" ? " · this scan only" : ""}</span>
                  <button type="button" onClick={async () => { await fetch(`/api/admin/market/overrides?id=${x.id}`, { method: "DELETE" }); onChanged(); }}
                    style={{ background: "none", border: "none", color: C.navy, textDecoration: "underline", cursor: "pointer", whiteSpace: "nowrap" }}>Undo</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
