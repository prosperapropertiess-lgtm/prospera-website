"use client";

import { useState } from "react";
import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import { DEMO_TENANT, TENANT_MESSAGES } from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.65)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

export default function TenantMessagesPage() {
  const [sent, setSent] = useState(false);
  const unread = TENANT_MESSAGES.filter(m => !m.read).length;

  return (
    <DemoShell mode="tenant" name={DEMO_TENANT.name} initials={DEMO_TENANT.initials}>

      <Link href="/demo/tenant" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "20px", fontWeight: 500 }}>
        ← Back
      </Link>

      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 700, color: NAVY, marginBottom: "8px", letterSpacing: "-0.01em" }}>Messages</h1>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, marginBottom: "28px" }}>
        {unread} unread · Response within 4 business hours
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
        {TENANT_MESSAGES.map(msg => (
          <div
            key={msg.id}
            style={{
              background: WHITE,
              border: `1px solid ${msg.read ? BORDER : "rgba(31,47,58,0.15)"}`,
              borderLeft: `3px solid ${msg.read ? BORDER : NAVY}`,
              borderRadius: "16px",
              padding: "18px 20px",
              boxShadow: msg.read ? "none" : CARD_SHADOW,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#FAF8F5", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-dm-sans)" }}>PP</span>
                </div>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: 700, color: NAVY }}>{msg.senderName}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {!msg.read && <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: BURGUNDY, display: "inline-block" }} />}
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED }}>{msg.date}</p>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: SUBTLE, lineHeight: 1.65 }}>{msg.body}</p>
          </div>
        ))}
      </div>

      {/* Compose */}
      {!sent ? (
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "20px", boxShadow: CARD_SHADOW }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, color: NAVY, marginBottom: "12px" }}>Send a message</p>
          <textarea
            placeholder="Type your message…"
            style={{ width: "100%", minHeight: "100px", background: "rgba(15,28,40,0.03)", border: `1px solid ${BORDER}`, borderRadius: "10px", padding: "12px 14px", fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: NAVY, resize: "vertical", outline: "none", boxSizing: "border-box" }}
          />
          <button
            onClick={() => setSent(true)}
            style={{ marginTop: "10px", background: NAVY, color: "#FAF8F5", border: "none", borderRadius: "10px", padding: "12px 24px", fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
          >
            Send
          </button>
        </div>
      ) : (
        <div style={{ background: "rgba(10,122,82,0.07)", border: "1px solid rgba(10,122,82,0.20)", borderRadius: "14px", padding: "16px 18px" }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: "#0A7A52", marginBottom: "4px" }}>✓ Message sent</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: SUBTLE }}>We'll respond within 4 business hours.</p>
        </div>
      )}
    </DemoShell>
  );
}
