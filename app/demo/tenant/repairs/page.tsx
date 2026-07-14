"use client";

import { useState } from "react";
import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import { DEMO_TENANT, MAINTENANCE } from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const GREEN = "#0A7A52";
const AMBER = "#B45309";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.65)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

const STATUS_BG: Record<string, string> = {
  "Open": "rgba(180,83,9,0.09)",
  "In Progress": "rgba(31,47,58,0.09)",
  "Done": "rgba(10,122,82,0.09)",
};
const STATUS_COLOR: Record<string, string> = {
  "Open": AMBER,
  "In Progress": NAVY,
  "Done": GREEN,
};

export default function TenantRepairsPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const open = MAINTENANCE.filter(m => m.status !== "Done");
  const done = MAINTENANCE.filter(m => m.status === "Done");

  return (
    <DemoShell mode="tenant" name={DEMO_TENANT.name} initials={DEMO_TENANT.initials}>

      <Link href="/demo/tenant" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "20px", fontWeight: 500 }}>
        ← Back
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 700, color: NAVY, letterSpacing: "-0.01em" }}>Repairs</h1>
        <button
          onClick={() => { setShowForm(!showForm); setSubmitted(false); }}
          style={{ background: NAVY, color: "#FAF8F5", border: "none", borderRadius: "10px", padding: "10px 18px", fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
        >
          + Request
        </button>
      </div>

      {/* Submit form */}
      {showForm && !submitted && (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "20px", marginBottom: "20px", boxShadow: CARD_SHADOW }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "16px" }}>New maintenance request</p>
          <div style={{ marginBottom: "12px" }}>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "6px" }}>Issue</p>
            <input type="text" placeholder="e.g. Bathroom faucet dripping" style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${BORDER}`, fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: NAVY, background: "rgba(15,28,40,0.03)", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "6px" }}>Details</p>
            <textarea placeholder="Describe the issue…" style={{ width: "100%", minHeight: "80px", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${BORDER}`, fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: NAVY, background: "rgba(15,28,40,0.03)", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setSubmitted(true)} style={{ background: NAVY, color: "#FAF8F5", border: "none", borderRadius: "10px", padding: "12px 20px", fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", flex: 1 }}>
              Submit
            </button>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "12px 20px", fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, color: MUTED, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ background: "rgba(10,122,82,0.07)", border: "1px solid rgba(10,122,82,0.20)", borderRadius: "14px", padding: "16px 18px", marginBottom: "20px" }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: GREEN, marginBottom: "4px" }}>✓ Request received</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: SUBTLE }}>We'll acknowledge your request within 4 business hours and follow up with a resolution path.</p>
        </div>
      )}

      {/* Open tickets */}
      {open.length > 0 && (
        <>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px" }}>Active</p>
          {open.map(t => (
            <div key={t.id} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${t.status === "In Progress" ? NAVY : AMBER}`, borderRadius: "16px", padding: "18px 20px", marginBottom: "8px", boxShadow: CARD_SHADOW }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: NAVY }}>{t.title}</p>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "10px", background: STATUS_BG[t.status], color: STATUS_COLOR[t.status], fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap", flexShrink: 0 }}>{t.status}</span>
              </div>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: SUBTLE, marginBottom: "8px" }}>Reported {t.dateReported}</p>
              {t.notes && (
                <div style={{ background: "rgba(31,47,58,0.04)", borderRadius: "8px", padding: "10px 12px" }}>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: SUBTLE }}><span style={{ fontWeight: 700, color: NAVY }}>Update: </span>{t.notes}</p>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Completed */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px", marginTop: "20px" }}>Completed</p>
      {done.map(t => (
        <div key={t.id} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "16px 18px", marginBottom: "8px", opacity: 0.8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: 700, color: NAVY }}>{t.title}</p>
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "10px", background: STATUS_BG["Done"], color: GREEN, fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap", flexShrink: 0 }}>Done</span>
          </div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED, marginTop: "4px" }}>Completed {t.dateCompleted}</p>
        </div>
      ))}
    </DemoShell>
  );
}
