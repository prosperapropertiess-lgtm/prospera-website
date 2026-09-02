"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Design tokens (matches demo portal) ─────────────────────────────────────
const NAVY    = "#1F2F3A";
const BURGUNDY = "#8B2030";
const GREEN   = "#0A7A52";
const AMBER   = "#B45309";
const BG_CARD = "#FFFFFF";
const BORDER  = "rgba(15,28,40,0.08)";
const MUTED   = "rgba(15,28,40,0.45)";
const SUBTLE  = "rgba(15,28,40,0.65)";
const SHADOW  = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

// ── Animated counter ─────────────────────────────────────────────────────────
function CountUp({ target, prefix = "", suffix = "", duration = 1400 }: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            // ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {prefix}{value.toLocaleString("en-CA")}{suffix}
    </span>
  );
}

// ── Occupancy badge ──────────────────────────────────────────────────────────
function OccupancyBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: GREEN,
          boxShadow: `0 0 0 3px rgba(10,122,82,0.18)`,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: GREEN, fontWeight: 600 }}>
        Occupied · 7 months remaining on lease
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function PortalPreview() {
  return (
    <section style={{ backgroundColor: NAVY, padding: "clamp(64px,8vw,100px) clamp(20px,4vw,60px)" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <p style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.13em",
            color: "rgba(250,248,245,0.45)",
            marginBottom: "12px",
          }}>
            Experience Prospera
          </p>
          <h2 style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(32px,5vw,56px)",
            fontWeight: 700,
            color: "#FAF8F5",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "14px",
          }}>
            See exactly what you get<br />before committing to anything.
          </h2>
          <p style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "clamp(15px,2vw,18px)",
            color: "rgba(250,248,245,0.6)",
            lineHeight: 1.7,
            maxWidth: "520px",
          }}>
            This is a live preview of your owner dashboard. Real numbers, real layout. No login required.
          </p>
        </div>

        {/* Dashboard shell */}
        <div style={{
          backgroundColor: "#F5F4F1",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>

          {/* Fake top bar */}
          <div style={{
            backgroundColor: NAVY,
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: BURGUNDY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700, fontFamily: "var(--font-dm-sans)" }}>P</span>
              </div>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", fontWeight: 700, color: "#FAF8F5" }}>Prospera Owner Portal</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: GREEN, boxShadow: "0 0 0 3px rgba(10,122,82,0.2)", display: "inline-block" }} />
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "rgba(250,248,245,0.55)" }}>Live</span>
            </div>
          </div>

          {/* Dashboard body */}
          <div style={{ padding: "clamp(20px,4vw,32px)", display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Greeting */}
            <div>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED, marginBottom: "2px" }}>Good morning,</p>
              <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "24px", fontWeight: 700, color: NAVY, letterSpacing: "-0.01em" }}>Michael.</p>
            </div>

            {/* ── CARD 1: Rent collected (animated) ── */}
            <div style={{
              backgroundColor: BG_CARD,
              border: `1px solid ${BORDER}`,
              borderTop: `3px solid ${GREEN}`,
              borderRadius: "16px",
              padding: "20px 24px",
              boxShadow: SHADOW,
            }}>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "6px" }}>
                July 2026
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(36px,7vw,52px)", fontWeight: 700, color: NAVY, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  <CountUp target={2400} prefix="$" duration={1600} />
                </p>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED }}>collected</p>
              </div>
              <OccupancyBadge />
            </div>

            {/* ── CARD 2: YTD stats + occupancy ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px" }}>
              {[
                { label: "YTD Collected", value: 14400, color: NAVY, prefix: "$" },
                { label: "YTD Expenses",  value: 1840,  color: AMBER, prefix: "$" },
                { label: "YTD Net",       value: 12560, color: GREEN, prefix: "$" },
              ].map(c => (
                <div key={c.label} style={{
                  backgroundColor: BG_CARD,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "12px",
                  padding: "14px 12px",
                  boxShadow: SHADOW,
                }}>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "9px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: "6px" }}>{c.label}</p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "clamp(15px,3vw,20px)", fontWeight: 800, color: c.color, letterSpacing: "-0.01em" }}>
                    <CountUp target={c.value} prefix={c.prefix} duration={1800} />
                  </p>
                </div>
              ))}
            </div>

            {/* ── CARD 3: Year-end projection ── */}
            <div style={{
              backgroundColor: BG_CARD,
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${GREEN}`,
              borderRadius: "16px",
              padding: "18px 22px",
              boxShadow: SHADOW,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}>
              <div>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "4px" }}>
                  On track for 2026
                </p>
                <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(26px,5vw,36px)", fontWeight: 700, color: GREEN, letterSpacing: "-0.02em" }}>
                  +<CountUp target={25120} prefix="$" duration={2000} />
                </p>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED, marginTop: "2px" }}>
                  projected net · avg $2,093 / mo
                </p>
              </div>
              <div style={{
                backgroundColor: "rgba(10,122,82,0.07)",
                border: "1px solid rgba(10,122,82,0.15)",
                borderRadius: "10px",
                padding: "10px 16px",
                textAlign: "center",
              }}>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: GREEN, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>Based on</p>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "20px", fontWeight: 800, color: GREEN }}>6</p>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: GREEN }}>months</p>
              </div>
            </div>

          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "36px", flexWrap: "wrap" }}>
          <Link
            href="/demo/owner"
            style={{
              display: "inline-block",
              backgroundColor: BURGUNDY,
              color: "#FAF8F5",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "16px 32px",
              borderRadius: "10px",
            }}
          >
            Explore the full portal →
          </Link>
          <Link
            href="/demo/tenant"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "13px",
              color: "rgba(250,248,245,0.55)",
              textDecoration: "none",
            }}
          >
            Or see the tenant view →
          </Link>
        </div>

      </div>
    </section>
  );
}
